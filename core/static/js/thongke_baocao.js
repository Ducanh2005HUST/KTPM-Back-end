document.addEventListener('DOMContentLoaded', function(){
    // Event handlers for new Excel-style interface
    
    // Export to Excel function
    const exportExcelBtn = document.getElementById('exportExcel');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', function(){
            const wb = XLSX.utils.book_new();
            const reportType = document.getElementById('reportType').value;
            
            // Export based on selected report type
            switch(reportType) {
                case 'all':
                    // Export all visible sections
                    exportAllVisibleSections(wb);
                    break;
                    
                case 'nhankhau':
                    // Export both temporary absent and residence
                    const temporaryAbsentTable = document.getElementById('temporaryAbsentTable');
                    if (temporaryAbsentTable && temporaryAbsentTable.closest('.report-section').style.display !== 'none') {
                        const temporaryAbsentWs = XLSX.utils.table_to_sheet(temporaryAbsentTable);
                        XLSX.utils.book_append_sheet(wb, temporaryAbsentWs, 'Danh sách tạm vắng');
                    }
                    
                    const temporaryResidenceTable = document.getElementById('temporaryResidenceTable');
                    if (temporaryResidenceTable && temporaryResidenceTable.closest('.report-section').style.display !== 'none') {
                        const temporaryResidenceWs = XLSX.utils.table_to_sheet(temporaryResidenceTable);
                        XLSX.utils.book_append_sheet(wb, temporaryResidenceWs, 'Danh sách tạm trú');
                    }
                    break;
                    
                case 'tamvang':
                    // Export only temporary absent
                    const tamVangTable = document.getElementById('temporaryAbsentTable');
                    if (tamVangTable) {
                        const tamVangWs = XLSX.utils.table_to_sheet(tamVangTable);
                        XLSX.utils.book_append_sheet(wb, tamVangWs, 'Danh sách tạm vắng');
                    }
                    break;
                    
                case 'tamtru':
                    // Export only temporary residence
                    const tamTruTable = document.getElementById('temporaryResidenceTable');
                    if (tamTruTable) {
                        const tamTruWs = XLSX.utils.table_to_sheet(tamTruTable);
                        XLSX.utils.book_append_sheet(wb, tamTruWs, 'Danh sách tạm trú');
                    }
                    break;
                    
                case 'thuphi':
                    // Export only fee statistics
                    const feeTable = document.getElementById('feeTable');
                    if (feeTable) {
                        const feeWs = XLSX.utils.table_to_sheet(feeTable);
                        XLSX.utils.book_append_sheet(wb, feeWs, 'Thu phí theo tháng');
                    }
                    break;
                    
                case 'donggop':
                    // Export donation related sections
                    const donationSummaryTable = document.getElementById('donationSummaryTable');
                    if (donationSummaryTable && donationSummaryTable.closest('.report-section').style.display !== 'none') {
                        const donationSummaryWs = XLSX.utils.table_to_sheet(donationSummaryTable);
                        XLSX.utils.book_append_sheet(wb, donationSummaryWs, 'Tổng hợp đóng góp');
                    }

                    const donationDetailTable = document.getElementById('donationDetailTable');
                    if (donationDetailTable && donationDetailTable.closest('.report-section').style.display !== 'none') {
                        const donationDetailWs = XLSX.utils.table_to_sheet(donationDetailTable);
                        XLSX.utils.book_append_sheet(wb, donationDetailWs, 'Chi tiết đóng góp');
                    }
                    break;
                    
                default:
                    exportAllVisibleSections(wb);
            }
            
            // Generate filename with current date and report type
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const reportTypeName = getReportTypeName(reportType);
            const filename = `BaoCao_${reportTypeName}_${dateStr}.xlsx`;
            
            // Save the file
            XLSX.writeFile(wb, filename);
            
            // Show success message
            alert(`Đã xuất báo cáo Excel thành công!\nFile: ${filename}`);
        });
    }
    
    // Print Report function
    const printReportBtn = document.getElementById('printReport');
    if (printReportBtn) {
        printReportBtn.addEventListener('click', function(){
            const printWindow = window.open('', '_blank');
            const reportContent = document.querySelector('.reports-container').cloneNode(true);
            
            // Create print-friendly HTML
            const printHTML = `
                <html>
                <head>
                    <title>Báo cáo Thống kê - ${new Date().toLocaleDateString('vi-VN')}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Segoe UI', Arial, sans-serif; 
                            font-size: 12px; 
                            color: #333;
                            line-height: 1.4;
                        }
                        .reports-container { padding: 20px; }
                        .report-section { 
                            margin-bottom: 30px; 
                            page-break-inside: avoid; 
                        }
                        .report-section h3 { 
                            font-size: 16px; 
                            margin-bottom: 10px; 
                            color: #2c5aa0;
                            border-bottom: 2px solid #2c5aa0;
                            padding-bottom: 5px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 15px;
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 8px; 
                            text-align: center; 
                        }
                        th { 
                            background: #f8f9fa; 
                            font-weight: bold; 
                            font-size: 11px;
                        }
                        .total-row td { 
                            background: #fff3cd; 
                            font-weight: bold; 
                        }
                        .rank-1 td { background: #fff3cd; }
                        .rank-2 td { background: #f8f9fa; }
                        .rank-3 td { background: #fff3cd; }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            border-bottom: 3px solid #2c5aa0;
                            padding-bottom: 10px;
                        }
                        .header h1 { color: #2c5aa0; font-size: 20px; }
                        .header p { color: #666; font-size: 14px; margin-top: 5px; }
                        @media print {
                            .report-section { page-break-inside: avoid; }
                            body { print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>📊 BÁO CÁO THỐNG KÊ KHU DÂN CƯ</h1>
                        <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div class="reports-container">
                        ${reportContent.innerHTML}
                    </div>
                </body>
                </html>
            `;
            
            printWindow.document.write(printHTML);
            printWindow.document.close();
            
            // Wait for content to load then print
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        });
    }
    
    // Apply filter function
    const applyBtn = document.getElementById('applyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function(){
            const fromMonth = document.getElementById('fromMonth').value;
            const toMonth = document.getElementById('toMonth').value;
            const reportType = document.getElementById('reportType').value;
            
            // Show/hide sections based on report type
            showReportSections(reportType);
            
            let message = 'Đã áp dụng bộ lọc:\n';
            if (fromMonth) message += `- Từ tháng: ${fromMonth}\n`;
            if (toMonth) message += `- Đến tháng: ${toMonth}\n`;
            message += `- Loại báo cáo: ${getReportTypeName(reportType)}`;
            
            // Show success notification
            showNotification(message, 'success');
        });
    }
    
    // Initialize with 'all' report type
    showReportSections('all');
    
    // Set default month values
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().slice(0, 7);
    
    const fromMonthInput = document.getElementById('fromMonth');
    const toMonthInput = document.getElementById('toMonth');
    
    if (fromMonthInput && toMonthInput) {
        fromMonthInput.value = lastMonth;
        toMonthInput.value = currentMonth;
    }
    
    // Handle donation campaign change
    const donationCampaignSelect = document.getElementById('donationCampaign');
    if (donationCampaignSelect) {
        donationCampaignSelect.addEventListener('change', function() {
            updateDonationDetail(this.value);
        });
    }
});

// Function to update donation detail table based on selected campaign
function updateDonationDetail(campaignId) {
    const detailSection = document.querySelector('#donationDetailTable').closest('.report-section');
    const campaignData = {
        'thuongbinh': {
            name: 'Ủng hộ ngày thương binh-liệt sỹ 27/07',
            data: [
                ['1', 'HK-001', 'Nguyễn Văn A', '4', '15/07/2025', '200.000đ', 'Trần Thị C', 'Đóng góp đầy đủ'],
                ['2', 'HK-002', 'Trần Thị B', '3', '16/07/2025', '150.000đ', 'Trần Thị C', '-'],
                ['3', 'HK-003', 'Lê Văn C', '5', '17/07/2025', '100.000đ', 'Nguyễn Văn D', 'Gia đình khó khăn'],
                ['4', 'HK-004', 'Phạm Thị D', '2', '18/07/2025', '300.000đ', 'Trần Thị C', 'Đóng góp tích cực'],
                ['5', 'HK-005', 'Hoàng Văn E', '6', '20/07/2025', '250.000đ', 'Nguyễn Văn D', '-'],
                ['6', 'HK-006', 'Vũ Thị F', '4', '-', 'Chưa đóng', '-', 'Cần liên hệ lại'],
                ['7', 'HK-007', 'Đặng Văn G', '3', '22/07/2025', '180.000đ', 'Trần Thị C', '-']
            ]
        },
        'treem': {
            name: 'Quỹ từ thiện trẻ em',
            data: [
                ['1', 'HK-001', 'Nguyễn Văn A', '4', '05/09/2025', '150.000đ', 'Lê Văn H', '-'],
                ['2', 'HK-003', 'Lê Văn C', '5', '06/09/2025', '200.000đ', 'Lê Văn H', 'Có con nhỏ'],
                ['3', 'HK-008', 'Ngô Thị I', '2', '08/09/2025', '100.000đ', 'Trần Thị C', '-'],
                ['4', 'HK-012', 'Bùi Văn K', '6', '10/09/2025', '300.000đ', 'Lê Văn H', 'Ủng hộ nhiệt tình'],
                ['5', 'HK-002', 'Trần Thị B', '3', '-', 'Chưa đóng', '-', 'Gia đình khó khăn']
            ]
        }
    };
    
    const selectedData = campaignData[campaignId] || campaignData['thuongbinh'];
    
    // Update section title
    detailSection.querySelector('h3').textContent = `📋 Chi tiết đóng góp từng hộ - Đợt: ${selectedData.name}`;
    
    // Update table body
    const tbody = document.querySelector('#donationDetailTable tbody');
    tbody.innerHTML = '';
    
    let totalAmount = 0;
    let paidCount = 0;
    
    selectedData.data.forEach(row => {
        const tr = document.createElement('tr');
        const isUnpaid = row[5] === 'Chưa đóng';
        
        if (!isUnpaid && row[5] !== '-') {
            const amount = parseInt(row[5].replace(/\D/g, ''));
            totalAmount += amount;
            paidCount++;
        }
        
        tr.innerHTML = row.map((cell, index) => {
            const className = isUnpaid && (index === 5 || index === 7) ? 'class="unpaid"' : '';
            return `<td ${className}>${cell}</td>`;
        }).join('');
        
        tbody.appendChild(tr);
    });
    
    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td colspan="5"><strong>TỔNG ĐỢT NÀY</strong></td>
        <td><strong>${totalAmount.toLocaleString('vi-VN')}đ</strong></td>
        <td><strong>${paidCount}/${selectedData.data.length} hộ</strong></td>
        <td><strong>Tỷ lệ: ${((paidCount/selectedData.data.length)*100).toFixed(1)}%</strong></td>
    `;
    tbody.appendChild(totalRow);
}

// Function to show/hide report sections based on selected type
function showReportSections(reportType) {
    // Get all report sections
    const sections = {
        'temporaryAbsent': document.querySelector('#temporaryAbsentTable').closest('.report-section'),
        'temporaryResidence': document.querySelector('#temporaryResidenceTable').closest('.report-section'),
        'fee': document.querySelector('#feeTable').closest('.report-section'),
        'donationSummary': document.querySelector('#donationSummaryTable').closest('.report-section'),
        'donationDetail': document.querySelector('#donationDetailTable').closest('.report-section'),
        'topContributors': document.querySelector('#topContributors')?.closest('.report-section')
    };
    
    // Hide all sections first
    Object.values(sections).forEach(section => {
        if (section) section.style.display = 'none';
    });
    
    // Show sections based on report type
    switch(reportType) {
        case 'all':
            // Show all sections
            Object.values(sections).forEach(section => {
                if (section) section.style.display = 'block';
            });
            break;
            
        case 'nhankhau':
            // Show only population related sections
            if (sections.temporaryAbsent) sections.temporaryAbsent.style.display = 'block';
            if (sections.temporaryResidence) sections.temporaryResidence.style.display = 'block';
            break;
            
        case 'tamvang':
            // Show only temporary absent section
            if (sections.temporaryAbsent) sections.temporaryAbsent.style.display = 'block';
            break;
            
        case 'tamtru':
            // Show only temporary residence section
            if (sections.temporaryResidence) sections.temporaryResidence.style.display = 'block';
            break;
            
        case 'thuphi':
            // Show only fee related sections
            if (sections.fee) sections.fee.style.display = 'block';
            break;
            
        case 'donggop':
            // Show only donation related sections
            if (sections.donationSummary) sections.donationSummary.style.display = 'block';
            if (sections.donationDetail) sections.donationDetail.style.display = 'block';
            if (sections.topContributors) sections.topContributors.style.display = 'block';
            break;
            
        default:
            // Default to show all
            Object.values(sections).forEach(section => {
                if (section) section.style.display = 'block';
            });
    }
}

// Function to get report type display name
function getReportTypeName(reportType) {
    const typeNames = {
        'all': 'Tổng quan',
        'nhankhau': 'Nhân khẩu',
        'tamvang': 'Tạm vắng',
        'tamtru': 'Tạm trú',
        'thuphi': 'Thu phí',
        'donggop': 'Đóng góp'
    };
    return typeNames[reportType] || 'Tổng quan';
}

// Function to show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
            <span class="notification-message">${message.replace(/\n/g, '<br>')}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#bee5eb'};
        border-radius: 6px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 400px;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Style notification content
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 8px;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: inherit;
        opacity: 0.7;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Close functionality
    const closeNotification = () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeNotification);
    
    // Auto close after 4 seconds
    setTimeout(closeNotification, 4000);
}

// Function to export all visible sections
function exportAllVisibleSections(wb) {
    // Export all visible sections
    const sections = {
        'temporaryAbsentTable': 'Danh sách tạm vắng',
        'temporaryResidenceTable': 'Danh sách tạm trú',
        'feeTable': 'Thu phí theo tháng',
        'donationSummaryTable': 'Tổng hợp đóng góp',
        'donationDetailTable': 'Chi tiết đóng góp'
    };
    
    Object.keys(sections).forEach(tableId => {
        const table = document.getElementById(tableId);
        if (table && table.closest('.report-section').style.display !== 'none') {
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, sections[tableId]);
        }
    });
}