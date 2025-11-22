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

    // --- Density chart (age distribution by gender) ---
    // synthetic per-age distributions (0..90)
    function gauss(x, mu, sigma) { return Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)); }
    const ages = Array.from({length:91}, (_,i)=>i);
    const femaleScale = 100, maleScale = 95;
    const femaleMean = 25, femaleSd = 7;
    const maleMean = 38, maleSd = 12;
    const femaleData = ages.map(a=>Math.round(femaleScale * gauss(a, femaleMean, femaleSd)));
    const maleData = ages.map(a=>Math.round(maleScale * gauss(a, maleMean, maleSd)));

    const densityCtx = document.getElementById('densityChart')?.getContext('2d');
    if (densityCtx) {
        const peakPlugin = {
            id: 'peakPluginDensity',
            afterDraw(chart){
                const {ctx, scales} = chart;
                const fIdx = femaleData.indexOf(Math.max(...femaleData));
                const mIdx = maleData.indexOf(Math.max(...maleData));
                const xF = scales.x.getPixelForValue(String(fIdx));
                const yF = scales.y.getPixelForValue(femaleData[fIdx]);
                const xM = scales.x.getPixelForValue(String(mIdx));
                const yM = scales.y.getPixelForValue(maleData[mIdx]);
                ctx.save();
                ctx.font = '20px sans-serif';
                ctx.fillStyle = 'rgba(219,39,119,0.95)'; ctx.fillText('♀', xF - 8, yF - 10);
                ctx.fillStyle = 'rgba(59,130,246,0.95)'; ctx.fillText('♂', xM - 8, yM - 10);
                ctx.restore();
            }
        };

        new Chart(densityCtx, {
            type: 'line',
            data: {
                labels: ages.map(String),
                datasets: [
                    { label: 'Nữ', data: femaleData, borderColor:'rgba(219,39,119,1)', backgroundColor:'rgba(219,39,119,0.35)', tension:0.45, fill:true, pointRadius:0, borderWidth:2 },
                    { label: 'Nam', data: maleData, borderColor:'rgba(59,130,246,1)', backgroundColor:'rgba(59,130,246,0.28)', tension:0.45, fill:true, pointRadius:0, borderWidth:2 }
                ]
            },
            options: {
                plugins: { legend:{ position:'top' }, tooltip:{ mode:'index', intersect:false } },
                interaction:{ mode:'nearest', axis:'x', intersect:false },
                scales: { x:{ title:{ display:true, text:'Tuổi' }, ticks:{ maxTicksLimit: 16 } }, y:{ beginAtZero:true, title:{ display:true, text:'Mật độ / Số người' } } },
                maintainAspectRatio:false
            },
            plugins:[peakPlugin]
        });
    }

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