/**
 * Biendong Form JavaScript
 * Xử lý form cập nhật biến động nhân khẩu
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeBiendongForm();
});

// Sample data
const samplePersons = {
    '1': {
        name: 'Nguyễn Văn An',
        cccd: '123456789012',
        birth: '1980-05-15',
        address: 'Số 123, đường ABC, quận XYZ',
        relation: 'Chủ hộ',
        household: 'HK001'
    },
    '2': {
        name: 'Trần Thị Bình',
        cccd: '123456789013', 
        birth: '1985-08-20',
        address: 'Số 123, đường ABC, quận XYZ',
        relation: 'Vợ',
        household: 'HK001'
    },
    '3': {
        name: 'Lê Văn Cường',
        cccd: '123456789014',
        birth: '2005-12-10', 
        address: 'Số 123, đường ABC, quận XYZ',
        relation: 'Con',
        household: 'HK001'
    },
    '4': {
        name: 'Phạm Thị Dung',
        cccd: '123456789015',
        birth: '1978-03-25',
        address: 'Số 456, đường DEF, quận GHI',
        relation: 'Chủ hộ',
        household: 'HK002'
    }
};

/**
 * Initialize form
 */
function initializeBiendongForm() {
    setupPersonSelection();
    setupChangeTypeSelection();
    setupFileUpload();
    setupFormValidation();
    setupModal();
    setupDateValidation();
    
    // Initialize preview button state
    disablePreviewButton();
    
    // Ensure modal is hidden on page load
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Setup person selection
 */
function setupPersonSelection() {
    const personSelect = document.getElementById('nhankhau_id');
    const currentInfo = document.getElementById('current_info');

    if (personSelect && currentInfo) {
        personSelect.addEventListener('change', function() {
            const personId = this.value;
            if (personId && samplePersons[personId]) {
                displayPersonInfo(samplePersons[personId], currentInfo);
                updateNewHeadOptions(personId);
                
                // Check if change type is also selected to enable preview
                const changeType = document.querySelector('input[name="change_type"]:checked');
                if (changeType) {
                    enablePreviewButton();
                }
            } else {
                resetPersonInfo(currentInfo);
                disablePreviewButton();
            }
        });
    }
}

/**
 * Disable preview button
 */
function disablePreviewButton() {
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.style.opacity = '0.6';
        previewBtn.style.pointerEvents = 'none';
        previewBtn.style.animation = 'none';
    }
}

/**
 * Display person information
 */
function displayPersonInfo(person, container) {
    const html = `
        <div class="info-card loaded">
            <div class="preview-grid">
                <div class="preview-item">
                    <div class="preview-label">Họ và tên</div>
                    <div class="preview-value">${person.name}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">CCCD/CMND</div>
                    <div class="preview-value">${person.cccd}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Ngày sinh</div>
                    <div class="preview-value">${formatDate(person.birth)}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Quan hệ với chủ hộ</div>
                    <div class="preview-value">${person.relation}</div>
                </div>
                <div class="preview-item" style="grid-column: 1 / -1;">
                    <div class="preview-label">Địa chỉ</div>
                    <div class="preview-value">${person.address}</div>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

/**
 * Reset person info display
 */
function resetPersonInfo(container) {
    container.innerHTML = `
        <div class="info-card">
            <i class="fas fa-info-circle"></i>
            <span>Chọn nhân khẩu để hiển thị thông tin</span>
        </div>
    `;
}

/**
 * Update new head options for doi_chu form
 */
function updateNewHeadOptions(currentPersonId) {
    const newHeadSelect = document.getElementById('new_head');
    if (!newHeadSelect) return;

    // Clear current options except first
    newHeadSelect.innerHTML = '<option value="">-- Chọn chủ hộ mới --</option>';
    
    // Add other family members
    Object.keys(samplePersons).forEach(id => {
        if (id !== currentPersonId && samplePersons[id].household === samplePersons[currentPersonId].household) {
            const person = samplePersons[id];
            const option = document.createElement('option');
            option.value = id;
            option.textContent = person.name;
            newHeadSelect.appendChild(option);
        }
    });
}

/**
 * Setup change type selection
 */
function setupChangeTypeSelection() {
    const changeRadios = document.querySelectorAll('input[name="change_type"]');
    const dynamicForms = document.querySelectorAll('.dynamic-form');

    changeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all dynamic forms
            dynamicForms.forEach(form => {
                form.style.display = 'none';
            });

            // Show selected form
            if (this.checked) {
                const targetForm = document.getElementById(this.value + '_form');
                if (targetForm) {
                    targetForm.style.display = 'block';
                }
                
                // Update required fields based on selection
                updateRequiredFields(this.value);
                
                // Enable preview button if person is selected
                const personId = document.getElementById('nhankhau_id').value;
                if (personId) {
                    enablePreviewButton();
                }
            }
        });
    });
}

/**
 * Enable preview button with visual feedback
 */
function enablePreviewButton() {
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.style.opacity = '1';
        previewBtn.style.pointerEvents = 'auto';
        
        // Add pulse animation to draw attention
        previewBtn.style.animation = 'pulse 2s infinite';
        
        // Show tooltip
        showNotification('Bạn có thể xem trước thông tin ngay bây giờ!', 'info');
    }
}

/**
 * Update required fields based on change type
 */
function updateRequiredFields(changeType) {
    // Clear all required attributes first
    const allInputs = document.querySelectorAll('.dynamic-form input, .dynamic-form select');
    allInputs.forEach(input => {
        input.removeAttribute('required');
    });

    // Set required fields based on change type
    const requiredFields = {
        'chuyen_di': ['new_address', 'move_date'],
        'qua_doi': ['death_date'],
        'doi_chu': ['new_head', 'change_date']
    };

    if (requiredFields[changeType]) {
        requiredFields[changeType].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.setAttribute('required', 'required');
            }
        });
    }
}

/**
 * Setup file upload
 */
function setupFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('documents');
    const fileList = document.getElementById('fileList');
    
    if (!uploadZone || !fileInput || !fileList) return;

    let uploadedFiles = [];

    // Click to upload
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });

    function handleFiles(files) {
        files.forEach(file => {
            if (validateFile(file)) {
                uploadedFiles.push(file);
                displayFile(file);
            }
        });
    }

    function validateFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

        if (file.size > maxSize) {
            showNotification('File quá lớn! Kích thước tối đa 5MB.', 'error');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            showNotification('Loại file không được hỗ trợ!', 'error');
            return false;
        }

        return true;
    }

    function displayFile(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas ${getFileIcon(file.type)} file-icon"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <i class="fas fa-times file-remove" onclick="removeFile('${file.name}')"></i>
        `;
        fileList.appendChild(fileItem);
    }

    window.removeFile = function(fileName) {
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
        const fileItems = fileList.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            if (item.querySelector('.file-name').textContent === fileName) {
                item.remove();
            }
        });
    };
}

/**
 * Get file icon based on type
 */
function getFileIcon(type) {
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('image')) return 'fa-file-image';
    return 'fa-file';
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    const form = document.getElementById('biendongForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            showNotification('Cập nhật biến động thành công!', 'success');
            // Here you would normally submit to server
            setTimeout(() => {
                // window.location.href = '/nhankhau/';
            }, 2000);
        }
    });
}

/**
 * Validate form data for preview (more lenient)
 */
function validateFormForPreview() {
    const personId = document.getElementById('nhankhau_id').value;
    const changeType = document.querySelector('input[name="change_type"]:checked');
    
    if (!personId) {
        showNotification('Vui lòng chọn nhân khẩu trước khi xem trước!', 'error');
        document.getElementById('nhankhau_id').focus();
        return false;
    }

    if (!changeType) {
        showNotification('Vui lòng chọn loại biến động trước khi xem trước!', 'error');
        return false;
    }

    return true;
}

/**
 * Validate form data (strict validation for submission)
 */
function validateForm() {
    const personId = document.getElementById('nhankhau_id').value;
    const changeType = document.querySelector('input[name="change_type"]:checked');
    
    if (!personId) {
        showNotification('Vui lòng chọn nhân khẩu!', 'error');
        return false;
    }

    if (!changeType) {
        showNotification('Vui lòng chọn loại biến động!', 'error');
        return false;
    }

    // Validate required fields in active form
    const activeForm = document.querySelector('.dynamic-form[style*="block"]');
    if (activeForm) {
        const requiredFields = activeForm.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                showNotification(`Vui lòng nhập ${field.previousElementSibling.textContent}!`, 'error');
                field.focus();
                return false;
            }
        }
    }

    return true;
}

/**
 * Setup modal functionality
 */
function setupModal() {
    const modal = document.getElementById('previewModal');
    const previewBtn = document.getElementById('previewBtn');
    const closeModal = document.getElementById('closeModal');
    const closePreview = document.getElementById('closePreview');
    const confirmSubmit = document.getElementById('confirmSubmit');

    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            if (validateFormForPreview()) {
                generatePreview();
                modal.style.display = 'block';
            }
        });
    }

    [closeModal, closePreview].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        }
    });

    if (confirmSubmit) {
        confirmSubmit.addEventListener('click', function() {
            modal.style.display = 'none';
            document.getElementById('biendongForm').dispatchEvent(new Event('submit'));
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Generate preview content
 */
function generatePreview() {
    const previewContent = document.getElementById('previewContent');
    const formData = collectFormData();
    
    if (!formData.person) {
        previewContent.innerHTML = `
            <div class="preview-section">
                <div style="text-align: center; padding: 20px; color: #6c757d;">
                    <i class="fas fa-info-circle" style="font-size: 48px; margin-bottom: 10px;"></i>
                    <p>Chưa có thông tin để hiển thị</p>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="preview-section">
            <h4><i class="fas fa-user"></i> Thông tin Nhân khẩu</h4>
            <div class="preview-grid">
                <div class="preview-item">
                    <div class="preview-label">Họ và tên</div>
                    <div class="preview-value">${formData.person.name}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">CCCD/CMND</div>
                    <div class="preview-value">${formData.person.cccd}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Ngày sinh</div>
                    <div class="preview-value">${formatDate(formData.person.birth)}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Quan hệ với chủ hộ</div>
                    <div class="preview-value">${formData.person.relation}</div>
                </div>
                <div class="preview-item" style="grid-column: 1 / -1;">
                    <div class="preview-label">Địa chỉ hiện tại</div>
                    <div class="preview-value">${formData.person.address}</div>
                </div>
            </div>
        </div>
    `;

    // Add change type if selected
    if (formData.changeType) {
        html += `
            <div class="preview-section">
                <h4><i class="fas fa-sync-alt"></i> Loại biến động</h4>
                <div class="preview-grid">
                    <div class="preview-item">
                        <div class="preview-label">Loại</div>
                        <div class="preview-value">${getChangeTypeText(formData.changeType)}</div>
                    </div>
                </div>
            </div>
        `;

        // Add specific change details
        if (formData.changeType === 'chuyen_di') {
            html += generateMovePreview(formData);
        } else if (formData.changeType === 'qua_doi') {
            html += generateDeathPreview(formData);
        } else if (formData.changeType === 'doi_chu') {
            html += generateChangeHeadPreview(formData);
        }
    } else {
        html += `
            <div class="preview-section">
                <h4><i class="fas fa-info-circle"></i> Thông tin biến động</h4>
                <div style="text-align: center; padding: 20px; color: #6c757d;">
                    <p>Chưa chọn loại biến động</p>
                </div>
            </div>
        `;
    }

    previewContent.innerHTML = html;
}

/**
 * Collect form data
 */
function collectFormData() {
    const personId = document.getElementById('nhankhau_id').value;
    const changeType = document.querySelector('input[name="change_type"]:checked')?.value;
    
    const data = {
        person: samplePersons[personId],
        changeType: changeType
    };

    // Collect specific form data
    const activeForm = document.querySelector('.dynamic-form[style*="block"]');
    if (activeForm) {
        const inputs = activeForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.value) {
                data[input.name] = input.value;
            }
        });
    }

    return data;
}

/**
 * Generate move preview
 */
function generateMovePreview(data) {
    return `
        <div class="preview-section">
            <h4><i class="fas fa-arrow-right"></i> Chi tiết Chuyển đi</h4>
            <div class="preview-grid">
                <div class="preview-item">
                    <div class="preview-label">Địa chỉ mới</div>
                    <div class="preview-value ${!data.new_address ? 'empty' : ''}">${data.new_address || 'Chưa nhập địa chỉ mới'}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Ngày chuyển đi</div>
                    <div class="preview-value ${!data.move_date ? 'empty' : ''}">${formatDate(data.move_date) || 'Chưa chọn ngày'}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Lý do</div>
                    <div class="preview-value ${!data.move_reason ? 'empty' : ''}">${getReasonText(data.move_reason, 'move') || 'Chưa chọn lý do'}</div>
                </div>
                <div class="preview-item" style="grid-column: 1 / -1;">
                    <div class="preview-label">Ghi chú</div>
                    <div class="preview-value ${!data.move_note ? 'empty' : ''}">${data.move_note || 'Không có ghi chú'}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate death preview
 */
function generateDeathPreview(data) {
    return `
        <div class="preview-section">
            <h4><i class="fas fa-cross"></i> Chi tiết Qua đời</h4>
            <div class="preview-grid">
                <div class="preview-item">
                    <div class="preview-label">Ngày qua đời</div>
                    <div class="preview-value ${!data.death_date ? 'empty' : ''}">${formatDate(data.death_date) || 'Chưa chọn ngày'}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Nơi qua đời</div>
                    <div class="preview-value ${!data.death_place ? 'empty' : ''}">${data.death_place || 'Chưa nhập nơi qua đời'}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Nguyên nhân</div>
                    <div class="preview-value ${!data.death_cause ? 'empty' : ''}">${getReasonText(data.death_cause, 'death') || 'Chưa chọn nguyên nhân'}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Số giấy chứng tử</div>
                    <div class="preview-value ${!data.death_certificate ? 'empty' : ''}">${data.death_certificate || 'Chưa nhập số giấy chứng tử'}</div>
                </div>
                <div class="preview-item" style="grid-column: 1 / -1;">
                    <div class="preview-label">Ghi chú</div>
                    <div class="preview-value ${!data.death_note ? 'empty' : ''}">${data.death_note || 'Không có ghi chú'}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate change head preview
 */
function generateChangeHeadPreview(data) {
    const newHeadName = samplePersons[data.new_head]?.name || '';
    return `
        <div class="preview-section">
            <h4><i class="fas fa-crown"></i> Chi tiết Đổi chủ hộ</h4>
            <div class="preview-grid">
                <div class="preview-item">
                    <div class="preview-label">Chủ hộ mới</div>
                    <div class="preview-value ${!newHeadName ? 'empty' : ''}">${newHeadName || 'Chưa chọn chủ hộ mới'}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Ngày thay đổi</div>
                    <div class="preview-value ${!data.change_date ? 'empty' : ''}">${formatDate(data.change_date) || 'Chưa chọn ngày'}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Lý do thay đổi</div>
                    <div class="preview-value ${!data.change_reason ? 'empty' : ''}">${getReasonText(data.change_reason, 'change') || 'Chưa chọn lý do'}</div>
                </div>
                <div class="preview-item">
                    <div class="preview-label">Số quyết định</div>
                    <div class="preview-value ${!data.approval_doc ? 'empty' : ''}">${data.approval_doc || 'Chưa nhập số quyết định'}</div>
                </div>
                <div class="preview-item" style="grid-column: 1 / -1;">
                    <div class="preview-label">Ghi chú</div>
                    <div class="preview-value ${!data.change_note ? 'empty' : ''}">${data.change_note || 'Không có ghi chú'}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get change type text
 */
function getChangeTypeText(type) {
    const texts = {
        'chuyen_di': 'Chuyển đi',
        'qua_doi': 'Qua đời', 
        'doi_chu': 'Đổi chủ hộ'
    };
    return texts[type] || '';
}

/**
 * Get reason text
 */
function getReasonText(value, type) {
    const reasons = {
        move: {
            'cong_tac': 'Công tác',
            'hoc_tap': 'Học tập',
            'ket_hon': 'Kết hôn',
            'kinh_doanh': 'Kinh doanh',
            'khac': 'Khác'
        },
        death: {
            'benh_tat': 'Bệnh tật',
            'tai_nan': 'Tai nạn',
            'tu_nhien': 'Tự nhiên',
            'khac': 'Khác'
        },
        change: {
            'chu_cu_chuyen_di': 'Chủ cũ chuyển đi',
            'chu_cu_qua_doi': 'Chủ cũ qua đời',
            'thay_doi_tu_nguyen': 'Thay đổi tự nguyện',
            'khac': 'Khác'
        }
    };
    return reasons[type]?.[value] || value;
}

/**
 * Setup date validation
 */
function setupDateValidation() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        // Set max date to today for most date fields
        if (['death_date', 'move_date', 'change_date'].includes(input.id)) {
            input.max = today;
        }
        
        input.addEventListener('change', function() {
            validateDateInput(this);
        });
    });
}

/**
 * Validate date input
 */
function validateDateInput(input) {
    const selectedDate = new Date(input.value);
    const today = new Date();
    
    if (selectedDate > today) {
        showNotification('Không thể chọn ngày trong tương lai!', 'error');
        input.value = '';
        return false;
    }
    
    return true;
}

/**
 * Utility functions
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
            <i class="fas fa-times" style="margin-left: auto; cursor: pointer;" onclick="this.parentElement.parentElement.remove()"></i>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
    }
    
    .alert-info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
`;
document.head.appendChild(style);