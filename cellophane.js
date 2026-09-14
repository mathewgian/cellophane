const expenseCategories = [
  { name: 'Restaurants', value: 3658.759997, color: '#d94a4a' },
  { name: 'Groceries', value: 247.1, color: '#4aa8d8' },
  { name: 'Transportation', value: 1152.1, color: '#9b6ad6' },
  { name: 'Healthcare', value: 852.41, color: '#f0b53d' },
  { name: 'Education', value: 3894.86, color: '#69c48a' },
  { name: 'Household Expenses', value: 423.95, color: '#4cb3db' },
  { name: 'Personal Expenses', value: 751.91, color: '#65b65e' },
  { name: 'Retail', value: 985.73, color: '#f2997c' },
  { name: 'Entertainment & Recreation', value: 1313.71, color: '#f5d35c' },
  { name: 'Travel', value: 1119.77, color: '#6f7de8' },
  { name: 'Foreign Currency Transactions', value: 977.76, color: '#3d95d0' }
];

const savingsCategories = [
  { name: 'Savings', value: -6505.94028, color: '#66b36a' },
  { name: 'TFSA', value: 7000, color: '#9c4bda' },
  { name: 'FHSA', value: 8000, color: '#2cb7a6' },
  { name: 'RRSP', value: 0, color: '#f09a22' }
];

const incomes = [
  { name: 'Monthly Income', value: 22851.87058, color: '#4d7ef7' }
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5
  }).format(value);
}

function sumValues(categories) {
  return categories.reduce((total, category) => total + category.value, 0);
}

function createDonutChart(categories, radius = 118, innerRadius = 54) {
  const total = Math.max(sumValues(categories), 1);
  let cumulative = 0;

  const segments = categories.map((category) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += category.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = 140 + radius * Math.cos(startAngle);
    const y1 = 140 + radius * Math.sin(startAngle);
    const x2 = 140 + radius * Math.cos(endAngle);
    const y2 = 140 + radius * Math.sin(endAngle);
    const x3 = 140 + innerRadius * Math.cos(endAngle);
    const y3 = 140 + innerRadius * Math.sin(endAngle);
    const x4 = 140 + innerRadius * Math.cos(startAngle);
    const y4 = 140 + innerRadius * Math.sin(startAngle);

    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return `<path d="${path}" fill="${category.color}" opacity="0.9"></path>`;
  });

  return `
    <svg viewBox="0 0 280 280" aria-label="Budget donut chart" role="img">
      ${segments.join('')}
      <circle cx="140" cy="140" r="54" fill="#f4f4f4"></circle>
    </svg>
  `;
}

function renderSummary(summary) {
  const rows = [
    { label: 'Total Income', value: formatCurrency(summary.totalIncome) },
    { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses) },
    { label: 'Total Savings', value: formatCurrency(summary.totalSavings) },
    { label: 'Cash Balance', value: formatCurrency(summary.cashBalance) }
  ];

  return `
    <div class="summary-grid">
      <div class="donut-wrap">
        ${createDonutChart([...expenseCategories, ...savingsCategories])}
      </div>
      <div class="summary-values">
        ${rows.map((row) => `
          <div class="summary-row">
            <div class="label">${row.label}</div>
            <div class="value">${row.value}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderList(title, categories) {
  const sorted = [...categories].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return `
    <div class="section">
      <div class="section-header">${title}</div>
      <div class="entry-list">
        ${sorted.map((category) => `
          <div class="entry-row">
            <div>${category.name}</div>
            <div class="amount ${category.value < 0 ? 'negative' : ''}">${formatCurrency(category.value)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bootstrap() {
  const totalExpenses = sumValues(expenseCategories);
  const totalSavings = sumValues(savingsCategories);
  const totalIncome = sumValues(incomes);
  const cashBalance = totalIncome - totalExpenses - totalSavings;

  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="banner">
      <div class="banner-title">Budget</div>
      <div class="banner-subtitle">Summary</div>
    </div>
    ${renderSummary({ totalIncome, totalExpenses, totalSavings, cashBalance })}
    ${renderList('Monthly Income', incomes)}
    ${renderList('Monthly Expenses', expenseCategories)}
    ${renderList('Monthly Savings', savingsCategories)}
  `;
}

document.addEventListener('DOMContentLoaded', bootstrap);
