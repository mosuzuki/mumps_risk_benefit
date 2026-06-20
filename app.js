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
  chartHorizonText: document.getElementById('chartHorizonText'),
  infectionRateVal: document.getElementById('infectionRateVal'),
  meningitisRateVal: document.getElementById('meningitisRateVal'),
  vaccineMeningitisVal: document.getElementById('vaccineMeningitisVal'),
  veVal: document.getElementById('veVal'),
  waningVal: document.getElementById('waningVal'),
  r0Val: document.getElementById('r0Val'),
  summaryCoverage: document.getElementById('summaryCoverage'),
  summaryYears: document.getElementById('summaryYears'),
  infMen: document.getElementById('infMen'),
  vacMen: document.getElementById('vacMen'),
  preventedMen: document.getElementById('preventedMen'),
  totMen: document.getElementById('totMen'),
  diffMen: document.getElementById('diffMen'),
  cumInf: document.getElementById('cumInf'),
  brRatio: document.getElementById('brRatio'),
  assumptionLine: document.getElementById('assumptionLine'),
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
  const effectiveImmuneFraction = Math.max(0, Math.min(1, coverage * effectiveVe));
  const susceptibleFraction = 1 - effectiveImmuneFraction;
  const re = r0 * susceptibleFraction;

  // Simple threshold approximation: when Re remains above 1, transmission decreases
  // gradually; below 1, only a small residual sporadic risk is retained.
  let frac;
  if (re > 1) {
    frac = (re - 1) / (r0 - 1);
  } else {
    frac = 0.02 * re;
  }
  return Math.max(0, Math.min(1, frac));
}

function simulateCohort(coverage, p) {
  // Hypothetical cohort of 100,000 children entering at vaccination age.
  // Vaccine-associated meningitis is added once at cohort entry.
  // Infection-associated meningitis accumulates over the selected follow-up period.
  let susceptibleUnvaccinated = N * (1 - coverage);
  let susceptibleVaccinated = N * coverage;
  let cumulativeInfections = 0;
  let infectionMeningitis = 0;

  const vaccineMeningitis = coverage * p.vaccineMeningitis;
  const baselineAnnualRisk = p.infectionRate / 100000;

  for (let year = 0; year < p.years; year++) {
    const veYear = Math.max(0, p.ve * Math.pow(1 - p.waning, year));
    const transmissionFraction = residualTransmissionFraction(coverage, veYear, p.r0);
    const communityRisk = Math.min(0.95, baselineAnnualRisk * transmissionFraction);

    const riskUnvaccinated = communityRisk;
    const riskVaccinated = Math.max(0, Math.min(0.95, communityRisk * (1 - veYear)));

    const infectionsUnvaccinated = susceptibleUnvaccinated * riskUnvaccinated;
    const infectionsVaccinated = susceptibleVaccinated * riskVaccinated;
    const infectionsThisYear = infectionsUnvaccinated + infectionsVaccinated;

    cumulativeInfections += infectionsThisYear;
    infectionMeningitis += infectionsThisYear * p.meningitisRate;

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
      { label: '自然感染由来', data: [], tension: 0.2, pointRadius: 0, borderWidth: 2 },
      { label: 'ワクチン由来', data: [], tension: 0.2, pointRadius: 0, borderWidth: 2 },
      { label: '合計', data: [], tension: 0.2, pointRadius: 0, borderWidth: 3 }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
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
      x: { title: { display: true, text: '接種率 (%)' }, ticks: { callback: (v) => `${v}%`, maxTicksLimit: 11 } },
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
  if (els.chartHorizonText) els.chartHorizonText.textContent = p.years;
  if (els.summaryCoverage) els.summaryCoverage.textContent = Math.round(p.coverage * 100);
  if (els.summaryYears) els.summaryYears.textContent = p.years;
  els.infectionRateVal.textContent = p.infectionRate.toLocaleString('ja-JP');
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
  chart.update('none');

  const current = simulateCohort(p.coverage, p);
  const baseline = simulateCohort(0, p);
  const prevented = baseline.infectionMeningitis - current.infectionMeningitis;
  const diff = current.totalMeningitis - baseline.totalMeningitis;
  const brRatio = current.vaccineMeningitis > 0 ? prevented / current.vaccineMeningitis : null;

  els.infMen.textContent = `${format1(current.infectionMeningitis)}例`;
  els.vacMen.textContent = `${format1(current.vaccineMeningitis)}例`;
  els.preventedMen.textContent = `${format1(prevented)}例`;
  els.totMen.textContent = `${format1(current.totalMeningitis)}例`;
  els.diffMen.textContent = `${diff >= 0 ? '+' : ''}${format1(diff)}例`;
  els.cumInf.textContent = `${format0(current.cumulativeInfections)}人`;
  els.brRatio.textContent = brRatio === null ? '—' : `${format1(brRatio)} : 1`;
  els.assumptionLine.textContent = `モデル定義：接種対象年齢の仮想小児コホート10万人を、コホート参加時から${p.years}年間追跡。ワクチン関連無菌性髄膜炎は接種時に1回だけ加算し、自然感染由来リスクは追跡期間中に累積。VE ${Math.round(p.ve * 100)}%、年間減衰 ${(p.waning * 100).toFixed(1).replace('.0', '')}%、接種なし感染率 ${p.infectionRate.toLocaleString('ja-JP')}/10万人年。`;

  if (prevented > current.vaccineMeningitis + 5) {
    els.interpretation.textContent = `現在の設定では、ワクチン由来リスクを上回る感染由来無菌性髄膜炎の予防が推定されます。`;
  } else if (current.vaccineMeningitis > prevented + 5) {
    els.interpretation.textContent = `現在の設定では、無菌性髄膜炎だけを見ると、ワクチン由来リスクが予防数を上回る可能性があります。`;
  } else {
    els.interpretation.textContent = `現在の設定では、無菌性髄膜炎だけを見ると、ワクチン由来リスクと予防数は近い水準です。`;
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
