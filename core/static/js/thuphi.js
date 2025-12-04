document.addEventListener('DOMContentLoaded', function(){
    const households = [
        { id: 'HK-001', chu: 'Nguyễn Văn A', members: 4 },
        { id: 'HK-002', chu: 'Trần Thị B', members: 3 },
        { id: 'HK-003', chu: 'Lê Văn C', members: 5 },
        { id: 'HK-004', chu: 'Phạm Thị D', members: 2 },
        { id: 'HK-005', chu: 'Hoàng Văn E', members: 6 }
    ];
    const unit = 6000; // 6.000đ / người / tháng

    const feeList = document.getElementById('feeList');

    function formatVnd(n){ return n.toLocaleString('vi-VN') + 'đ'; }
    
    // Initialize household dropdown
    function initializeHouseholdDropdown() {
        const householdSelect = document.getElementById('donationHousehold');
        if (!householdSelect) return;
        
        // Clear existing options except the first one
        while (householdSelect.children.length > 1) {
            householdSelect.removeChild(householdSelect.lastChild);
        }
        
        // Add households from data
        households.forEach(h => {
            const option = document.createElement('option');
            option.value = h.id;
            option.textContent = `${h.id} - ${h.chu} (${h.members} người)`;
            householdSelect.appendChild(option);
        });
    }
    
    // Initialize dropdown on page load
    initializeHouseholdDropdown();

    // Tab switching functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.fee-panel').forEach(p => p.classList.remove('active'));
            const tab = btn.dataset.tab;
            const el = document.getElementById('tab-' + tab);
            if (el) el.classList.add('active');
        });
    });

    // Generate fee receipts for all households
    const addFeeBtn = document.getElementById('addFee');
    if (addFeeBtn) {
        addFeeBtn.addEventListener('click', function(){
            if (!confirm('Tạo phiếu thu cho tháng này cho tất cả hộ gia đình?')) return;
            
            const currentMonth = new Date().toLocaleDateString('vi-VN',{year:'numeric', month:'2-digit'});
            
            households.forEach(h => {
                const total = h.members * unit;
                if (!feeList) return;
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${h.id}</td>
                                <td>${h.chu}</td>
                                <td>${h.members}</td>
                                <td>${currentMonth}</td>
                                <td>${formatVnd(total)}</td>
                                <td><span class="status unpaid clickable" onclick="toggleStatus(this)">Chưa thu</span></td>`;
                feeList.prepend(tr);
            });
            
            alert('Đã tạo phiếu thu cho tất cả hộ gia đình!');
        });
    }

    // Print functionality
    const printFeeBtn = document.getElementById('printFee');
    if (printFeeBtn) {
        printFeeBtn.addEventListener('click', function(){
            const panel = document.querySelector('#tab-fee .table-container');
            if (!panel) return;
            const win = window.open('', '_blank');
            win.document.write(`
                <html>
                    <head>
                        <title>Danh sách phiếu thu</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h3 { color: #333; text-align: center; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                            th { background-color: #f5f5f5; font-weight: bold; }
                            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
                            .paid { background: #dcfce7; color: #166534; }
                            .unpaid { background: #fef2f2; color: #dc2626; }
                        </style>
                    </head>
                    <body>
                        <h3>Danh sách phiếu thu phí vệ sinh</h3>
                        ${panel.outerHTML}
                    </body>
                </html>
            `);
            win.print();
            win.close();
        });
    }

    // Donation functionality placeholder
    const addDonationBtn = document.getElementById('addDonation');
    const printDonationBtn = document.getElementById('printDonation');
    
    if (addDonationBtn) {
        addDonationBtn.addEventListener('click', function(){
            const donationType = document.getElementById('donationType').value;
            const donationHousehold = document.getElementById('donationHousehold').value;
            const donationAmount = document.getElementById('donationAmount').value;
            
            if (!donationType) {
                alert('Vui lòng chọn đợt đóng góp!');
                return;
            }
            
            if (!donationHousehold) {
                alert('Vui lòng chọn hộ gia đình!');
                return;
            }
            
            if (!donationAmount || parseInt(donationAmount) <= 0) {
                alert('Vui lòng nhập số tiền đóng góp hợp lệ!');
                return;
            }
            
            // Get campaign name and household info from selected options
            const campaignOption = document.getElementById('donationType').selectedOptions[0];
            const householdOption = document.getElementById('donationHousehold').selectedOptions[0];
            
            const campaignName = campaignOption ? campaignOption.textContent : '';
            const householdInfo = householdOption ? householdOption.textContent : '';
            
            const formattedAmount = parseInt(donationAmount).toLocaleString('vi-VN') + 'đ';
            
            // Update donation statistics
            updateDonationStatistics(donationType, parseInt(donationAmount));
            
            alert(`Đã ghi nhận đóng góp:\n` +
                  `- Đợt: ${campaignName}\n` +
                  `- Hộ gia đình: ${householdInfo}\n` +
                  `- Số tiền: ${formattedAmount}`);
            
            // Clear form
            document.getElementById('donationType').value = '';
            document.getElementById('donationHousehold').value = '';
            document.getElementById('donationAmount').value = '';
        });
    }
    
    if (printDonationBtn) {
        printDonationBtn.addEventListener('click', function(){
            alert('Chức năng in biên nhận đang được phát triển!');
        });
    }
});

// Global function for status toggling
function toggleStatus(statusElement) {
    const isPaid = statusElement.classList.contains('paid');
    
    if (isPaid) {
        // Change from "Đã thu" to "Chưa thu"
        statusElement.classList.remove('paid');
        statusElement.classList.add('unpaid');
        statusElement.textContent = 'Chưa thu';
    } else {
        // Change from "Chưa thu" to "Đã thu"
        statusElement.classList.remove('unpaid');
        statusElement.classList.add('paid');
        statusElement.textContent = 'Đã thu';
    }
    
    // Visual feedback
    statusElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        statusElement.style.transform = 'scale(1)';
    }, 150);
    
    // Optional: Show notification
    const status = statusElement.textContent;
    const row = statusElement.closest('tr');
    const houseId = row.cells[0].textContent;
    const chuHo = row.cells[1].textContent;
    
    console.log(`Cập nhật trạng thái: ${houseId} (${chuHo}) - ${status}`);
}

// Modal functions
function showCreateCampaignModal() {
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.style.display = 'block';
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
        
        document.getElementById('startDate').value = today;
        document.getElementById('endDate').value = nextWeek;
        document.getElementById('campaignStatus').value = 'planned';
    }
}

function closeCreateCampaignModal() {
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('createCampaignForm').reset();
    }
}

// Initialize modal event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show modal button
    const showModalBtn = document.getElementById('showCreateCampaignForm');
    if (showModalBtn) {
        showModalBtn.addEventListener('click', showCreateCampaignModal);
    }
    
    // Close modal when clicking X
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCreateCampaignModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCreateCampaignModal();
            }
        });
    }
    
    // Handle form submission
    const form = document.getElementById('createCampaignForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const campaignData = {};
            
            // Collect form data
            for (let [key, value] of formData.entries()) {
                campaignData[key] = value;
            }
            
            // Validate required fields
            if (!campaignData.campaignName || !campaignData.startDate || 
                !campaignData.endDate || !campaignData.campaignType) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }
            
            // Validate date range
            const startDate = new Date(campaignData.startDate);
            const endDate = new Date(campaignData.endDate);
            
            if (endDate <= startDate) {
                alert('Ngày kết thúc phải sau ngày bắt đầu!');
                return;
            }
            
            // Process the campaign creation
            console.log('Tạo đợt đóng góp:', campaignData);
            
            // Add to the donation list (mock)
            addCampaignToList(campaignData);
            
            alert('Tạo đợt đóng góp thành công!');
            closeCreateCampaignModal();
        });
    }
});

function addCampaignToList(campaignData) {
    const donationList = document.getElementById('donationList');
    if (!donationList) return;
    
    const tr = document.createElement('tr');
    const targetAmount = campaignData.targetAmount ? 
        parseInt(campaignData.targetAmount).toLocaleString('vi-VN') + 'đ' : 
        'Không giới hạn';
    
    // Set data attribute for tracking
    const campaignId = campaignData.campaignName.toLowerCase().replace(/\s+/g, '_');
    tr.setAttribute('data-campaign-id', campaignId);
    
    tr.innerHTML = `
        <td>${campaignData.campaignName}</td>
        <td>0 hộ</td>
        <td>0đ / ${targetAmount}</td>
        <td><button class="btn-sm" onclick="showCampaignDetails('${campaignId}')">Chi tiết</button></td>
    `;
    
    // Insert at the beginning of the list
    donationList.insertBefore(tr, donationList.firstChild);
    
    // Add to dropdown selection
    const donationTypeSelect = document.getElementById('donationType');
    if (donationTypeSelect) {
        const option = document.createElement('option');
        option.value = campaignId;
        option.textContent = campaignData.campaignName;
        donationTypeSelect.appendChild(option);
    }
}

// Function to update donation statistics in the table
function updateDonationStatistics(campaignId, amount) {
    const donationList = document.getElementById('donationList');
    if (!donationList) return;
    
    // Find the row for this campaign by data-campaign-id or by matching name
    let campaignRow = null;
    const rows = donationList.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // First check by data attribute
        if (row.getAttribute('data-campaign-id') === campaignId) {
            campaignRow = row;
            break;
        }
        
        // Fallback: check by campaign name matching
        const campaignCell = row.cells[0];
        if (campaignCell) {
            const campaignOption = document.querySelector(`#donationType option[value="${campaignId}"]`);
            const campaignName = campaignOption ? campaignOption.textContent : '';
            
            if (campaignCell.textContent === campaignName) {
                campaignRow = row;
                // Set data attribute for future updates
                row.setAttribute('data-campaign-id', campaignId);
                break;
            }
        }
    }
    
    if (campaignRow) {
        // Update existing campaign
        const participantsCell = campaignRow.cells[1];
        const amountCell = campaignRow.cells[2];
        
        // Extract current numbers
        const currentParticipants = parseInt(participantsCell.textContent.replace(/\D/g, '')) || 0;
        const currentAmountText = amountCell.textContent.split('/')[0].trim();
        const currentAmount = parseInt(currentAmountText.replace(/\D/g, '')) || 0;
        
        // Update with new values
        const newParticipants = currentParticipants + 1;
        const newAmount = currentAmount + amount;
        
        participantsCell.textContent = `${newParticipants} hộ`;
        
        // Keep target amount if it exists
        const targetPart = amountCell.textContent.includes('/') ? 
            ' / ' + amountCell.textContent.split('/')[1].trim() : '';
        
        amountCell.textContent = newAmount.toLocaleString('vi-VN') + 'đ' + targetPart;
        
        // Visual feedback
        campaignRow.style.backgroundColor = '#e8f5e8';
        setTimeout(() => {
            campaignRow.style.backgroundColor = '';
        }, 2000);
    }
}

// Function to show campaign details (placeholder)
function showCampaignDetails(campaignId) {
    alert(`Chi tiết đợt đóng góp: ${campaignId}\n\nChức năng đang được phát triển!`);
}