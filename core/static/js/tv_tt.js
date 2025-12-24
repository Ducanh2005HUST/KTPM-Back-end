// 1. Hàm xử lý nút Kết thúc trong bảng
function toggleStatus(recordId, isEnding) {
    if (!recordId || recordId === 'None' || recordId === '') {
        alert("ID bản ghi không hợp lệ.");
        return;
    }

    if (!confirm("Bạn có chắc chắn muốn kết thúc đợt tạm vắng này?")) return;

    // Gửi yêu cầu POST để cập nhật trạng thái
    // Lưu ý: Bạn cần tạo một view tương ứng trong views.py để xử lý URL này
    fetch(`/update-tam-vang-status/${recordId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'status': 'finished' })
    })
    .then(response => {
        if (response.ok) {
            window.location.reload();
        } else {
            alert("Lỗi cập nhật trạng thái.");
        }
    })
    .catch(err => console.error("Error:", err));
}

// 2. Chờ DOM load xong để bắt sự kiện nút Thêm
function handleAction(id, type) {
    let confirmMsg = type === 'ket-thuc' 
        ? "Xác nhận nhân khẩu này đã quay về địa phương?" 
        : "Bạn có chắc chắn muốn xóa bản ghi này?";
    
    if (!confirm(confirmMsg)) return;

    // Xác định URL dựa trên loại thao tác
    let url = type === 'ket-thuc' 
        ? `/tam-vang/ket-thuc/${id}/` 
        : `/tam-vang/xoa/${id}/`;

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            window.location.reload(); // Tải lại trang để cập nhật bảng
        } else {
            alert("Có lỗi xảy ra!");
        }
    })
    .catch(err => console.error("Lỗi:", err));
}

// Giữ nguyên đoạn code xử lý nút "Thêm tạm vắng" cũ của bạn ở dưới này...
document.addEventListener('DOMContentLoaded', function () {
    const btnAddTv = document.getElementById('addTv');

    if (btnAddTv) {
        btnAddTv.addEventListener('click', function () {
            // Lấy dữ liệu
            const household_val = document.getElementById('tv_person').value;
            const from_date_val = document.getElementById('tv_ngay_bat_dau').value;
            const to_date_val = document.getElementById('tv_ngay_ket_thuc').value;
            const reason_val = document.getElementById('tv_ly_do').value;

            if (!household_val || !from_date_val) {
                alert("Vui lòng nhập Nhân khẩu và Ngày bắt đầu!");
                return;
            }

            // Đóng gói dữ liệu gửi lên views.py
            const formData = new FormData();
            formData.append('household', household_val);
            formData.append('from_date', from_date_val);
            formData.append('to_date', to_date_val);
            formData.append('destination', 'Tại địa phương');
            formData.append('reason', reason_val);
            formData.append('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);

            // Gửi AJAX
            fetch(window.location.href, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (response.ok) {
                    alert("Thành công!");
                    window.location.reload();
                } else {
                    alert("Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.");
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
});