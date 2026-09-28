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
function createInitialState() {
    return {
        income: 0,
        expenses: initialExpenses.map((category) => ({ ...category })),
        savings: initialSavings.map((category) => ({ ...category })),
        transactions: []
    };
}
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const spreadsheets = months.map((name) => ({ name, state: createInitialState() }));
let activeSpreadsheetIndex = 0;
let showGuidelineOverlay = false;
const budgetingGuidelines = [
    { name: 'Housing', percentage: 35, color: '#e45757' },
    { name: 'Transportation', percentage: 15, color: '#ed9b40' },
    { name: 'Food', percentage: 20, color: '#e6cb45' },
    { name: 'Debt payments', percentage: 15, color: '#65b86b' },
    { name: 'Personal spending', percentage: 4, color: '#45b8a7' },
    { name: 'Savings', percentage: 5, color: '#4b83d1' },
    { name: 'Utilities', percentage: 5, color: '#8659ba' },
    { name: 'Clothing', percentage: 3, color: '#c15c9e' },
    { name: 'Medical', percentage: 3, color: '#777777' }
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
    const positiveCategories = categories.filter((category) => category.value > 0);
    const total = Math.max(sumValues(categories), 1);
    if (positiveCategories.length === 1) {
        const strokeWidth = radius - innerRadius;
        const strokeRadius = innerRadius + strokeWidth / 2;
        const circumference = 2 * Math.PI * strokeRadius;
        const color = positiveCategories[0].color;
        return `
      <svg viewBox="0 0 280 280" aria-label="Budget donut chart" role="img">
        <circle cx="140" cy="140" r="${strokeRadius}" fill="none" stroke="#f4f4f4" stroke-width="${strokeWidth}" />
        <circle
          cx="140"
          cy="140"
          r="${strokeRadius}"
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
function createGuidelinePie() {
    const total = budgetingGuidelines.reduce((sum, item) => sum + item.percentage, 0);
    let cumulative = 0;
    const slices = budgetingGuidelines.map((item) => {
        const start = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
        cumulative += item.percentage;
        const end = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
        const overlayRadius = 54;
        const x1 = 140 + overlayRadius * Math.cos(start);
        const y1 = 140 + overlayRadius * Math.sin(start);
        const x2 = 140 + overlayRadius * Math.cos(end);
        const y2 = 140 + overlayRadius * Math.sin(end);
        const largeArc = end - start > Math.PI ? 1 : 0;
        const label = `${item.name}: ${item.percentage}%`;
        return `<path d="M 140 140 L ${x1} ${y1} A ${overlayRadius} ${overlayRadius} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${item.color}" aria-label="${label}" tabindex="0"><title>${label}</title></path>`;
    });
    return `<svg class="guideline-pie${showGuidelineOverlay ? '' : ' hidden'}" viewBox="0 0 280 280" aria-label="Credit Counselling Society recommended budget guidelines" role="img">${slices.join('')}</svg>`;
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
        ${createGuidelinePie()}
      </div>
      <div class="summary-values">
        <label class="guidelines-toggle"><input class="guidelines-checkbox" type="checkbox"${showGuidelineOverlay ? ' checked' : ''} /> Credit Counselling Society</label>
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
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character] ?? character);
}
function renderCategorySection(title, categories, transactions) {
    return `
    <div class="section">
      <div class="section-header">${title}</div>
      <div class="entry-list">
        ${categories.map((category) => {
        const entries = transactions.filter((transaction) => transaction.category === category.name);
        return `
            <details class="category-accordion">
              <summary class="entry-row category-summary">
                <span>${category.name}</span>
                <span class="amount">${formatCurrency(category.value)}</span>
              </summary>
              <div class="transaction-list">
                ${entries.length ? entries.map((transaction) => `
                  <div class="transaction-row">
                    <span>${escapeHtml(transaction.name)}</span>
                    <span class="amount">${formatCurrency(transaction.amount)}</span>
                  </div>
                `).join('') : '<div class="empty-transactions">No transactions yet</div>'}
              </div>
            </details>
          `;
    }).join('')}
      </div>
    </div>
  `;
}
function renderTransactionPage() {
    const state = spreadsheets[activeSpreadsheetIndex].state;
    const categories = ['Monthly Income', ...state.expenses.map(({ name }) => name), ...state.savings.map(({ name }) => name)];
    return `
    <div class="transaction-page">
      <div class="transaction-page-heading">
        <button class="back-button" type="button" aria-label="Back to spreadsheet"></button>
        <h1>Add Transaction</h1>
      </div>
      <form id="transaction-form" class="transaction-form">
        <label>Transaction name<input name="name" type="text" required maxlength="100" autocomplete="off" /></label>
        <label>Category<select name="category" required>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}</select></label>
        <label>Amount<input name="amount" type="number" step="0.01" min="0.01" required inputmode="decimal" /></label>
        <button class="save-transaction-button" type="submit">Add Transaction</button>
      </form>
    </div>
  `;
}
function renderBottomToolbar() {
    return `
    <div class="bottom-toolbar" role="toolbar" aria-label="Budget spreadsheets">
      <div class="sheet-tabs" role="tablist" aria-label="Spreadsheets">
        ${spreadsheets
        .map((spreadsheet, index) => `
              <button
                class="sheet-tab${index === activeSpreadsheetIndex ? ' active' : ''}"
                type="button"
                role="tab"
                aria-selected="${index === activeSpreadsheetIndex}"
                data-sheet-index="${index}"
              >${spreadsheet.name}</button>
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
    const activeState = spreadsheets[activeSpreadsheetIndex].state;
    app.innerHTML = `
    <div class="spreadsheet-content">
      <div class="banner">
        <div class="banner-row white">
          <div class="banner-title">Budget</div>
        </div>
        <div class="banner-row green">
          <div class="banner-subtitle">Summary</div>
        </div>
      </div>
      ${renderSummary(activeState)}
      ${renderCategorySection('Monthly Income', [{ name: 'Monthly Income', value: activeState.income, color: '#4d7ef7' }], activeState.transactions)}
      ${renderCategorySection('Monthly Expenses', activeState.expenses, activeState.transactions)}
      ${renderCategorySection('Monthly Savings', activeState.savings, activeState.transactions)}
    </div>
    ${showTransactionPage ? '' : '<button class="add-transaction-button" type="button" aria-label="Add transaction">+</button>'}
    ${renderBottomToolbar()}
  `;
    app.classList.toggle('transaction-open', showTransactionPage);
    if (showTransactionPage) {
        app.insertAdjacentHTML('beforeend', '<button class="transaction-backdrop" type="button" aria-label="Close add transaction"></button>');
        app.insertAdjacentHTML('beforeend', renderTransactionPage());
        app.querySelector('.transaction-backdrop')?.addEventListener('click', () => {
            showTransactionPage = false;
            renderApp();
        });
        app.querySelector('.back-button')?.addEventListener('click', () => {
            showTransactionPage = false;
            renderApp();
        });
        app.querySelector('#transaction-form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const amount = Number(data.get('amount'));
            if (!Number.isFinite(amount) || amount <= 0)
                return;
            const name = String(data.get('name') ?? '').trim();
            const category = String(data.get('category') ?? '');
            if (!name || !category)
                return;
            activeState.transactions.push({ name, category, amount });
            if (category === 'Monthly Income')
                activeState.income += amount;
            else {
                const target = [...activeState.expenses, ...activeState.savings].find((item) => item.name === category);
                if (target)
                    target.value += amount;
            }
            showTransactionPage = false;
            renderApp();
        });
        bindSheetTabs(app);
        return;
    }
    app.querySelector('.add-transaction-button')?.addEventListener('click', () => {
        showTransactionPage = true;
        renderApp();
    });
    app.querySelector('.guidelines-checkbox')?.addEventListener('change', (event) => {
        showGuidelineOverlay = event.currentTarget.checked;
        app.querySelector('.guideline-pie')?.classList.toggle('hidden', !showGuidelineOverlay);
    });
    bindSheetTabs(app);
}
let showTransactionPage = false;
function bindSheetTabs(app) {
    app.querySelectorAll('.sheet-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            activeSpreadsheetIndex = Number(tab.dataset.sheetIndex ?? 0);
            renderApp();
        });
    });
}
document.addEventListener('DOMContentLoaded', renderApp);
