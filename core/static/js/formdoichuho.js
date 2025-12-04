// Form đổi chủ hộ - JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.getElementById('changeHeadForm');
    const householdSelect = document.getElementById('householdCode');
    const newHeadSelect = document.getElementById('newHeadId');
    const changeDateInput = document.getElementById('changeDate');
    const previewBtn = document.getElementById('previewBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Data storage
    let householdsData = [];
    let currentHouseholdData = null;
    let currentMembers = [];

    // Initialize
    init();

    async function init() {
        try {
            setDefaultDate();
            await loadHouseholds();
            setupEventListeners();
            checkUrlParameters();
        } catch (error) {
            console.error('Initialization error:', error);
            showMessage('Có lỗi xảy ra khi khởi tạo form!', 'error');
        }
    }

    function setDefaultDate() {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        changeDateInput.value = dateStr;
    }

    async function loadHouseholds() {
        try {
            showLoading(householdSelect);
            
            const response = await fetch('/api/households/');
            if (!response.ok) throw new Error('Failed to fetch households');
            
            const data = await response.json();
            householdsData = data.results || data;
            
            // Populate household select
            householdSelect.innerHTML = '<option value="">-- Chọn hộ khẩu --</option>';
            householdsData.forEach(household => {
                const option = document.createElement('option');
                option.value = household.code;
                option.textContent = `${household.code} - ${household.head_name}`;
                householdSelect.appendChild(option);
            });
            
            hideLoading(householdSelect);
        } catch (error) {
            console.error('Error loading households:', error);
            hideLoading(householdSelect);
            showMessage('Không thể tải danh sách hộ khẩu!', 'error');
        }
    }

    function setupEventListeners() {
        householdSelect.addEventListener('change', handleHouseholdChange);
        newHeadSelect.addEventListener('change', handleNewHeadChange);
        form.addEventListener('submit', handleFormSubmit);
        previewBtn.addEventListener('click', showPreview);
        resetBtn.addEventListener('click', resetForm);
        
        // Modal event listeners
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                closePreviewModal();
            }
        });
    }

    function checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const householdCode = urlParams.get('household');
        
        if (householdCode) {
            householdSelect.value = householdCode;
            handleHouseholdChange();
        }
    }

    async function handleHouseholdChange() {
        const selectedCode = householdSelect.value;
        
        if (!selectedCode) {
            hideHouseholdInfo();
            hideCurrentHeadInfo();
            clearNewHeadOptions();
            return;
        }

        try {
            showLoading(document.querySelector('[data-step="1"] .step-content'));
            
            // Get household details
            currentHouseholdData = householdsData.find(h => h.code === selectedCode);
            if (!currentHouseholdData) {
                throw new Error('Household not found');
            }

            // Fetch members
            const response = await fetch(`/api/households/${selectedCode}/members/`);
            if (!response.ok) throw new Error('Failed to fetch members');
            
            const result = await response.json();
            currentMembers = result.results || result;
            
            // Display household info
            displayHouseholdInfo(currentHouseholdData);
            
            // Display current head info
            displayCurrentHeadInfo();
            
            // Load eligible members for new head
            loadEligibleMembers();
            
            hideLoading(document.querySelector('[data-step="1"] .step-content'));
            
        } catch (error) {
            console.error('Error loading household data:', error);
            hideLoading(document.querySelector('[data-step="1"] .step-content'));
            showMessage('Không thể tải thông tin hộ khẩu!', 'error');
            hideHouseholdInfo();
            hideCurrentHeadInfo();
            clearNewHeadOptions();
        }
    }

    function displayHouseholdInfo(household) {
        const householdInfo = document.getElementById('householdInfo');
        const householdDetails = document.getElementById('householdDetails');
        
        householdDetails.innerHTML = `
            <div class="info-row">
                <span class="info-label">Mã hộ khẩu:</span>
                <span class="info-value"><strong>${household.code}</strong></span>
            </div>
            <div class="info-row">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value">${household.address}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ngày tạo:</span>
                <span class="info-value">${formatDate(household.created_at)}</span>
            </div>
        `;
        
        householdInfo.style.display = 'block';
    }

    function displayCurrentHeadInfo() {
        const currentHead = currentMembers.find(member => member.is_head);
        const currentHeadInfo = document.getElementById('currentHeadInfo');
        const currentHeadDetails = document.getElementById('currentHeadDetails');
        
        if (!currentHead) {
            currentHeadDetails.innerHTML = `
                <div class="info-row">
                    <span class="info-value" style="color: #d32f2f;">
                        <i class="fas fa-exclamation-triangle"></i>
                        Không tìm thấy chủ hộ hiện tại
                    </span>
                </div>
            `;
        } else {
            currentHeadDetails.innerHTML = `
                <div class="info-row">
                    <span class="info-label">Họ tên:</span>
                    <span class="info-value"><strong>${currentHead.full_name}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ngày sinh:</span>
                    <span class="info-value">${formatDate(currentHead.dob)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Giới tính:</span>
                    <span class="info-value">${getGenderText(currentHead.gender)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">CMND/CCCD:</span>
                    <span class="info-value">${currentHead.id_number || 'Chưa có'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Nghề nghiệp:</span>
                    <span class="info-value">${currentHead.occupation || 'Chưa có'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Quan hệ:</span>
                    <span class="info-value">${currentHead.relation_to_head || 'Chủ hộ'}</span>
                </div>
            `;
        }
        
        currentHeadInfo.style.display = 'block';
    }

    function loadEligibleMembers() {
        const eligibleMembers = currentMembers.filter(member => {
            return !member.is_head && isEligibleToBeHead(member);
        });

        newHeadSelect.innerHTML = '<option value="">-- Chọn thành viên --</option>';
        
        if (eligibleMembers.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '-- Không có thành viên đủ điều kiện --';
            option.disabled = true;
            newHeadSelect.appendChild(option);
            showMessage('Hộ khẩu này không có thành viên nào đủ điều kiện làm chủ hộ (≥18 tuổi)!', 'warning');
        } else {
            eligibleMembers.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = `${member.full_name} (${member.relation_to_head || 'Thành viên'})`;
                option.dataset.memberData = JSON.stringify(member);
                newHeadSelect.appendChild(option);
            });
        }
    }

    function isEligibleToBeHead(member) {
        if (!member.dob) return false;
        
        const birthDate = new Date(member.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    }

    function handleNewHeadChange() {
        const selectedOption = newHeadSelect.options[newHeadSelect.selectedIndex];
        const newHeadInfo = document.getElementById('newHeadInfo');
        const newHeadDetails = document.getElementById('newHeadDetails');
        
        if (!selectedOption.value || !selectedOption.dataset.memberData) {
            newHeadInfo.style.display = 'none';
            return;
        }

        const member = JSON.parse(selectedOption.dataset.memberData);
        
        newHeadDetails.innerHTML = `
            <div class="info-row">
                <span class="info-label">Họ tên:</span>
                <span class="info-value"><strong>${member.full_name}</strong></span>
            </div>
            <div class="info-row">
                <span class="info-label">Ngày sinh:</span>
                <span class="info-value">${formatDate(member.dob)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tuổi:</span>
                <span class="info-value">${calculateAge(member.dob)} tuổi</span>
            </div>
            <div class="info-row">
                <span class="info-label">Giới tính:</span>
                <span class="info-value">${getGenderText(member.gender)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">CMND/CCCD:</span>
                <span class="info-value">${member.id_number || 'Chưa có'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Nghề nghiệp:</span>
                <span class="info-value">${member.occupation || 'Chưa có'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Quan hệ hiện tại:</span>
                <span class="info-value">${member.relation_to_head || 'Thành viên'}</span>
            </div>
        `;
        
        newHeadInfo.style.display = 'block';
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        if (!document.getElementById('finalConfirmation').checked) {
            showMessage('Vui lòng xác nhận đã kiểm tra thông tin!', 'warning');
            return;
        }

        if (!confirm('Xác nhận thực hiện thay đổi chủ hộ?')) {
            return;
        }

        try {
            showLoading(form);
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            const response = await fetch('/formdoichuho/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            hideLoading(form);
            
            if (result.status === 'success') {
                showMessage('✅ Đã thay đổi chủ hộ thành công!', 'success');
                setTimeout(() => {
                    window.location.href = '/sohokhau/';
                }, 2000);
            } else {
                showMessage(result.message || 'Có lỗi xảy ra khi lưu dữ liệu!', 'error');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            hideLoading(form);
            showMessage('Có lỗi xảy ra khi lưu dữ liệu!', 'error');
        }
    }

    function validateForm() {
        const requiredFields = [
            { id: 'householdCode', name: 'Mã hộ khẩu' },
            { id: 'newHeadId', name: 'Thành viên mới' },
            { id: 'changeDate', name: 'Ngày thay đổi' },
            { id: 'changeReason', name: 'Lý do thay đổi' },
            { id: 'performedBy', name: 'Người thực hiện' }
        ];

        let isValid = true;
        
        // Clear previous validation
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });

        // Validate required fields
        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            const formGroup = element.closest('.form-group');
            
            if (!element.value.trim()) {
                showFieldError(formGroup, `${field.name} là bắt buộc`);
                isValid = false;
            } else {
                formGroup.classList.add('success');
            }
        }

        // Validate date
        const changeDate = new Date(document.getElementById('changeDate').value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        if (changeDate > today) {
            const formGroup = document.getElementById('changeDate').closest('.form-group');
            showFieldError(formGroup, 'Ngày thay đổi không được trong tương lai');
            isValid = false;
        }

        // Show validation summary
        if (!isValid) {
            showMessage('Vui lòng kiểm tra và điền đầy đủ thông tin bắt buộc!', 'error');
        }

        return isValid;
    }

    function showFieldError(formGroup, message) {
        formGroup.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        formGroup.appendChild(errorDiv);
    }

    function showPreview() {
        if (!validateForm()) {
            return;
        }

        if (!currentHouseholdData || !currentMembers.length) {
            showMessage('Vui lòng chọn hộ khẩu trước!', 'warning');
            return;
        }

        const selectedNewHeadOption = newHeadSelect.options[newHeadSelect.selectedIndex];
        if (!selectedNewHeadOption.dataset.memberData) {
            showMessage('Vui lòng chọn thành viên làm chủ hộ mới!', 'warning');
            return;
        }

        const currentHead = currentMembers.find(m => m.is_head);
        const newHead = JSON.parse(selectedNewHeadOption.dataset.memberData);
        
        const changeDate = document.getElementById('changeDate').value;
        const reason = document.getElementById('changeReason');
        const performedBy = document.getElementById('performedBy').value;
        const approvalDoc = document.getElementById('approvalDocument').value;
        const notes = document.getElementById('notes').value;

        const previewContent = `
            <div class="preview-section">
                <div class="preview-header">
                    <i class="fas fa-home"></i> Thông tin hộ khẩu
                </div>
                <div class="preview-content">
                    <div class="preview-row">
                        <span class="preview-label">Mã hộ khẩu:</span>
                        <span class="preview-value"><strong>${currentHouseholdData.code}</strong></span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Địa chỉ:</span>
                        <span class="preview-value">${currentHouseholdData.address}</span>
                    </div>
                </div>
            </div>

            <div class="comparison-container">
                <div class="comparison-box current">
                    <div class="comparison-header">
                        <i class="fas fa-user"></i> Chủ hộ hiện tại
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Họ tên:</span>
                        <span class="preview-value">${currentHead ? currentHead.full_name : 'Không xác định'}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Ngày sinh:</span>
                        <span class="preview-value">${currentHead ? formatDate(currentHead.dob) : '--'}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">CMND/CCCD:</span>
                        <span class="preview-value">${currentHead && currentHead.id_number || 'Chưa có'}</span>
                    </div>
                </div>
                
                <div class="comparison-box new">
                    <div class="comparison-header">
                        <i class="fas fa-crown"></i> Chủ hộ mới
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Họ tên:</span>
                        <span class="preview-value">${newHead.full_name}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Ngày sinh:</span>
                        <span class="preview-value">${formatDate(newHead.dob)}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">CMND/CCCD:</span>
                        <span class="preview-value">${newHead.id_number || 'Chưa có'}</span>
                    </div>
                </div>
            </div>

            <div class="preview-section">
                <div class="preview-header">
                    <i class="fas fa-edit"></i> Chi tiết thay đổi
                </div>
                <div class="preview-content">
                    <div class="preview-row">
                        <span class="preview-label">Ngày thay đổi:</span>
                        <span class="preview-value">${formatDate(changeDate)}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Lý do:</span>
                        <span class="preview-value">${reason.options[reason.selectedIndex].text}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Người thực hiện:</span>
                        <span class="preview-value">${performedBy}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Số giấy phép:</span>
                        <span class="preview-value">${approvalDoc || 'Không có'}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Ghi chú:</span>
                        <span class="preview-value">${notes || 'Không có ghi chú'}</span>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('previewContent').innerHTML = previewContent;
        document.getElementById('previewModal').style.display = 'flex';
    }

    function resetForm() {
        if (confirm('Xác nhận reset toàn bộ form? Dữ liệu đã nhập sẽ bị mất.')) {
            form.reset();
            setDefaultDate();
            hideHouseholdInfo();
            hideCurrentHeadInfo();
            document.getElementById('newHeadInfo').style.display = 'none';
            clearNewHeadOptions();
            
            // Clear validation states
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success');
                const errorMsg = group.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            });
            
            showMessage('✅ Đã reset form thành công!', 'success');
        }
    }

    // Utility functions
    function hideHouseholdInfo() {
        document.getElementById('householdInfo').style.display = 'none';
    }

    function hideCurrentHeadInfo() {
        document.getElementById('currentHeadInfo').style.display = 'none';
    }

    function clearNewHeadOptions() {
        newHeadSelect.innerHTML = '<option value="">-- Chọn thành viên --</option>';
        document.getElementById('newHeadInfo').style.display = 'none';
    }

    function formatDate(dateString) {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    function calculateAge(birthDate) {
        if (!birthDate) return '--';
        
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    function getGenderText(gender) {
        const genderMap = {
            'M': 'Nam',
            'F': 'Nữ',
            'O': 'Khác'
        };
        return genderMap[gender] || 'Không xác định';
    }

    function getCsrfToken() {
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function showLoading(element) {
        element.classList.add('loading');
    }

    function hideLoading(element) {
        element.classList.remove('loading');
    }

    function showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = `message ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        messageDiv.innerHTML = `
            <i class="fas ${iconMap[type]}"></i>
            ${message}
        `;
        
        container.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
        
        // Click to dismiss
        messageDiv.addEventListener('click', () => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        });
    }

    // Global functions for modal
    window.closePreviewModal = function() {
        document.getElementById('previewModal').style.display = 'none';
    };

    window.confirmAndSubmit = function() {
        closePreviewModal();
        if (confirm('Xác nhận lưu thông tin thay đổi chủ hộ?')) {
            form.dispatchEvent(new Event('submit'));
        }
    };
});
