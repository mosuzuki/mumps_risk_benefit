const N = 100000;
const coverageValues = Array.from({ length: 101 }, (_, i) => i);

const els = {
  coverage: document.getElementById('coverage'),
  years: document.getElementById('years'),
  infectionRate: document.getElementById('infectionRate'),
  meningitisRate: document.getElementById('meningitisRate'),
  vaccineMeningitis: document.getElementById('vaccineMeningitis'),
  ve: document.getElementById('ve'),
  waning: document.getElementById('waning'),
  r0: document.getElementById('r0'),
  coverageVal: document.getElementById('coverageVal'),
  yearsVal: document.getElementById('yearsVal'),
  horizonText: document.getElementById('horizonText'),
  infectionRateVal: document.getElementById('infectionRateVal'),
  meningitisRateVal: document.getElementById('meningitisRateVal'),
  vaccineMeningitisVal: document.getElementById('vaccineMeningitisVal'),
  veVal: document.getElementById('veVal'),
  waningVal: document.getElementById('waningVal'),
  r0Val: document.getElementById('r0Val'),
  infMen: document.getElementById('infMen'),
  vacMen: document.getElementById('vacMen'),
  totMen: document.getElementById('totMen'),
  diffMen: document.getElementById('diffMen'),
  cumInf: document.getElementById('cumInf'),
  interpretation: document.getElementById('interpretation')
};

const presets = {
  low: { infectionRate: 2000, meningitisRate: 5, vaccineMeningitis: 5, ve: 0.86, waning: 1.6, r0: 5.0 },
  mid: { infectionRate: 3500, meningitisRate: 7.5, vaccineMeningitis: 27.5, ve: 0.86, waning: 1.6, r0: 5.0 },
  high: { infectionRate: 5000, meningitisRate: 10, vaccineMeningitis: 50, ve: 0.72, waning: 3.9, r0: 5.0 }
};

function params() {
  return {
    coverage: Number(els.coverage.value) / 100,
    years: Number(els.years.value),
    infectionRate: Number(els.infectionRate.value),
    meningitisRate: Number(els.meningitisRate.value) / 1000,
    vaccineMeningitis: Number(els.vaccineMeningitis.value),
    ve: Number(els.ve.value),
    waning: Number(els.waning.value) / 100,
    r0: Number(els.r0.value)
  };
}

function residualTransmissionFraction(coverage, effectiveVe, r0) {
  const susceptibleFraction = Math.max(0, 1 - coverage * effectiveVe);
  const re = r0 * susceptibleFraction;
  let frac;
  if (re > 1) {
    frac = (re - 1) / (r0 - 1);
  } else {
    // Small residual sporadic risk below the epidemic threshold.
    frac = 0.02 * re;
  }
  return Math.max(0, Math.min(1, frac));
}

function simulateCohort(coverage, p) {
  let susceptibleUnvaccinated = N * (1 - coverage);
  let susceptibleVaccinated = N * coverage;
  let cumulativeInfections = 0;
  let infectionMeningitis = 0;

  const vaccineMeningitis = coverage * p.vaccineMeningitis;

  for (let year = 0; year < p.years; year++) {
    const veYear = Math.max(0, p.ve * Math.pow(1 - p.waning, year));
    const transmission = residualTransmissionFraction(coverage, veYear, p.r0);
    const baselineAnnualRisk = p.infectionRate / 100000;
    const forceOfInfection = Math.min(1, baselineAnnualRisk * transmission);

    const infectionsUnvaccinated = Math.min(susceptibleUnvaccinated, susceptibleUnvaccinated * forceOfInfection);
    const infectionsVaccinated = Math.min(susceptibleVaccinated, susceptibleVaccinated * forceOfInfection * (1 - veYear));
    const infections = infectionsUnvaccinated + infectionsVaccinated;

    cumulativeInfections += infections;
    infectionMeningitis += infections * p.meningitisRate;

    susceptibleUnvaccinated -= infectionsUnvaccinated;
    susceptibleVaccinated -= infectionsVaccinated;
  }

  return {
    cumulativeInfections,
    infectionMeningitis,
    vaccineMeningitis,
    totalMeningitis: infectionMeningitis + vaccineMeningitis
  };
}

const verticalLinePlugin = {
  id: 'verticalCoverageLine',
  afterDatasetsDraw(chart) {
    const p = params();
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    const x = xScale.getPixelForValue(Math.round(p.coverage * 100));
    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, yScale.top);
    ctx.lineTo(x, yScale.bottom);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#333333';
    ctx.stroke();
    ctx.restore();
  }
};

const ctx = document.getElementById('mainChart');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: coverageValues,
    datasets: [
      { label: '自然感染由来', data: [], tension: 0.25, pointRadius: 0, borderWidth: 2 },
      { label: 'ワクチン由来', data: [], tension: 0.25, pointRadius: 0, borderWidth: 2 },
      { label: '合計', data: [], tension: 0.25, pointRadius: 0, borderWidth: 3 }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          title: (items) => `接種率 ${items[0].label}%`,
          label: (item) => `${item.dataset.label}: ${item.parsed.y.toFixed(1)} /10万人コホート`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: '接種率 (%)' }, ticks: { callback: (v) => `${v}%` } },
      y: { title: { display: true, text: '累積無菌性髄膜炎 /10万人コホート' }, beginAtZero: true }
    }
  },
  plugins: [verticalLinePlugin]
});

function format1(x) { return Number(x).toFixed(1); }
function format0(x) { return Math.round(Number(x)).toLocaleString('ja-JP'); }

function updateText(p) {
  els.coverageVal.textContent = Math.round(p.coverage * 100);
  els.yearsVal.textContent = p.years;
  els.horizonText.textContent = p.years;
  els.infectionRateVal.textContent = p.infectionRate;
  els.meningitisRateVal.textContent = (p.meningitisRate * 1000).toFixed(1).replace('.0', '');
  els.vaccineMeningitisVal.textContent = p.vaccineMeningitis.toFixed(1).replace('.0', '');
  els.veVal.textContent = Math.round(p.ve * 100);
  els.waningVal.textContent = (p.waning * 100).toFixed(1).replace('.0', '');
  els.r0Val.textContent = p.r0.toFixed(1);
}

function update() {
  const p = params();
  updateText(p);

  const infectionData = [];
  const vaccineData = [];
  const totalData = [];

  for (const cPct of coverageValues) {
    const result = simulateCohort(cPct / 100, p);
    infectionData.push(result.infectionMeningitis);
    vaccineData.push(result.vaccineMeningitis);
    totalData.push(result.totalMeningitis);
  }

  chart.data.datasets[0].data = infectionData;
  chart.data.datasets[1].data = vaccineData;
  chart.data.datasets[2].data = totalData;
  chart.update();

  const current = simulateCohort(p.coverage, p);
  const baseline = simulateCohort(0, p);
  const diff = current.totalMeningitis - baseline.totalMeningitis;

  els.infMen.textContent = `${format1(current.infectionMeningitis)}例`;
  els.vacMen.textContent = `${format1(current.vaccineMeningitis)}例`;
  els.totMen.textContent = `${format1(current.totalMeningitis)}例`;
  els.diffMen.textContent = `${diff >= 0 ? '+' : ''}${format1(diff)}例`;
  els.cumInf.textContent = `${format0(current.cumulativeInfections)}人`;

  if (diff < -5) {
    els.interpretation.textContent = `現在の設定では、接種によりX年間累積の無菌性髄膜炎は接種なしより少なく推定されます。`;
  } else if (diff > 5) {
    els.interpretation.textContent = `現在の設定では、無菌性髄膜炎だけを見ると、接種なしより多く推定されます。ワクチン関連髄膜炎率などの仮定に敏感です。`;
  } else {
    els.interpretation.textContent = `現在の設定では、無菌性髄膜炎だけを見ると、接種なしとの差は小さく推定されます。`;
  }
}

for (const el of [els.coverage, els.years, els.infectionRate, els.meningitisRate, els.vaccineMeningitis, els.ve, els.waning, els.r0]) {
  el.addEventListener('input', update);
  el.addEventListener('change', update);
}

document.querySelectorAll('[data-preset]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const p = presets[button.dataset.preset];
    els.infectionRate.value = p.infectionRate;
    els.meningitisRate.value = p.meningitisRate;
    els.vaccineMeningitis.value = p.vaccineMeningitis;
    els.ve.value = String(p.ve);
    els.waning.value = p.waning;
    els.r0.value = p.r0;
    update();
  });
});

update();
