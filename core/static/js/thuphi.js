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
            const donationType = document.getElementById('donationType').value.trim();
            const donationHousehold = document.getElementById('donationHousehold').value.trim();
            const donationAmount = document.getElementById('donationAmount').value;
            
            if (!donationType || !donationHousehold || !donationAmount) {
                alert('Vui lòng điền đầy đủ thông tin!');
                return;
            }
            
            alert('Đã ghi nhận đóng góp thành công!');
            
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