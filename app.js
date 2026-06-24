const INCREASE = { electricity: 1.0863, water: 1.125, sanitation: 1.11, refuse: 1.062, rates: 1.036 };
const VAT_RATE = .15;
const VAT_MULTIPLIER = 1 + VAT_RATE;

// Published City of Johannesburg FY2025/26 values, uplifted by approved 2026/27 average increases.
// Electricity intentionally models usage charges only. Possible fixed/account charges are disclosed in the interface.
const ELECTRICITY = {
  high: [[350, 2.6645], [150, 3.0564], [Infinity, 3.4826]],
  low: [[350, 2.4986], [150, 3.0564], [Infinity, 3.7042]]
};
const WATER = {
  conventional: [[6,0],[4,29.84],[5,31.15],[5,43.67],[10,60.36],[10,66.01],[10,83.28],[Infinity,89.24]],
  prepaid: [[6,0],[4,25.70],[5,26.52],[5,31.69],[10,57.36],[10,61.75],[10,77.16],[Infinity,84.38]]
};
const SANITATION_BANDS = [
  { limit: 300, label: 'Up to 300 m²', amount: 358.42 },
  { limit: 1000, label: '301–1,000 m²', amount: 697.73 },
  { limit: 2000, label: '1,001–2,000 m²', amount: 1055.51 },
  { limit: Infinity, label: 'More than 2,000 m²', amount: 1520.83 }
];
const REFUSE_BANDS = [
  { limit: 350000, label: 'Up to R350,000', amount: 0 },
  { limit: 500000, label: 'R350,001–R500,000', amount: 187 },
  { limit: 750000, label: 'R500,001–R750,000', amount: 246 },
  { limit: 1000000, label: 'R750,001–R1 million', amount: 310 },
  { limit: 1500000, label: 'R1,000,001–R1.5 million', amount: 327 },
  { limit: 2500000, label: 'R1,500,001–R2.5 million', amount: 456 },
  { limit: 5000000, label: 'R2,500,001–R5 million', amount: 477 },
  { limit: Infinity, label: 'More than R5 million', amount: 486 }
];
const RESIDENTIAL_RATE_RATIO = .0095447;
const RESULT_KEYS = ['electricity', 'rates', 'water-sanitation', 'refuse'];
const TAX_SUMMARY_IDS = [
  'ws-water-before', 'ws-water-after', 'ws-levy-before', 'ws-levy-after',
  'ws-sanitation-before', 'ws-sanitation-after', 'ws-subtotal-before', 'ws-subtotal-after',
  'ws-vat-before', 'ws-vat-after', 'ws-total-before', 'ws-total-after',
  'refuse-ex-vat-before', 'refuse-ex-vat-after', 'refuse-vat-before', 'refuse-vat-after',
  'refuse-incl-before', 'refuse-incl-after'
];
const USER_FIELDS = [
  'property-value', 'rates-rebate', 'electricity-category', 'electricity-use',
  'electricity-free', 'water-meter', 'water-use', 'water-free',
  'demand-levy-amount', 'erf-size'
];

const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-ZA', {style:'currency', currency:'ZAR'}).format(Number.isFinite(value) ? value : 0);
const num = id => Math.max(0, Number($(id).value) || 0);

function progressive(units, bands) {
  let left = Math.max(0, units), total = 0;
  for (const [size, rate] of bands) {
    const used = Math.min(left, size);
    total += used * rate;
    left -= used;
    if (left <= 0) break;
  }
  return total;
}

function sanitationBand(size) {
  return SANITATION_BANDS.find(band => size <= band.limit);
}

function refuseBand(value) {
  return REFUSE_BANDS.find(band => value <= band.limit);
}

function hasAnyInput() {
  return USER_FIELDS.some(id => $(id).value !== '') || $('include-refuse').checked;
}

function electricityCharge() {
  const category = $('electricity-category').value;
  if (!category || !ELECTRICITY[category]) return 0;
  const billable = Math.max(0, num('electricity-use') - num('electricity-free'));
  return progressive(billable, ELECTRICITY[category]);
}

function ratesCharge() {
  const value = num('property-value');
  const exclusion = 300000;
  const taxable = Math.max(0, value - exclusion);
  const rebateType = $('rates-rebate').value;
  let rebatedTaxable = 0;
  if (rebateType && rebateType !== 'none') {
    const cap = rebateType === 'p70' ? 2000000 : 1500000;
    const eligibleValue = Math.max(0, Math.min(value, cap) - exclusion);
    const percentage = rebateType === 'p50' ? .5 : 1;
    rebatedTaxable = eligibleValue * percentage;
  }
  return Math.max(0, taxable - rebatedTaxable) * RESIDENTIAL_RATE_RATIO / 12;
}

function waterCharge() {
  const meter = $('water-meter').value;
  if (!meter || meter === 'none') return 0;
  const billable = Math.max(0, num('water-use') - num('water-free'));
  // The entered free allocation is deducted before the paid tariff bands are applied.
  const paidBands = WATER[meter].slice(1);
  return progressive(billable, paidBands);
}

function sanitationCharge() {
  const size = num('erf-size');
  if (!$('erf-size').value || size <= 0) return 0;
  return sanitationBand(size).amount;
}

function demandLevyCharge() {
  const meter = $('water-meter').value;
  if (!meter || meter === 'none' || !$('demand-levy-amount').value) return 0;
  return num('demand-levy-amount');
}

function refuseCharge() {
  if (!$('include-refuse').checked || !$('property-value').value) return 0;
  return refuseBand(num('property-value')).amount;
}

function updateGuidanceNotes() {
  const category = $('electricity-category').value;
  $('electricity-result-note').textContent = category
    ? 'City Power usage estimate · fixed charges excluded'
    : 'Select a City Power tariff to estimate usage';

  const size = num('erf-size');
  if ($('erf-size').value && size > 0) {
    const band = sanitationBand(size);
    $('sanitation-band-note').textContent = `${band.label} tariff band: ${money(band.amount)} before VAT. The calculator adds 15% VAT.`;
  } else {
    $('sanitation-band-note').textContent = 'Sanitation is charged by ERF-size band. Entering the exact size selects the correct band automatically.';
  }

  if (!$('include-refuse').checked) {
    $('refuse-band-note').textContent = 'Switch this on if refuse removal appears on your municipal account. It is a fixed monthly charge based on the municipal property-value band, plus 15% VAT.';
  } else if (!$('property-value').value) {
    $('refuse-band-note').textContent = 'Enter your municipal property value above to select the correct refuse band. The calculator then adds 15% VAT.';
  } else {
    const band = refuseBand(num('property-value'));
    $('refuse-band-note').textContent = `${band.label} property-value band: ${money(band.amount)} before VAT per month. The calculator adds 15% VAT.`;
  }
}

function updateExcludedStates() {
  const electricityInactive = !$('electricity-category').value;
  $('electricity-section').classList.toggle('is-awaiting-input', electricityInactive);
  $('electricity-use-field').classList.toggle('is-disabled', electricityInactive);
  $('electricity-free-field').classList.toggle('is-disabled', electricityInactive);
  $('electricity-use').disabled = electricityInactive;
  $('electricity-free').disabled = electricityInactive;

  const meter = $('water-meter').value;
  const waterInactive = !meter || meter === 'none';
  $('water-section').classList.toggle('is-excluded', meter === 'none');
  $('water-section').classList.toggle('is-awaiting-input', !meter);
  $('water-use-field').classList.toggle('is-disabled', waterInactive);
  $('water-free-field').classList.toggle('is-disabled', waterInactive);
  $('water-use').disabled = waterInactive;
  $('water-free').disabled = waterInactive;
  $('demand-levy-panel').classList.toggle('is-excluded', waterInactive);
  $('demand-levy-field').classList.toggle('is-disabled', waterInactive);
  $('demand-levy-amount').disabled = waterInactive;

  $('refuse-section').classList.toggle('is-excluded', !$('include-refuse').checked);
  updateGuidanceNotes();
}

function highlightResultUpdate() {
  $('results').classList.remove('is-updating');
  requestAnimationFrame(() => $('results').classList.add('is-updating'));
  clearTimeout(window.resultUpdateTimer);
  window.resultUpdateTimer = setTimeout(() => $('results').classList.remove('is-updating'), 220);
}

function showEmptyState() {
  ['before-total', 'grand-total', 'monthly-increase', 'annual-increase', 'effective-increase', 'total-vat'].forEach(id => {
    $(id).textContent = '—';
  });
  RESULT_KEYS.forEach(key => {
    $(`${key}-before`).textContent = '—';
    $(`${key}-total`).textContent = '—';
    $(`${key}-change`).textContent = '—';
    $(`${key}-bar`).style.width = '0%';
    $(`contribution-${key}`).style.width = '0%';
  });
  TAX_SUMMARY_IDS.forEach(id => { $(id).textContent = '—'; });
  $('water-sanitation-vat').textContent = 'Combined · includes 15% VAT';
  $('water-sanitation-levy-result').textContent = 'No demand levy entered';
  $('refuse-vat').textContent = 'Includes 15% VAT';
  $('result-note').textContent = 'Enter your household details to begin building an estimate. The totals will update as you go.';
  $('share-button').disabled = true;
  window.currentEstimate = null;
}

function calculate() {
  updateExcludedStates();
  if (!hasAnyInput()) {
    showEmptyState();
    return;
  }

  const waterUsageExVat = waterCharge();
  const levyExVat = demandLevyCharge();
  const sanitationExVat = sanitationCharge();
  const refuseExVat = refuseCharge();
  const beforeExcludingVat = {
    electricity: electricityCharge(), rates: ratesCharge(),
    water: waterUsageExVat + levyExVat, sanitation: sanitationExVat, refuse: refuseExVat
  };
  const before = {
    ...beforeExcludingVat,
    water: beforeExcludingVat.water * VAT_MULTIPLIER,
    sanitation: beforeExcludingVat.sanitation * VAT_MULTIPLIER,
    refuse: beforeExcludingVat.refuse * VAT_MULTIPLIER
  };
  const after = Object.fromEntries(Object.entries(before).map(([key,value]) => [key, value * INCREASE[key]]));
  const beforeTotal = Object.values(before).reduce((a,b) => a+b, 0);
  const afterTotal = Object.values(after).reduce((a,b) => a+b, 0);
  const increase = afterTotal - beforeTotal;
  const effective = beforeTotal ? increase / beforeTotal * 100 : 0;

  $('before-total').textContent = money(beforeTotal);
  $('grand-total').textContent = money(afterTotal);
  $('monthly-increase').textContent = `+ ${money(increase)}`;
  $('annual-increase').textContent = `+ ${money(increase * 12)}`;
  $('effective-increase').textContent = `+${effective.toFixed(1)}%`;

  const waterUsageAfterExVat = waterUsageExVat * INCREASE.water;
  const levyAfterExVat = levyExVat * INCREASE.water;
  const sanitationAfterExVat = sanitationExVat * INCREASE.sanitation;
  const refuseAfterExVat = refuseExVat * INCREASE.refuse;
  const wsSubtotalBefore = waterUsageExVat + levyExVat + sanitationExVat;
  const wsSubtotalAfter = waterUsageAfterExVat + levyAfterExVat + sanitationAfterExVat;
  const wsVatBefore = wsSubtotalBefore * VAT_RATE;
  const wsVatAfter = wsSubtotalAfter * VAT_RATE;
  const wsTotalBefore = wsSubtotalBefore + wsVatBefore;
  const wsTotalAfter = wsSubtotalAfter + wsVatAfter;
  const refuseVatBefore = refuseExVat * VAT_RATE;
  const refuseVatAfter = refuseAfterExVat * VAT_RATE;
  const totalVat = wsVatAfter + refuseVatAfter;

  $('ws-water-before').textContent = money(waterUsageExVat);
  $('ws-water-after').textContent = money(waterUsageAfterExVat);
  $('ws-levy-before').textContent = money(levyExVat);
  $('ws-levy-after').textContent = money(levyAfterExVat);
  $('ws-sanitation-before').textContent = money(sanitationExVat);
  $('ws-sanitation-after').textContent = money(sanitationAfterExVat);
  $('ws-subtotal-before').textContent = money(wsSubtotalBefore);
  $('ws-subtotal-after').textContent = money(wsSubtotalAfter);
  $('ws-vat-before').textContent = money(wsVatBefore);
  $('ws-vat-after').textContent = money(wsVatAfter);
  $('ws-total-before').textContent = money(wsTotalBefore);
  $('ws-total-after').textContent = money(wsTotalAfter);

  $('refuse-ex-vat-before').textContent = money(refuseExVat);
  $('refuse-ex-vat-after').textContent = money(refuseAfterExVat);
  $('refuse-vat-before').textContent = money(refuseVatBefore);
  $('refuse-vat-after').textContent = money(refuseVatAfter);
  $('refuse-incl-before').textContent = money(refuseExVat + refuseVatBefore);
  $('refuse-incl-after').textContent = money(refuseAfterExVat + refuseVatAfter);

  $('water-sanitation-vat').textContent = `Combined · includes ${money(wsVatAfter)} VAT`;
  $('water-sanitation-levy-result').textContent = levyAfterExVat ? `Demand levy before VAT ${money(levyAfterExVat)}` : 'No demand levy entered';
  $('refuse-vat').textContent = `Includes ${money(refuseVatAfter)} VAT`;
  $('total-vat').textContent = money(totalVat);

  const viewBefore = {
    electricity: before.electricity,
    rates: before.rates,
    'water-sanitation': before.water + before.sanitation,
    refuse: before.refuse
  };
  const viewAfter = {
    electricity: after.electricity,
    rates: after.rates,
    'water-sanitation': after.water + after.sanitation,
    refuse: after.refuse
  };
  const serviceChanges = {
    electricity: after.electricity - before.electricity,
    rates: after.rates - before.rates,
    water: after.water - before.water,
    sanitation: after.sanitation - before.sanitation,
    waterSanitation: (after.water + after.sanitation) - (before.water + before.sanitation),
    refuse: after.refuse - before.refuse
  };
  Object.entries(viewAfter).forEach(([key,value]) => {
    const change = value - viewBefore[key];
    const share = increase ? Math.max(0, change / increase * 100) : 0;
    $(`${key}-before`).textContent = money(viewBefore[key]);
    $(`${key}-total`).textContent = money(value);
    $(`${key}-change`).textContent = `+${money(change)}`;
    $(`${key}-bar`).style.width = `${share}%`;
    $(`contribution-${key}`).style.width = `${share}%`;
  });

  const free = Math.min(num('electricity-free'), num('electricity-use'));
  $('result-note').textContent = free
    ? `${free} free electricity units have been deducted. Water and sanitation are combined before 15% VAT is calculated; refuse has a separate 15% VAT calculation. Property rates are VAT-exempt. Electricity fixed charges are excluded.`
    : 'Water and sanitation are combined before 15% VAT is calculated; refuse has a separate 15% VAT calculation. Property rates are VAT-exempt (0%). Electricity fixed charges are excluded.';

  $('share-button').disabled = false;
  highlightResultUpdate();
  window.currentEstimate = {
    beforeTotal, afterTotal, increase, effective, before, after, serviceChanges, totalVat,
    levyBefore: levyExVat * VAT_MULTIPLIER, levyAfter: levyAfterExVat * VAT_MULTIPLIER,
    wsVatBefore, wsVatAfter, refuseVatBefore, refuseVatAfter
  };
}

$('tariff-form').addEventListener('input', calculate);
$('tariff-form').addEventListener('change', calculate);
$('share-button').addEventListener('click', async () => {
  const e = window.currentEstimate;
  if (!e) return;
  const cleanMoney = value => money(value).replace(/\u00a0/g, ' ');
  const calculatorUrl = window.location.href.split('#')[0];
  const text = `CRA Johannesburg Tariff Calculator estimate

Before 1 July 2026: ${cleanMoney(e.beforeTotal)} per month
From 1 July 2026: ${cleanMoney(e.afterTotal)} per month
Estimated monthly increase: ${cleanMoney(e.increase)}
Estimated annual increase: ${cleanMoney(e.increase * 12)}
Effective increase: ${e.effective.toFixed(1)}%
VAT included in new monthly total: ${cleanMoney(e.totalVat)}

Post-increase service breakdown:
Electricity usage: ${cleanMoney(e.after.electricity)} (fixed charges excluded)
Property rates: ${cleanMoney(e.after.rates)}
Water & sanitation: ${cleanMoney(e.after.water + e.after.sanitation)} (combined VAT: ${cleanMoney(e.wsVatAfter)})
Refuse removal: ${cleanMoney(e.after.refuse)}
Water demand management levy (included above): ${cleanMoney(e.levyAfter)}

Try the calculator here: ${calculatorUrl}

This total includes 15% VAT on water, sanitation and refuse. Property rates are VAT-exempt. Electricity fixed, service, capacity and network charges are not included.

This is an indicative estimate, not an official municipal quotation.`;
  try { await navigator.clipboard.writeText(text); }
  catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  $('copied').classList.add('show');
  $('share-button').querySelector('span').textContent = 'Copied to clipboard';
  setTimeout(() => {
    $('copied').classList.remove('show');
    $('share-button').querySelector('span').textContent = 'Copy my estimate';
  }, 2400);
});

$('tariff-form').reset();
calculate();
