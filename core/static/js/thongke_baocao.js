document.addEventListener('DOMContentLoaded', function(){
    // sample data (replace with API calls later)
    const sample = {
        ageGroups: { '0-5': 120, '6-11': 200, '12-17': 180, '18-35': 650, '36-60': 450, '60+': 100 },
        feesByMonth: [
            { month: '2025-01', amt: 1200000 },
            { month: '2025-02', amt: 950000 },
            { month: '2025-03', amt: 1300000 },
            { month: '2025-04', amt: 1100000 },
            { month: '2025-05', amt: 1250000 },
            { month: '2025-06', amt: 1400000 }
        ],
        topContributors: [
            { hk: 'HK-023', chu: 'Nguyễn Văn A', total: 250000 },
            { hk: 'HK-101', chu: 'Trần Thị B', total: 210000 },
            { hk: 'HK-045', chu: 'Lê Văn C', total: 190000 }
        ]
    };

    // utils
    function fmtVnd(n){ return n.toLocaleString('vi-VN') + ' đ'; }

    // Age chart
    const ageCtx = document.getElementById('ageChart').getContext('2d');
    new Chart(ageCtx, {
        type: 'bar',
        data: { labels: Object.keys(sample.ageGroups), datasets: [{ label:'Số người', data: Object.values(sample.ageGroups), backgroundColor:'#06b6d4' }] },
        options: { plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
    });

    // Fee chart
    const feeCtx = document.getElementById('feeChart').getContext('2d');
    new Chart(feeCtx, {
        type: 'line',
        data: { labels: sample.feesByMonth.map(x=>x.month), datasets: [{ label:'Thu phí (VNĐ)', data: sample.feesByMonth.map(x=>x.amt), borderColor:'#16a34a', backgroundColor:'rgba(22,163,74,0.08)', tension:0.2 }] },
        options: { plugins:{ tooltip:{ callbacks:{ label: (ctx)=> fmtVnd(ctx.parsed.y) } } }, scales:{ y:{ ticks:{ callback: v => new Intl.NumberFormat('vi-VN').format(v) } } } }
    });

    // populate top contributors
    const tbody = document.querySelector('#topContributors tbody');
    sample.topContributors.forEach(r=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.hk}</td><td>${r.chu}</td><td>${fmtVnd(r.total)}</td>`;
        tbody.appendChild(tr);
    });

    // Export PNG: vẽ 2 canvas cạnh nhau với kích thước bằng nhau
    const exportPngBtn = document.getElementById('exportPng');
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', async function(){
            const ageCanvas = document.getElementById('ageChart');
            const feeCanvas = document.getElementById('feeChart');
            if (!ageCanvas || !feeCanvas) return;

            const imgAge = ageCanvas.toDataURL();
            const imgFee = feeCanvas.toDataURL();

            const canv = document.createElement('canvas');
            // width: sum of two canvases at same width; height matches CSS height
            const w = 1200;
            const h = 500;
            canv.width = w; canv.height = h;
            const ctx = canv.getContext('2d');
            const load = src => new Promise(res => { const i=new Image(); i.onload=()=>res(i); i.src=src; });
            const [iAge, iFee] = await Promise.all([load(imgAge), load(imgFee)]);
            ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
            // draw side-by-side
            ctx.drawImage(iAge, 0, 0, w/2, h);
            ctx.drawImage(iFee, w/2, 0, w/2, h);
            const a = document.createElement('a');
            a.href = canv.toDataURL('image/png');
            a.download = 'charts.png';
            a.click();
        });
    }

    // Export CSV (kept)
    const exportCsvBtn = document.getElementById('exportCsv');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', function(){
            let csv = 'Loại,Key,Label,Value\n';
            sample.topContributors.forEach(r => csv += `TopContributor,${r.hk},${r.chu},${r.total}\n`);
            sample.feesByMonth.forEach(f => csv += `Fee,${f.month},,${f.amt}\n`);
            const blob = new Blob(['\uFEFF' + csv], { type:'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'baocao_thongke.csv';
            a.click();
            URL.revokeObjectURL(a.href);
        });
    }

    const applyBtn = document.getElementById('applyBtn');
    if (applyBtn) applyBtn.addEventListener('click', ()=> alert('Áp dụng bộ lọc (mẫu).'));
});