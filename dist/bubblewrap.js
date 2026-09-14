"use strict";
const initialExpenses = [
    { name: 'Restaurants', value: 0, color: '#d94a4a' },
    { name: 'Groceries', value: 0, color: '#4aa8d8' },
    { name: 'Transportation', value: 0, color: '#9b6ad6' },
    { name: 'Healthcare', value: 0, color: '#f0b53d' },
    { name: 'Education', value: 0, color: '#69c48a' },
    { name: 'Household Expenses', value: 0, color: '#4cb3db' },
    { name: 'Personal Expenses', value: 0, color: '#65b65e' },
    { name: 'Retail', value: 0, color: '#f2997c' },
    { name: 'Entertainment & Recreation', value: 0, color: '#f5d35c' },
    { name: 'Travel', value: 0, color: '#6f7de8' },
    { name: 'Foreign Currency Transactions', value: 0, color: '#3d95d0' }
];
const initialSavings = [
    { name: 'Savings', value: 0, color: '#66b36a' },
    { name: 'TFSA', value: 0, color: '#9c4bda' },
    { name: 'FHSA', value: 0, color: '#2cb7a6' },
    { name: 'RRSP', value: 0, color: '#f09a22' }
];
const initialState = {
    income: 0,
    expenses: initialExpenses.map((category) => ({ ...category })),
    savings: initialSavings.map((category) => ({ ...category }))
};
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
    const positiveCategories = categories.filter((category) => category.value > 0);
    const total = Math.max(sumValues(categories), 1);
    if (positiveCategories.length === 1) {
        const circumference = 2 * Math.PI * radius;
        const strokeWidth = radius - innerRadius;
        const color = positiveCategories[0].color;
        return `
      <svg viewBox="0 0 280 280" aria-label="Budget donut chart" role="img">
        <circle cx="140" cy="140" r="${radius}" fill="none" stroke="#f4f4f4" stroke-width="${strokeWidth}" />
        <circle
          cx="140"
          cy="140"
          r="${radius}"
          fill="none"
          stroke="${color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference} ${circumference}"
          stroke-linecap="round"
          transform="rotate(-90 140 140)"
        />
        <circle cx="140" cy="140" r="${innerRadius}" fill="#f4f4f4"></circle>
      </svg>
    `;
    }
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
      <circle cx="140" cy="140" r="${radius}" fill="#f4f4f4"></circle>
      ${segments.join('')}
      <circle cx="140" cy="140" r="${innerRadius}" fill="#f4f4f4"></circle>
    </svg>
  `;
}
function getSummary(state) {
    const totalExpenses = sumValues(state.expenses);
    const totalSavings = sumValues(state.savings);
    const totalIncome = state.income;
    const cashBalance = totalIncome - totalExpenses - totalSavings;
    return {
        totalIncome,
        totalExpenses,
        totalSavings,
        cashBalance
    };
}
function renderSummary(state) {
    const summary = getSummary(state);
    const rows = [
        { label: 'Total Income', value: formatCurrency(summary.totalIncome) },
        { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses) },
        { label: 'Total Savings', value: formatCurrency(summary.totalSavings) },
        { label: 'Cash Balance', value: formatCurrency(summary.cashBalance) }
    ];
    const chartCategories = [
        ...state.expenses,
        ...state.savings,
        { name: 'Cash Balance', value: Math.max(summary.cashBalance, 0), color: '#3abf72' }
    ];
    return `
    <div class="summary-grid">
      <div class="donut-wrap">
        ${createDonutChart(chartCategories)}
      </div>
      <div class="summary-values">
        ${rows
        .map((row) => `
              <div class="summary-row">
                <div class="label">${row.label}</div>
                <div class="value">${row.value}</div>
              </div>
            `)
        .join('')}
      </div>
    </div>
  `;
}
function renderEditableSection(title, categories) {
    return `
    <div class="section">
      <div class="section-header">${title}</div>
      <div class="entry-list">
        ${categories
        .map((category, index) => `
              <label class="entry-row input-row">
                <span>${category.name}</span>
                <input
                  type="number"
                  step="0.01"
                  data-section="${title === 'Monthly Income' ? 'income' : title === 'Monthly Expenses' ? 'expenses' : 'savings'}"
                  data-index="${index}"
                  value="${category.value}"
                />
              </label>
            `)
        .join('')}
      </div>
    </div>
  `;
}
function renderApp() {
    const app = document.getElementById('app');
    if (!app) {
        return;
    }
    const summary = getSummary(initialState);
    const incomeInput = [
        {
            name: 'Monthly Income',
            value: initialState.income,
            color: '#4d7ef7'
        }
    ];
    app.innerHTML = `
    <div class="banner">
      <div class="banner-row white">
        <div class="banner-title">Budget</div>
      </div>
      <div class="banner-row green">
        <div class="banner-subtitle">Summary</div>
      </div>
    </div>
    ${renderSummary(initialState)}
    ${renderEditableSection('Monthly Income', incomeInput)}
    ${renderEditableSection('Monthly Expenses', initialState.expenses)}
    ${renderEditableSection('Monthly Savings', initialState.savings)}
  `;
    const fields = app.querySelectorAll('input[type="number"]');
    fields.forEach((field) => {
        field.addEventListener('input', () => {
            const section = field.dataset.section;
            const index = Number(field.dataset.index ?? 0);
            if (section === 'income') {
                initialState.income = Number(field.value) || 0;
            }
            else if (section === 'expenses') {
                initialState.expenses[index].value = Number(field.value) || 0;
            }
            else if (section === 'savings') {
                initialState.savings[index].value = Number(field.value) || 0;
            }
            renderApp();
        });
    });
}
document.addEventListener('DOMContentLoaded', renderApp);
