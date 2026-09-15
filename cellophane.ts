type Category = {
  name: string;
  value: number;
  color: string;
};

type Summary = {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  cashBalance: number;
};

type BudgetState = {
  income: number;
  expenses: Category[];
  savings: Category[];
};

type Spreadsheet = {
  name: string;
  state: BudgetState;
};

const initialExpenses: Category[] = [
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

const initialSavings: Category[] = [
  { name: 'Savings', value: 0, color: '#66b36a' },
  { name: 'TFSA', value: 0, color: '#9c4bda' },
  { name: 'FHSA', value: 0, color: '#2cb7a6' },
  { name: 'RRSP', value: 0, color: '#f09a22' }
];

function createInitialState(): BudgetState {
  return {
    income: 0,
    expenses: initialExpenses.map((category) => ({ ...category })),
    savings: initialSavings.map((category) => ({ ...category }))
  };
}

const spreadsheets: Spreadsheet[] = [
  { name: 'Budget 1', state: createInitialState() }
];
let activeSpreadsheetIndex = 0;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 5
  }).format(value);
}

function sumValues(categories: Category[]): number {
  return categories.reduce((total, category) => total + category.value, 0);
}

function createDonutChart(categories: Category[], radius = 118, innerRadius = 54): string {
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

function getSummary(state: BudgetState): Summary {
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

function renderSummary(state: BudgetState): string {
  const summary = getSummary(state);
  const rows = [
    { label: 'Total Income', value: formatCurrency(summary.totalIncome) },
    { label: 'Total Expenses', value: formatCurrency(summary.totalExpenses) },
    { label: 'Total Savings', value: formatCurrency(summary.totalSavings) },
    { label: 'Cash Balance', value: formatCurrency(summary.cashBalance) }
  ];

  const chartCategories: Category[] = [
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
          .map(
            (row) => `
              <div class="summary-row">
                <div class="label">${row.label}</div>
                <div class="value">${row.value}</div>
              </div>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderEditableSection(title: string, categories: Category[]): string {
  return `
    <div class="section">
      <div class="section-header">${title}</div>
      <div class="entry-list">
        ${categories
          .map(
            (category, index) => `
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
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderBottomToolbar(): string {
  return `
    <div class="bottom-toolbar" role="toolbar" aria-label="Budget spreadsheets">
      <button class="add-sheet-button" type="button" aria-label="Add spreadsheet">+</button>
      <div class="sheet-tabs" role="tablist" aria-label="Spreadsheets">
        ${spreadsheets
          .map(
            (spreadsheet, index) => `
              <button
                class="sheet-tab${index === activeSpreadsheetIndex ? ' active' : ''}"
                type="button"
                role="tab"
                aria-selected="${index === activeSpreadsheetIndex}"
                data-sheet-index="${index}"
              >${spreadsheet.name}</button>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderApp(): void {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const activeState = spreadsheets[activeSpreadsheetIndex].state;
  const incomeInput = [
    {
      name: 'Monthly Income',
      value: activeState.income,
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
    ${renderSummary(activeState)}
    ${renderEditableSection('Monthly Income', incomeInput)}
    ${renderEditableSection('Monthly Expenses', activeState.expenses)}
    ${renderEditableSection('Monthly Savings', activeState.savings)}
    ${renderBottomToolbar()}
  `;

  const addSheetButton = app.querySelector<HTMLButtonElement>('.add-sheet-button');
  addSheetButton?.addEventListener('click', () => {
    spreadsheets.push({
      name: `Budget ${spreadsheets.length + 1}`,
      state: createInitialState()
    });
    activeSpreadsheetIndex = spreadsheets.length - 1;
    renderApp();
  });

  app.querySelectorAll<HTMLButtonElement>('.sheet-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeSpreadsheetIndex = Number(tab.dataset.sheetIndex ?? 0);
      renderApp();
    });
  });

  const fields = app.querySelectorAll<HTMLInputElement>('input[type="number"]');
  fields.forEach((field) => {
    field.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      const section = field.dataset.section;
      const index = Number(field.dataset.index ?? 0);

      const activeState = spreadsheets[activeSpreadsheetIndex].state;

      if (section === 'income') {
        activeState.income = Number(field.value) || 0;
      } else if (section === 'expenses') {
        activeState.expenses[index].value = Number(field.value) || 0;
      } else if (section === 'savings') {
        activeState.savings[index].value = Number(field.value) || 0;
      }

      renderApp();
    });
  });
}

document.addEventListener('DOMContentLoaded', renderApp);
