// LendTrack Pro Node.js Web Application Logic with Multi-Currency Engine

const CURRENCY_CONFIG = {
    INR: { symbol: '₹', code: 'INR', locale: 'en-IN', rate: 83.5, name: 'Indian Rupee (₹)' },
    USD: { symbol: '$', code: 'USD', locale: 'en-US', rate: 1.0, name: 'US Dollar ($)' },
    EUR: { symbol: '€', code: 'EUR', locale: 'de-DE', rate: 0.92, name: 'Euro (€)' },
    GBP: { symbol: '£', code: 'GBP', locale: 'en-GB', rate: 0.79, name: 'British Pound (£)' },
    JPY: { symbol: '¥', code: 'JPY', locale: 'ja-JP', rate: 155.0, name: 'Japanese Yen (¥)' },
    AUD: { symbol: 'A$', code: 'AUD', locale: 'en-AU', rate: 1.52, name: 'Australian Dollar (A$)' },
    CAD: { symbol: 'C$', code: 'CAD', locale: 'en-CA', rate: 1.37, name: 'Canadian Dollar (C$)' },
    AED: { symbol: 'AED', code: 'AED', locale: 'en-AE', rate: 3.67, name: 'UAE Dirham (AED)' }
};

let currentCurrency = 'INR';
let portfolioChartInstance = null;
let currentBorrowers = [];
let currentLoans = [];
let currentTransactions = [];

document.addEventListener('DOMContentLoaded', () => {
    initCurrencySelector();
    initNavigation();
    initTheme();
    initModals();
    initForms();
    initSearchAndFilters();
    
    // Initial fetch from Node API
    loadAllData();
});

// Auto Detect & Multi Currency Controller
function detectUserCurrency() {
    const saved = localStorage.getItem('lendtrack_currency');
    if (saved && CURRENCY_CONFIG[saved]) {
        return saved;
    }
    const timeZone = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    const lang = (navigator.language || '').toLowerCase();
    
    if (timeZone.includes('kolkata') || timeZone.includes('calcutta') || lang.includes('in')) {
        return 'INR';
    } else if (timeZone.includes('london') || lang.includes('gb')) {
        return 'GBP';
    } else if (timeZone.includes('europe') || lang.includes('de') || lang.includes('fr') || lang.includes('es')) {
        return 'EUR';
    } else if (timeZone.includes('tokyo') || lang.includes('jp')) {
        return 'JPY';
    } else if (timeZone.includes('australia') || lang.includes('au')) {
        return 'AUD';
    }
    return 'INR';
}

function initCurrencySelector() {
    currentCurrency = detectUserCurrency();
    const selector = document.getElementById('currencySelector');
    if (selector) {
        selector.value = currentCurrency;
        selector.addEventListener('change', (e) => {
            currentCurrency = e.target.value;
            localStorage.setItem('lendtrack_currency', currentCurrency);
            updateCurrencySymbolsUI();
            loadAllData();
            showToast(`Currency switched to ${CURRENCY_CONFIG[currentCurrency].name}`);
        });
    }
    updateCurrencySymbolsUI();
}

function updateCurrencySymbolsUI() {
    const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.INR;
    document.querySelectorAll('.curr-symbol').forEach(el => {
        el.textContent = config.symbol;
    });
    const display = document.getElementById('activeCurrencyDisplay');
    if (display) {
        display.textContent = `${config.code} (${config.symbol} - ${config.name})`;
    }
}

// Toast notification helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success' 
                ? '<polyline points="20 6 9 17 4 12"/>' 
                : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Multi-Currency Format Utility
function formatCurrency(val) {
    const num = parseFloat(val || 0);
    const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.INR;
    const converted = num * config.rate;
    
    return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        maximumFractionDigits: 2
    }).format(converted);
}

// 1. Navigation Controller
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');
    const viewTitle = document.getElementById('viewTitle');
    const viewSubtitle = document.getElementById('viewSubtitle');

    const viewTitles = {
        dashboard: { title: 'Financial Portfolio Dashboard', sub: 'Overview of capital allocation, recovery performance, and active borrower ledgers' },
        borrowers: { title: 'Borrowers Ledger Directory', sub: 'Manage borrower profiles, credit ratings, contact records, and outstanding debts' },
        loans: { title: 'Loan Contracts & Capital Ledger', sub: 'Monitor active loan disbursements, interest schedules, balances, and payoffs' },
        calculator: { title: 'Financial EMI & Amortization Engine', sub: 'Simulate loan schedules with reducing balance or flat interest models' },
        settings: { title: 'Backup & Node System Engine', sub: 'Export or restore application datasets directly from Node Express backend' }
    };

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.dataset.view;

            navItems.forEach(i => i.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            btn.classList.add('active');
            const targetEl = document.getElementById(`view-${targetView}`);
            if (targetEl) targetEl.classList.add('active');

            if (viewTitles[targetView]) {
                viewTitle.textContent = viewTitles[targetView].title;
                viewSubtitle.textContent = viewTitles[targetView].sub;
            }

            if (targetView === 'dashboard') loadAllData();
            if (targetView === 'borrowers') renderBorrowers();
            if (targetView === 'loans') renderLoans();
            if (targetView === 'calculator') triggerCalc();
        });
    });

    // Header Quick Nav Buttons
    const btnOpenCalcQuick = document.getElementById('btnOpenCalcQuick');
    if (btnOpenCalcQuick) {
        btnOpenCalcQuick.addEventListener('click', () => {
            document.querySelector('[data-view="calculator"]').click();
        });
    }
    const btnNavLoans = document.getElementById('btnNavLoans');
    if (btnNavLoans) {
        btnNavLoans.addEventListener('click', () => {
            document.querySelector('[data-view="loans"]').click();
        });
    }
}

// 2. Theme Toggle
function initTheme() {
    const btn = document.getElementById('themeToggle');
    const label = document.getElementById('themeLabel');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            label.textContent = 'Dark Theme';
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            label.textContent = 'Light Theme';
        }
    });
}

// 3. Modals Initialization
function initModals() {
    const closeBtns = document.querySelectorAll('[data-close]');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.close;
            closeModal(targetId);
        });
    });

    // Quick Action Triggers
    document.getElementById('btnOpenAddBorrower')?.addEventListener('click', () => openModal('modalBorrower'));
    document.getElementById('btnAddBorrowerPage')?.addEventListener('click', () => openModal('modalBorrower'));
    document.getElementById('btnOpenIssueLoan')?.addEventListener('click', () => {
        populateBorrowerDropdown();
        openModal('modalLoan');
    });
    document.getElementById('btnDisburseLoanLoans')?.addEventListener('click', () => {
        populateBorrowerDropdown();
        openModal('modalLoan');
    });
    document.getElementById('btnOpenRecordPaymentDash')?.addEventListener('click', () => {
        populateActiveLoansDropdown();
        openModal('modalPayment');
    });
    document.getElementById('btnRecordPaymentLoans')?.addEventListener('click', () => {
        populateActiveLoansDropdown();
        openModal('modalPayment');
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// 4. Data Loading & API Calls
async function loadAllData() {
    try {
        const [statsRes, borrowersRes, loansRes, txnsRes] = await Promise.all([
            fetch('/api/stats'),
            fetch('/api/borrowers'),
            fetch('/api/loans'),
            fetch('/api/transactions')
        ]);

        const stats = await statsRes.json();
        currentBorrowers = await borrowersRes.json();
        currentLoans = await loansRes.json();
        currentTransactions = await txnsRes.json();

        renderStats(stats);
        renderChart(stats);
        renderActiveLoansWidget();
        renderDashTransactions();
        renderBorrowers();
        renderLoans();
    } catch (err) {
        console.error('Failed to connect to Node API:', err);
        showToast('Error connecting to Node backend server.', 'error');
    }
}

// Render Stats Cards
function renderStats(stats) {
    document.getElementById('statTotalCapital').textContent = formatCurrency(stats.totalCapitalLent);
    document.getElementById('statActiveLoansCount').textContent = `${stats.activeLoansCount} Active Loans`;
    document.getElementById('statPrincipalCollected').textContent = formatCurrency(stats.totalPrincipalCollected);
    document.getElementById('statRecoveryRate').textContent = `${stats.recoveryRate}% Recovered`;
    document.getElementById('statInterestEarned').textContent = formatCurrency(stats.totalInterestEarned);
    document.getElementById('statOutstandingBalance').textContent = formatCurrency(stats.totalOutstandingBalance);
    document.getElementById('statOverdueCount').textContent = `${stats.overdueLoansCount} Overdue Contracts`;
}

// Render Chart.js Analytics
function renderChart(stats) {
    const ctx = document.getElementById('portfolioChart')?.getContext('2d');
    if (!ctx) return;

    if (portfolioChartInstance) {
        portfolioChartInstance.destroy();
    }

    const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.INR;

    portfolioChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Recovered Principal', 'Realized Interest', 'Outstanding Portfolio Balance'],
            datasets: [{
                data: [
                    parseFloat((stats.totalPrincipalCollected * config.rate).toFixed(2)),
                    parseFloat((stats.totalInterestEarned * config.rate).toFixed(2)),
                    parseFloat((stats.totalOutstandingBalance * config.rate).toFixed(2))
                ],
                backgroundColor: ['#10b981', '#059669', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } }
                }
            },
            cutout: '70%'
        }
    });
}

// Render Active Loans Widget in Dashboard
function renderActiveLoansWidget() {
    const container = document.getElementById('activeLoansWidget');
    if (!container) return;

    const activeList = currentLoans.filter(l => l.status === 'Active' || l.status === 'Overdue').slice(0, 4);

    if (activeList.length === 0) {
        container.innerHTML = `<div class="p-3 text-muted text-sm">No active loans found.</div>`;
        return;
    }

    container.innerHTML = activeList.map(loan => `
        <div class="flex-between p-3 my-1 border-bottom" style="border-bottom: 1px solid var(--border-color)">
            <div>
                <strong style="font-size:0.9rem">${loan.borrowerName}</strong>
                <div class="text-muted" style="font-size:0.75rem">${loan.id} &bull; EMI: ${formatCurrency(loan.monthlyEmi)}</div>
            </div>
            <div class="text-right">
                <span class="badge ${loan.status === 'Overdue' ? 'badge-danger' : 'badge-success'}">${loan.status}</span>
                <div class="text-amber font-bold mt-1" style="font-size:0.85rem">${formatCurrency(loan.balanceRemaining)}</div>
            </div>
        </div>
    `).join('');
}

// Render Dashboard Transactions Table
function renderDashTransactions() {
    const tbody = document.getElementById('dashTxnTableBody');
    if (!tbody) return;

    if (currentTransactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted p-3">No repayment transactions logged yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = currentTransactions.slice(0, 5).map(t => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.date}</td>
            <td>${t.borrowerName}</td>
            <td><span class="badge badge-neutral">${t.loanId}</span></td>
            <td><strong class="text-emerald">${formatCurrency(t.amount)}</strong></td>
            <td>${formatCurrency(t.principalPaid)} / ${formatCurrency(t.interestPaid)}</td>
            <td>${t.method}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewReceipt('${t.id}')">Receipt</button>
            </td>
        </tr>
    `).join('');
}

// 5. Borrowers Controller
function renderBorrowers(filterQuery = '') {
    const container = document.getElementById('borrowersCardsContainer');
    if (!container) return;

    let list = currentBorrowers;
    if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        list = list.filter(b => 
            b.name.toLowerCase().includes(q) || 
            b.email.toLowerCase().includes(q) || 
            b.phone.toLowerCase().includes(q) || 
            b.identityNo.toLowerCase().includes(q)
        );
    }

    if (list.length === 0) {
        container.innerHTML = `<div class="p-4 text-muted">No borrower records match your query.</div>`;
        return;
    }

    container.innerHTML = list.map(b => {
        const initials = b.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return `
            <div class="borrower-card">
                <div class="borrower-header">
                    <div class="avatar">${initials}</div>
                    <div class="borrower-meta">
                        <h4>${b.name}</h4>
                        <span>${b.phone || 'No Phone'} &bull; ${b.email || 'No Email'}</span>
                    </div>
                </div>

                <div class="borrower-stats">
                    <div class="b-stat">
                        <span>Total Borrowed</span>
                        <strong>${formatCurrency(b.totalBorrowed || 0)}</strong>
                    </div>
                    <div class="b-stat">
                        <span>Outstanding</span>
                        <strong class="text-amber">${formatCurrency(b.totalOutstanding || 0)}</strong>
                    </div>
                </div>

                <div class="flex-between align-center mt-2">
                    <span class="badge badge-info">Grade ${b.creditRating}</span>
                    <div>
                        <button class="btn btn-sm btn-secondary" onclick="deleteBorrower('${b.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function deleteBorrower(id) {
    if (!confirm('Are you sure you want to remove this borrower?')) return;

    try {
        const res = await fetch(`/api/borrowers/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        showToast('Borrower removed.');
        loadAllData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// 6. Loans & Ledger Controller
let activeLoanFilter = 'all';

function renderLoans() {
    const tbody = document.getElementById('loansTableBody');
    if (!tbody) return;

    let list = currentLoans;
    if (activeLoanFilter !== 'all') {
        list = list.filter(l => l.status === activeLoanFilter);
    }

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted p-4">No loan contracts matching filter criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(l => {
        let badgeClass = 'badge-neutral';
        if (l.status === 'Active') badgeClass = 'badge-success';
        if (l.status === 'Overdue') badgeClass = 'badge-danger';
        if (l.status === 'Paid Off') badgeClass = 'badge-info';

        return `
            <tr>
                <td><strong>${l.id}</strong></td>
                <td>${l.borrowerName}</td>
                <td><strong>${formatCurrency(l.principal)}</strong></td>
                <td>${l.annualInterestRate}% (${l.interestType})</td>
                <td>${l.tenureMonths} mos</td>
                <td>${formatCurrency(l.monthlyEmi)}</td>
                <td><strong class="text-amber">${formatCurrency(l.balanceRemaining)}</strong></td>
                <td><span class="badge ${badgeClass}">${l.status}</span></td>
                <td>
                    ${l.balanceRemaining > 0 
                        ? `<button class="btn btn-sm btn-emerald" onclick="openPaymentForLoan('${l.id}')">Pay</button>` 
                        : `<span class="text-muted text-sm">Settled</span>`}
                </td>
            </tr>
        `;
    }).join('');
}

function openPaymentForLoan(loanId) {
    populateActiveLoansDropdown(loanId);
    openModal('modalPayment');
}

// Populate Dropdowns
function populateBorrowerDropdown() {
    const select = document.getElementById('lBorrowerSelect');
    if (!select) return;

    select.innerHTML = currentBorrowers.map(b => `
        <option value="${b.id}">${b.name} (${b.id})</option>
    `).join('');
}

function populateActiveLoansDropdown(selectedId = null) {
    const select = document.getElementById('payLoanSelect');
    if (!select) return;

    const activeList = currentLoans.filter(l => l.balanceRemaining > 0);
    select.innerHTML = activeList.map(l => `
        <option value="${l.id}" ${l.id === selectedId ? 'selected' : ''}>
            ${l.id} - ${l.borrowerName} (Bal: ${formatCurrency(l.balanceRemaining)})
        </option>
    `).join('');

    updatePaymentModalDetails();
}

function updatePaymentModalDetails() {
    const select = document.getElementById('payLoanSelect');
    if (!select || !select.value) return;

    const loan = currentLoans.find(l => l.id === select.value);
    if (!loan) return;

    const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.INR;

    document.getElementById('payBorrowerName').textContent = loan.borrowerName;
    document.getElementById('payBalanceLeft').textContent = formatCurrency(loan.balanceRemaining);
    document.getElementById('payStandardEmi').textContent = formatCurrency(loan.monthlyEmi);
    document.getElementById('payLoanStatus').textContent = loan.status;
    
    // Converted payment value for input field
    const remainingConverted = Math.min(loan.monthlyEmi, loan.balanceRemaining) * config.rate;
    document.getElementById('payAmount').value = parseFloat(remainingConverted.toFixed(2));
    document.getElementById('payDate').value = new Date().toISOString().split('T')[0];
}

// 7. Form Handlers
function initForms() {
    // Add Borrower Form
    document.getElementById('formBorrower')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('bName').value,
            email: document.getElementById('bEmail').value,
            phone: document.getElementById('bPhone').value,
            identityNo: document.getElementById('bIdentity').value,
            creditRating: document.getElementById('bRating').value,
            address: document.getElementById('bAddress').value,
            notes: document.getElementById('bNotes').value
        };

        try {
            const res = await fetch('/api/borrowers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast('Borrower registered successfully!');
            closeModal('modalBorrower');
            e.target.reset();
            loadAllData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Disburse Loan Form Dynamic Preview & Submit
    const lPrincipal = document.getElementById('lPrincipal');
    const lRate = document.getElementById('lRate');
    const lTenure = document.getElementById('lTenure');
    const lType = document.getElementById('lType');
    const updateModalLoanPreview = async () => {
        const pInput = parseFloat(lPrincipal.value || 0);
        const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.INR;
        // Normalize to base currency for API calculation
        const p = pInput / config.rate;
        const r = parseFloat(lRate.value || 0);
        const m = parseInt(lTenure.value || 1);
        const type = lType.value;

        if (p > 0 && r > 0 && m > 0) {
            const res = await fetch('/api/calculator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ principal: p, annualInterestRate: r, tenureMonths: m, interestType: type })
            });
            const data = await res.json();
            document.getElementById('modalEmiPreview').textContent = formatCurrency(data.monthlyEmi);
            document.getElementById('modalTotalPreview').textContent = formatCurrency(data.totalRepayable);
        }
    };

    [lPrincipal, lRate, lTenure, lType].forEach(el => el?.addEventListener('input', updateModalLoanPreview));

    document.getElementById('formLoan')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.INR;
        const principalEntered = parseFloat(document.getElementById('lPrincipal').value);

        const payload = {
            borrowerId: document.getElementById('lBorrowerSelect').value,
            principal: parseFloat((principalEntered / config.rate).toFixed(2)),
            annualInterestRate: parseFloat(document.getElementById('lRate').value),
            tenureMonths: parseInt(document.getElementById('lTenure').value),
            interestType: document.getElementById('lType').value,
            startDate: document.getElementById('lStartDate').value,
            notes: document.getElementById('lNotes').value
        };

        try {
            const res = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast('Loan disbursed and active!');
            closeModal('modalLoan');
            loadAllData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // Record Payment Form
    document.getElementById('payLoanSelect')?.addEventListener('change', updatePaymentModalDetails);

    document.getElementById('formPayment')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.INR;
        const amtEntered = parseFloat(document.getElementById('payAmount').value);
        const feeEntered = parseFloat(document.getElementById('payLateFee').value || 0);

        const payload = {
            loanId: document.getElementById('payLoanSelect').value,
            amount: parseFloat((amtEntered / config.rate).toFixed(2)),
            date: document.getElementById('payDate').value,
            method: document.getElementById('payMethod').value,
            lateFee: parseFloat((feeEntered / config.rate).toFixed(2)),
            notes: document.getElementById('payNotes').value
        };

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast('Payment recorded successfully!');
            closeModal('modalPayment');
            loadAllData();
            viewReceipt(data.transaction.id, data.transaction);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // EMI Calculator Form
    document.getElementById('calcForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        triggerCalc();
    });

    // Restore File Input Handler
    document.getElementById('fileRestore')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                const res = await fetch('/api/restore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsed)
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                showToast('Data restored successfully!');
                loadAllData();
            } catch (err) {
                showToast('Invalid backup JSON file.', 'error');
            }
        };
        reader.readAsText(file);
    });

    // Reset Sample Data
    document.getElementById('btnResetSampleData')?.addEventListener('click', async () => {
        if (!confirm('Reset dataset to initial sample records?')) return;
        try {
            const res = await fetch('/api/reset-sample', { method: 'POST' });
            const data = await res.json();
            showToast('Sample dataset restored!');
            loadAllData();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

// 8. Calculator Execution
async function triggerCalc() {
    const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.INR;
    const pInput = parseFloat(document.getElementById('calcPrincipal').value || 10000);
    const p = pInput / config.rate;
    const r = parseFloat(document.getElementById('calcRate').value || 12);
    const m = parseInt(document.getElementById('calcTenure').value || 12);
    const type = document.querySelector('input[name="calcType"]:checked')?.value || 'reducing';

    try {
        const res = await fetch('/api/calculator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ principal: p, annualInterestRate: r, tenureMonths: m, interestType: type })
        });
        const data = await res.json();

        document.getElementById('calcResEmi').textContent = formatCurrency(data.monthlyEmi);
        document.getElementById('calcResInterest').textContent = formatCurrency(data.totalInterest);
        document.getElementById('calcResTotal').textContent = formatCurrency(data.totalRepayable);

        const tbody = document.getElementById('calcScheduleBody');
        tbody.innerHTML = data.schedule.map(s => `
            <tr>
                <td>Month ${s.month}</td>
                <td>${formatCurrency(s.emi)}</td>
                <td>${formatCurrency(s.principal)}</td>
                <td>${formatCurrency(s.interest)}</td>
                <td>${formatCurrency(s.balance)}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Calc error:', err);
    }
}

// 9. Search & Filter Handlers
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchBorrowers');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderBorrowers(e.target.value);
        });
    }

    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeLoanFilter = tab.dataset.filter;
            renderLoans();
        });
    });
}

// 10. View Receipt Modal
function viewReceipt(txnId, txnObj = null) {
    const txn = txnObj || currentTransactions.find(t => t.id === txnId);
    if (!txn) return;

    const receiptContent = document.getElementById('receiptContent');
    if (!receiptContent) return;

    receiptContent.innerHTML = `
        <div class="receipt-header">
            <h2>LENDTRACK CAPITAL CORP</h2>
            <div>OFFICIAL REPAYMENT VOUCHER</div>
            <div style="font-size:0.8rem; margin-top:4px;">Receipt ID: ${txn.id}</div>
        </div>

        <div class="receipt-row">
            <span>Date:</span>
            <span>${txn.date}</span>
        </div>
        <div class="receipt-row">
            <span>Borrower Name:</span>
            <span><strong>${txn.borrowerName}</strong></span>
        </div>
        <div class="receipt-row">
            <span>Contract ID:</span>
            <span>${txn.loanId}</span>
        </div>
        <div class="receipt-row">
            <span>Payment Channel:</span>
            <span>${txn.method}</span>
        </div>

        <div style="border-bottom:1px dashed #9ca3af; margin:0.75rem 0;"></div>

        <div class="receipt-row">
            <span>Principal Paid:</span>
            <span>${formatCurrency(txn.principalPaid)}</span>
        </div>
        <div class="receipt-row">
            <span>Interest Paid:</span>
            <span>${formatCurrency(txn.interestPaid)}</span>
        </div>
        ${txn.lateFee > 0 ? `
        <div class="receipt-row">
            <span>Late Fee / Penalties:</span>
            <span>${formatCurrency(txn.lateFee)}</span>
        </div>` : ''}

        <div class="receipt-total">
            <div class="receipt-row">
                <span>TOTAL AMOUNT RECEIVED:</span>
                <span>${formatCurrency(txn.amount)}</span>
            </div>
        </div>

        <div style="text-align:center; font-size:0.75rem; color:#6b7280; margin-top:1rem;">
            Thank you for your payment. Keep this voucher for your records.
        </div>
    `;

    openModal('modalReceipt');
}
