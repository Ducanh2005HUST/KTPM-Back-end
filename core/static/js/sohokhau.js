document.addEventListener('DOMContentLoaded', function() {
    // Sample data - sẽ được thay thế bằng API calls
    let households = [
        { 
            id: 'HK-001', 
            code: 'HK-001',
            head_name: 'Nguyễn Văn A', 
            address: 'Số 12, Đường X, La Khê',
            member_count: 4,
            created_at: '2025-01-15'
        },
        { 
            id: 'HK-002', 
            code: 'HK-002',
            head_name: 'Trần Thị B', 
            address: 'Số 34, Ngõ Y, La Khê',
            member_count: 3,
            created_at: '2025-01-20'
        },
        { 
            id: 'HK-003', 
            code: 'HK-003',
            head_name: 'Lê Văn C', 
            address: 'Số 56, Phố Z, La Khê',
            member_count: 5,
            created_at: '2025-02-01'
        }
    ];

    let filteredHouseholds = [...households];

    // DOM elements
    const searchInput = document.getElementById('searchHousehold');
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    const advancedSearch = document.getElementById('advancedSearch');
    const addHouseholdBtn = document.getElementById('addHouseholdBtn');
    const householdModal = document.getElementById('householdModal');
    const personModal = document.getElementById('personModal');
    const householdList = document.getElementById('householdList');
    const householdCount = document.getElementById('householdCount');

    // Initialize
    updateHouseholdList();
    updateHouseholdCount();

    // Event listeners
    searchInput.addEventListener('input', handleSearch);
    advancedSearchBtn.addEventListener('click', toggleAdvancedSearch);
    addHouseholdBtn.addEventListener('click', showAddHouseholdForm);
    
    // Filter inputs
    document.getElementById('applyFilters').addEventListener('click', applyAdvancedFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredHouseholds = [...households];
        } else {
            filteredHouseholds = households.filter(household =>
                household.code.toLowerCase().includes(searchTerm) ||
                household.head_name.toLowerCase().includes(searchTerm) ||
                household.address.toLowerCase().includes(searchTerm)
            );
        }
        
        updateHouseholdList();
        updateHouseholdCount();
    }

    function toggleAdvancedSearch() {
        const isVisible = advancedSearch.style.display !== 'none';
        advancedSearch.style.display = isVisible ? 'none' : 'block';
        advancedSearchBtn.innerHTML = isVisible ? 
            '<i class="fas fa-filter"></i> Tìm kiếm nâng cao' : 
            '<i class="fas fa-times"></i> Đóng tìm kiếm';
    }

    function applyAdvancedFilters() {
        const codeFilter = document.getElementById('filterCode').value.toLowerCase();
        const nameFilter = document.getElementById('filterHeadName').value.toLowerCase();
        const addressFilter = document.getElementById('filterAddress').value.toLowerCase();

        filteredHouseholds = households.filter(household => {
            return (!codeFilter || household.code.toLowerCase().includes(codeFilter)) &&
                   (!nameFilter || household.head_name.toLowerCase().includes(nameFilter)) &&
                   (!addressFilter || household.address.toLowerCase().includes(addressFilter));
        });

        updateHouseholdList();
        updateHouseholdCount();
    }

    function clearFilters() {
        document.getElementById('filterCode').value = '';
        document.getElementById('filterHeadName').value = '';
        document.getElementById('filterAddress').value = '';
        searchInput.value = '';
        filteredHouseholds = [...households];
        updateHouseholdList();
        updateHouseholdCount();
    }

    function updateHouseholdList() {
        householdList.innerHTML = '';
        
        filteredHouseholds.forEach(household => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${household.code}</strong></td>
                <td>${household.head_name}</td>
                <td>${household.address}</td>
                <td>${household.member_count} người</td>
                <td>
                    <button class="btn-sm" onclick="viewHousehold('${household.code}')">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn-sm" onclick="editHousehold('${household.code}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                </td>
            `;
            householdList.appendChild(row);
        });

        if (filteredHouseholds.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" style="text-align: center; color: #6b7280; padding: 20px;">
                    <i class="fas fa-search"></i> Không tìm thấy hộ khẩu nào
                </td>
            `;
            householdList.appendChild(row);
        }
    }

    function updateHouseholdCount() {
        householdCount.textContent = filteredHouseholds.length;
    }

    // Modal functions
    window.showAddHouseholdForm = function() {
        document.getElementById('modalTitle').textContent = 'Tạo hộ khẩu mới';
        document.getElementById('householdForm').reset();
        householdModal.style.display = 'flex';
    }

    window.showAddPersonForm = function() {
        personModal.style.display = 'flex';
    }

    window.closeModal = function() {
        householdModal.style.display = 'none';
    }

    window.closePersonModal = function() {
        personModal.style.display = 'none';
    }

    window.saveHousehold = function() {
        const code = document.getElementById('householdCode').value;
        const headName = document.getElementById('headName').value;
        const address = document.getElementById('householdAddress').value;

        if (!code || !headName || !address) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Check if code already exists
        if (households.find(h => h.code === code)) {
            alert('Mã hộ khẩu đã tồn tại!');
            return;
        }

        // Add new household
        const newHousehold = {
            id: code,
            code: code,
            head_name: headName,
            address: address,
            member_count: 1, // Chủ hộ
            created_at: new Date().toISOString().split('T')[0]
        };

        households.push(newHousehold);
        filteredHouseholds = [...households];
        updateHouseholdList();
        updateHouseholdCount();
        closeModal();

        // Show success message
        showSuccessMessage('Tạo hộ khẩu thành công!');
    }

    window.savePerson = function() {
        const householdId = document.getElementById('personHousehold').value;
        const fullName = document.getElementById('personFullName').value;
        const dob = document.getElementById('personDob').value;
        const gender = document.getElementById('personGender').value;

        if (!householdId || !fullName || !dob || !gender) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Update member count
        const household = households.find(h => h.code === householdId);
        if (household) {
            household.member_count++;
        }

        filteredHouseholds = [...households];
        updateHouseholdList();
        closePersonModal();

        // Show success message
        showSuccessMessage('Thêm nhân khẩu thành công!');
    }

    window.viewHousehold = function(code) {
        const household = households.find(h => h.code === code);
        if (household) {
            alert(`Xem chi tiết hộ khẩu: ${household.code}\nChủ hộ: ${household.head_name}\nĐịa chỉ: ${household.address}\nSố nhân khẩu: ${household.member_count}`);
        }
    }

    window.editHousehold = function(code) {
        const household = households.find(h => h.code === code);
        if (household) {
            document.getElementById('modalTitle').textContent = 'Chỉnh sửa hộ khẩu';
            document.getElementById('householdCode').value = household.code;
            document.getElementById('householdCode').readOnly = true;
            document.getElementById('headName').value = household.head_name;
            document.getElementById('householdAddress').value = household.address;
            householdModal.style.display = 'flex';
        }
    }

    window.exportHouseholds = function() {
        // Simple CSV export
        let csv = 'Mã hộ khẩu,Chủ hộ,Địa chỉ,Số nhân khẩu,Ngày tạo\n';
        filteredHouseholds.forEach(household => {
            csv += `${household.code},"${household.head_name}","${household.address}",${household.member_count},${household.created_at}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'danh_sach_ho_khau.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showSuccessMessage(message) {
        // Simple alert for now - có thể thay thế bằng toast notification
        alert(message);
    }

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target === householdModal) {
            closeModal();
        }
        if (event.target === personModal) {
            closePersonModal();
        }
    }
});