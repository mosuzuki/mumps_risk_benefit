const els = {
  coverage: document.getElementById('coverage'),
  infectionRate: document.getElementById('infectionRate'),
  meningitisRate: document.getElementById('meningitisRate'),
  vaccineMeningitis: document.getElementById('vaccineMeningitis'),
  ve: document.getElementById('ve'),
  r0: document.getElementById('r0')
};
const vals = {
  coverageVal: document.getElementById('coverageVal'),
  infectionRateVal: document.getElementById('infectionRateVal'),
  meningitisRateVal: document.getElementById('meningitisRateVal'),
  vaccineMeningitisVal: document.getElementById('vaccineMeningitisVal'),
  veVal: document.getElementById('veVal'),
  r0Val: document.getElementById('r0Val'),
  infMen: document.getElementById('infMen'),
  vacMen: document.getElementById('vacMen'),
  totMen: document.getElementById('totMen'),
  diffMen: document.getElementById('diffMen'),
  interpretation: document.getElementById('interpretation')
};

function residualTransmissionFraction(c, ve, r0) {
  const susceptible = 1 - c * ve;
  const re = r0 * susceptible;
  let frac;
  if (re > 1) {
    frac = (re - 1) / (r0 - 1);
  } else {
    frac = 0.02 * Math.max(re, 0);
  }
  return Math.min(Math.max(frac, 0), 1);
}

function calcAtCoverage(cPct) {
  const c = cPct / 100;
  const infectionRate = Number(els.infectionRate.value);
  const meningitisRate = Number(els.meningitisRate.value) / 1000;
  const vaccineMeningitis = Number(els.vaccineMeningitis.value);
  const ve = Number(els.ve.value);
  const r0 = Number(els.r0.value);

  const residual = residualTransmissionFraction(c, ve, r0);
  const infections = infectionRate * residual;
  const infectionMeningitis = infections * meningitisRate;
  const vaccineMeningitisCases = c * vaccineMeningitis;
  const total = infectionMeningitis + vaccineMeningitisCases;
  return { infectionMeningitis, vaccineMeningitisCases, total };
}

function buildData() {
  const labels = [];
  const infection = [];
  const vaccine = [];
  const total = [];
  const selectedLine = [];
  const selected = Number(els.coverage.value);
  for (let c = 0; c <= 100; c += 1) {
    const y = calcAtCoverage(c);
    labels.push(c);
    infection.push(y.infectionMeningitis);
    vaccine.push(y.vaccineMeningitisCases);
    total.push(y.total);
    selectedLine.push(c === selected ? y.total : null);
  }
  return { labels, infection, vaccine, total, selectedLine };
}

const selectedCoveragePlugin = {
  id: 'selectedCoveragePlugin',
  afterDatasetsDraw(chart) {
    const selected = Number(els.coverage.value);
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    const x = xScale.getPixelForValue(selected);
    const ctx = chart.ctx;
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x, yScale.top);
    ctx.lineTo(x, yScale.bottom);
    ctx.stroke();
    ctx.restore();
  }
};

const ctx = document.getElementById('mainChart');
let data = buildData();
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: data.labels,
    datasets: [
      { label: '自然感染由来', data: data.infection, borderWidth: 2, pointRadius: 0, tension: 0.2 },
      { label: 'ワクチン由来', data: data.vaccine, borderWidth: 2, pointRadius: 0, tension: 0.2 },
      { label: '合計', data: data.total, borderWidth: 3, pointRadius: 0, tension: 0.2 }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { title: { display: true, text: '接種率 (%)' }, min: 0, max: 100 },
      y: { title: { display: true, text: '無菌性髄膜炎 /10万人年' }, beginAtZero: true }
    },
    plugins: {
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} /10万人年` } },
      legend: { position: 'bottom' }
    }
  },
  plugins: [selectedCoveragePlugin]
});

function updateLabelsAndSummary() {
  vals.coverageVal.textContent = els.coverage.value;
  vals.infectionRateVal.textContent = Number(els.infectionRate.value).toLocaleString();
  vals.meningitisRateVal.textContent = els.meningitisRate.value;
  vals.vaccineMeningitisVal.textContent = els.vaccineMeningitis.value;
  vals.veVal.textContent = Math.round(Number(els.ve.value) * 100);
  vals.r0Val.textContent = Number(els.r0.value).toFixed(1);

  const selected = calcAtCoverage(Number(els.coverage.value));
  const baseline = calcAtCoverage(0);
  const diff = selected.total - baseline.total;
  vals.infMen.textContent = `${selected.infectionMeningitis.toFixed(2)}`;
  vals.vacMen.textContent = `${selected.vaccineMeningitisCases.toFixed(2)}`;
  vals.totMen.textContent = `${selected.total.toFixed(2)}`;
  vals.diffMen.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`;

  let msg = '接種なしと比較して、総無菌性髄膜炎はほぼ同等です。';
  if (diff <= -2) msg = '接種なしと比較して、総無菌性髄膜炎は減少します。';
  if (diff >= 2) msg = '接種なしと比較して、総無菌性髄膜炎は増加します。';
  vals.interpretation.textContent = msg;
}

function update() {
  const d = buildData();
  chart.data.labels = d.labels;
  chart.data.datasets[0].data = d.infection;
  chart.data.datasets[1].data = d.vaccine;
  chart.data.datasets[2].data = d.total;
  chart.update();
  updateLabelsAndSummary();
}

function setPreset(name) {
  if (name === 'low') {
    els.infectionRate.value = 2000;
    els.meningitisRate.value = 5;
    els.vaccineMeningitis.value = 5;
  } else if (name === 'mid') {
    els.infectionRate.value = 3500;
    els.meningitisRate.value = 7.5;
    els.vaccineMeningitis.value = 27.5;
  } else if (name === 'high') {
    els.infectionRate.value = 5000;
    els.meningitisRate.value = 10;
    els.vaccineMeningitis.value = 50;
  }
  document.querySelectorAll('.preset-row button').forEach(b => b.classList.toggle('active', b.dataset.preset === name));
  update();
}

Object.values(els).forEach(el => el.addEventListener('input', update));
document.querySelectorAll('.preset-row button').forEach(btn => btn.addEventListener('click', () => setPreset(btn.dataset.preset)));
update();
