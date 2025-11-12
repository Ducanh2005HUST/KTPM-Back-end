document.addEventListener('DOMContentLoaded', function(){
    // sample data - thay bằng API khi backend có
    const households = [
        { id: 'HK-001', chu: 'Nguyễn Văn A', members: 4 },
        { id: 'HK-002', chu: 'Trần Thị B', members: 3 },
        { id: 'HK-003', chu: 'Lê Văn C', members: 5 },
        { id: 'HK-004', chu: 'Phạm Thị D', members: 2 }
    ];
    const unit = 6000; // 6.000đ / người / tháng

    const selHouse = document.getElementById('feeHousehold');
    const inpMembers = document.getElementById('feeMembers');
    const inpMonth = document.getElementById('feeMonth');
    const inpAmount = document.getElementById('feeAmount');
    const feeList = document.getElementById('feeList');

    // populate select
    function populateHouseholds() {
        if (!selHouse) return;
        selHouse.innerHTML = '<option value="">-- Chọn hộ --</option>';
        households.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h.id;
            opt.dataset.members = h.members;
            opt.textContent = `${h.id} — ${h.chu} (${h.members} người)`;
            selHouse.appendChild(opt);
        });
    }

    function formatVnd(n){ return n.toLocaleString('vi-VN') + 'đ'; }

    function recalcAmount(){
        if (!inpMembers || !inpAmount) return 0;
        const members = parseInt(inpMembers.value) || 0;
        const total = members * unit;
        inpAmount.value = formatVnd(total);
        return total;
    }

    if (selHouse) {
        selHouse.addEventListener('change', function(){
            const opt = selHouse.selectedOptions[0];
            const members = opt && opt.dataset.members ? parseInt(opt.dataset.members) : 1;
            if (inpMembers) inpMembers.value = members;
            recalcAmount();
        });
    }

    if (inpMonth) inpMonth.addEventListener('change', recalcAmount);

    const addFeeBtn = document.getElementById('addFee');
    if (addFeeBtn) {
        addFeeBtn.addEventListener('click', function(){
            const houseId = selHouse ? selHouse.value : '';
            if(!houseId){
                alert('Chọn hộ gia đình trước khi lập phiếu.');
                return;
            }
            const h = households.find(x => x.id === houseId) || { id: houseId, chu: '-', members: 0 };
            const members = parseInt(inpMembers.value) || h.members || 0;
            const month = inpMonth && inpMonth.value ? (new Date(inpMonth.value + '-01')).toLocaleDateString('vi-VN',{year:'numeric', month:'2-digit'}) : '-';
            const total = members * unit;
            if (!feeList) return;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${h.id}</td>
                            <td>${h.chu}</td>
                            <td>${members}</td>
                            <td>${month}</td>
                            <td>${formatVnd(total)}</td>
                            <td><span class="status unpaid">Chưa thu</span></td>`;
            feeList.prepend(tr);
        });
    }

    const printFeeBtn = document.getElementById('printFee');
    if (printFeeBtn) {
        printFeeBtn.addEventListener('click', function(){
            const panel = document.querySelector('#tab-fee .table-container');
            if (!panel) return;
            const win = window.open('', '_blank');
            win.document.write('<h3>Danh sách phiếu thu</h3>' + panel.outerHTML);
            win.print(); win.close();
        });
    }

    // init
    populateHouseholds();
    recalcAmount();

    // tabs
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
});