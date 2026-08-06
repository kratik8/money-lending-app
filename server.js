const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));


// Initial Seed Data
const getSeedData = () => ({
  borrowers: [
    {
      id: 'BWR-101',
      name: 'Alexander Wright',
      email: 'alex.wright@example.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Springfield',
      identityNo: 'SSN-9842',
      creditRating: 'A+',
      status: 'Active',
      notes: 'Reliable entrepreneur, prompt on repayments.',
      createdAt: '2026-01-15'
    },
    {
      id: 'BWR-102',
      name: 'Sophia Martinez',
      email: 'sophia.m@example.com',
      phone: '+1 (555) 876-5432',
      address: '128 Pinecrest Way, Austin, TX',
      identityNo: 'DL-77319',
      creditRating: 'A',
      status: 'Active',
      notes: 'Boutique shop expansion financing.',
      createdAt: '2026-02-01'
    },
    {
      id: 'BWR-103',
      name: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1 (555) 345-6789',
      address: '404 Tech Boulevard, San Jose, CA',
      identityNo: 'PASS-88210',
      creditRating: 'B+',
      status: 'Active',
      notes: 'Short term working capital loan.',
      createdAt: '2026-03-10'
    },
    {
      id: 'BWR-104',
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 901-2345',
      address: '55 Ocean View Drive, Miami, FL',
      identityNo: 'ID-44912',
      creditRating: 'B',
      status: 'Active',
      notes: 'Renovation loan for commercial property.',
      createdAt: '2026-04-05'
    }
  ],
  loans: [
    {
      id: 'LN-2026-01',
      borrowerId: 'BWR-101',
      principal: 15000,
      annualInterestRate: 12,
      tenureMonths: 12,
      interestType: 'reducing', // 'reducing' or 'flat'
      startDate: '2026-01-20',
      monthlyEmi: 1332.73,
      totalInterest: 992.76,
      totalRepayable: 15992.76,
      paidPrincipal: 6100.00,
      paidInterest: 563.65,
      balanceRemaining: 8900.00,
      status: 'Active', // 'Active', 'Paid Off', 'Overdue', 'Defaulted'
      notes: 'Equipment purchasing loan.'
    },
    {
      id: 'LN-2026-02',
      borrowerId: 'BWR-102',
      principal: 8000,
      annualInterestRate: 10,
      tenureMonths: 6,
      interestType: 'reducing',
      startDate: '2026-02-10',
      monthlyEmi: 1372.58,
      totalInterest: 235.48,
      totalRepayable: 8235.48,
      paidPrincipal: 8000.00,
      paidInterest: 235.48,
      balanceRemaining: 0.00,
      status: 'Paid Off',
      notes: 'Seasonal inventory boost.'
    },
    {
      id: 'LN-2026-03',
      borrowerId: 'BWR-103',
      principal: 25000,
      annualInterestRate: 14,
      tenureMonths: 24,
      interestType: 'reducing',
      startDate: '2026-03-15',
      monthlyEmi: 1200.56,
      totalInterest: 3813.44,
      totalRepayable: 28813.44,
      paidPrincipal: 3500.00,
      paidInterest: 1302.24,
      balanceRemaining: 21500.00,
      status: 'Active',
      notes: 'Hardware tech procurement.'
    },
    {
      id: 'LN-2026-04',
      borrowerId: 'BWR-104',
      principal: 12000,
      annualInterestRate: 15,
      tenureMonths: 12,
      interestType: 'flat',
      startDate: '2026-04-10',
      monthlyEmi: 1150.00,
      totalInterest: 1800.00,
      totalRepayable: 13800.00,
      paidPrincipal: 2000.00,
      paidInterest: 300.00,
      balanceRemaining: 10000.00,
      status: 'Overdue',
      notes: 'Interior decoration bridging loan.'
    }
  ],
  transactions: [
    {
      id: 'TXN-901',
      loanId: 'LN-2026-01',
      borrowerName: 'Alexander Wright',
      date: '2026-02-20',
      amount: 1332.73,
      principalPaid: 1182.73,
      interestPaid: 150.00,
      lateFee: 0,
      method: 'Bank Transfer',
      notes: 'Installment 1'
    },
    {
      id: 'TXN-902',
      loanId: 'LN-2026-01',
      borrowerName: 'Alexander Wright',
      date: '2026-03-20',
      amount: 1332.73,
      principalPaid: 1194.56,
      interestPaid: 138.17,
      lateFee: 0,
      method: 'Bank Transfer',
      notes: 'Installment 2'
    },
    {
      id: 'TXN-903',
      loanId: 'LN-2026-02',
      borrowerName: 'Sophia Martinez',
      date: '2026-03-10',
      amount: 4117.74,
      principalPaid: 4000.00,
      interestPaid: 117.74,
      lateFee: 0,
      method: 'UPI / Mobile Payment',
      notes: 'Early partial lump sum'
    },
    {
      id: 'TXN-904',
      loanId: 'LN-2026-02',
      borrowerName: 'Sophia Martinez',
      date: '2026-04-10',
      amount: 4117.74,
      principalPaid: 4000.00,
      interestPaid: 117.74,
      lateFee: 0,
      method: 'Bank Transfer',
      notes: 'Final payoff settlement'
    },
    {
      id: 'TXN-905',
      loanId: 'LN-2026-03',
      borrowerName: 'David Chen',
      date: '2026-04-15',
      amount: 2401.12,
      principalPaid: 1800.00,
      interestPaid: 601.12,
      lateFee: 0,
      method: 'Cash Handover',
      notes: 'Installments 1 & 2 combined'
    }
  ],
  settings: {
    currencySymbol: '$',
    companyName: 'Fundify Capital Corp.',
    defaultInterestRate: 12,
    lateFeePercentage: 2
  }
});

// Helper DB functions
function ensureDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(getSeedData(), null, 2));
  }
}

function readDB() {
  ensureDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, re-seeding...', err);
    const data = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return data;
  }
}

function writeDB(data) {
  ensureDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Financial Calculator Utilities
function calculateEMI(principal, annualRate, months, type = 'reducing') {
  const p = parseFloat(principal);
  const r = parseFloat(annualRate) / 12 / 100;
  const n = parseInt(months);

  if (!p || p <= 0 || !n || n <= 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalRepayable: 0, schedule: [] };
  }

  if (type === 'flat') {
    const totalInterest = p * (parseFloat(annualRate) / 100) * (n / 12);
    const totalRepayable = p + totalInterest;
    const monthlyEmi = totalRepayable / n;

    const schedule = [];
    let remPrincipal = p;
    const monthlyPrincipal = p / n;
    const monthlyInterest = totalInterest / n;

    for (let i = 1; i <= n; i++) {
      remPrincipal -= monthlyPrincipal;
      schedule.push({
        month: i,
        emi: parseFloat(monthlyEmi.toFixed(2)),
        principal: parseFloat(monthlyPrincipal.toFixed(2)),
        interest: parseFloat(monthlyInterest.toFixed(2)),
        balance: parseFloat(Math.max(0, remPrincipal).toFixed(2))
      });
    }

    return {
      monthlyEmi: parseFloat(monthlyEmi.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalRepayable: parseFloat(totalRepayable.toFixed(2)),
      schedule
    };
  } else {
    // Reducing balance
    let monthlyEmi = 0;
    if (r === 0) {
      monthlyEmi = p / n;
    } else {
      monthlyEmi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const schedule = [];
    let balance = p;
    let totalInterest = 0;

    for (let i = 1; i <= n; i++) {
      const interestForMonth = balance * r;
      const principalForMonth = monthlyEmi - interestForMonth;
      balance -= principalForMonth;
      totalInterest += interestForMonth;

      schedule.push({
        month: i,
        emi: parseFloat(monthlyEmi.toFixed(2)),
        principal: parseFloat(principalForMonth.toFixed(2)),
        interest: parseFloat(interestForMonth.toFixed(2)),
        balance: parseFloat(Math.max(0, balance).toFixed(2))
      });
    }

    const totalRepayable = p + totalInterest;
    return {
      monthlyEmi: parseFloat(monthlyEmi.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalRepayable: parseFloat(totalRepayable.toFixed(2)),
      schedule
    };
  }
}

// API ENDPOINTS

// 1. Health check & System Stats
app.get('/api/stats', (req, res) => {
  const db = readDB();
  let totalCapitalLent = 0;
  let totalPrincipalCollected = 0;
  let totalInterestEarned = 0;
  let totalOutstandingBalance = 0;
  let activeLoansCount = 0;
  let overdueLoansCount = 0;

  db.loans.forEach(loan => {
    totalCapitalLent += parseFloat(loan.principal || 0);
    totalPrincipalCollected += parseFloat(loan.paidPrincipal || 0);
    totalInterestEarned += parseFloat(loan.paidInterest || 0);
    totalOutstandingBalance += parseFloat(loan.balanceRemaining || 0);

    if (loan.status === 'Active') activeLoansCount++;
    if (loan.status === 'Overdue') overdueLoansCount++;
  });

  const recoveryRate = totalCapitalLent > 0 ? ((totalPrincipalCollected / totalCapitalLent) * 100).toFixed(1) : 0;

  res.json({
    totalCapitalLent: parseFloat(totalCapitalLent.toFixed(2)),
    totalPrincipalCollected: parseFloat(totalPrincipalCollected.toFixed(2)),
    totalInterestEarned: parseFloat(totalInterestEarned.toFixed(2)),
    totalOutstandingBalance: parseFloat(totalOutstandingBalance.toFixed(2)),
    activeLoansCount,
    overdueLoansCount,
    recoveryRate,
    totalBorrowers: db.borrowers.length,
    totalLoans: db.loans.length,
    totalTransactions: db.transactions.length
  });
});

// 2. Borrowers Endpoints
app.get('/api/borrowers', (req, res) => {
  const db = readDB();
  // enrich with active loans info
  const enriched = db.borrowers.map(b => {
    const bLoans = db.loans.filter(l => l.borrowerId === b.id);
    const activeCount = bLoans.filter(l => l.status === 'Active' || l.status === 'Overdue').length;
    const totalBorrowed = bLoans.reduce((sum, l) => sum + parseFloat(l.principal), 0);
    const totalOutstanding = bLoans.reduce((sum, l) => sum + parseFloat(l.balanceRemaining), 0);
    return {
      ...b,
      activeLoansCount: activeCount,
      totalBorrowed: parseFloat(totalBorrowed.toFixed(2)),
      totalOutstanding: parseFloat(totalOutstanding.toFixed(2))
    };
  });
  res.json(enriched);
});

app.post('/api/borrowers', (req, res) => {
  const db = readDB();
  const { name, email, phone, address, identityNo, creditRating, notes } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Borrower Name is required.' });
  }

  const id = `BWR-${Math.floor(100 + Math.random() * 900)}`;
  const newBorrower = {
    id,
    name: name.trim(),
    email: (email || '').trim(),
    phone: (phone || '').trim(),
    address: (address || '').trim(),
    identityNo: (identityNo || '').trim(),
    creditRating: creditRating || 'A',
    status: 'Active',
    notes: (notes || '').trim(),
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.borrowers.unshift(newBorrower);
  writeDB(db);
  res.status(201).json(newBorrower);
});

app.put('/api/borrowers/:id', (req, res) => {
  const db = readDB();
  const index = db.borrowers.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Borrower not found' });

  db.borrowers[index] = { ...db.borrowers[index], ...req.body };
  writeDB(db);
  res.json(db.borrowers[index]);
});

app.delete('/api/borrowers/:id', (req, res) => {
  const db = readDB();
  const borrowerId = req.params.id;
  const hasLoans = db.loans.some(l => l.borrowerId === borrowerId);
  if (hasLoans) {
    return res.status(400).json({ error: 'Cannot delete borrower with existing loan contracts.' });
  }
  db.borrowers = db.borrowers.filter(b => b.id !== borrowerId);
  writeDB(db);
  res.json({ success: true, message: 'Borrower removed successfully.' });
});

// 3. Loans Endpoints
app.get('/api/loans', (req, res) => {
  const db = readDB();
  const enriched = db.loans.map(loan => {
    const borrower = db.borrowers.find(b => b.id === loan.borrowerId);
    return {
      ...loan,
      borrowerName: borrower ? borrower.name : 'Unknown Borrower',
      borrowerEmail: borrower ? borrower.email : ''
    };
  });
  res.json(enriched);
});

app.post('/api/loans', (req, res) => {
  const db = readDB();
  const { borrowerId, principal, annualInterestRate, tenureMonths, interestType, startDate, notes } = req.body;

  if (!borrowerId || !principal || !annualInterestRate || !tenureMonths) {
    return res.status(400).json({ error: 'Missing required loan attributes.' });
  }

  const p = parseFloat(principal);
  const r = parseFloat(annualInterestRate);
  const m = parseInt(tenureMonths);
  const type = interestType || 'reducing';

  const emiCalc = calculateEMI(p, r, m, type);
  const loanId = `LN-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`;

  const newLoan = {
    id: loanId,
    borrowerId,
    principal: p,
    annualInterestRate: r,
    tenureMonths: m,
    interestType: type,
    startDate: startDate || new Date().toISOString().split('T')[0],
    monthlyEmi: emiCalc.monthlyEmi,
    totalInterest: emiCalc.totalInterest,
    totalRepayable: emiCalc.totalRepayable,
    paidPrincipal: 0,
    paidInterest: 0,
    balanceRemaining: emiCalc.totalRepayable,
    status: 'Active',
    notes: notes || ''
  };

  db.loans.unshift(newLoan);
  writeDB(db);

  const borrower = db.borrowers.find(b => b.id === borrowerId);
  res.status(201).json({ ...newLoan, borrowerName: borrower ? borrower.name : 'Unknown' });
});

app.put('/api/loans/:id', (req, res) => {
  const db = readDB();
  const index = db.loans.findIndex(l => l.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Loan contract not found' });

  db.loans[index] = { ...db.loans[index], ...req.body };
  writeDB(db);
  res.json(db.loans[index]);
});

// 4. Transactions / Repayment Recording
app.get('/api/transactions', (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

app.post('/api/transactions', (req, res) => {
  const db = readDB();
  const { loanId, amount, date, method, lateFee, notes } = req.body;

  const loanIndex = db.loans.findIndex(l => l.id === loanId);
  if (loanIndex === -1) return res.status(404).json({ error: 'Selected loan contract not found.' });

  const loan = db.loans[loanIndex];
  const paymentAmount = parseFloat(amount);
  const fee = parseFloat(lateFee || 0);

  if (!paymentAmount || paymentAmount <= 0) {
    return res.status(400).json({ error: 'Invalid payment amount.' });
  }

  // Calculate split between interest and principal
  // Simple heuristic: ratio of total remaining interest vs total remaining balance
  const remainingInterestTotal = Math.max(0, loan.totalInterest - loan.paidInterest);
  const currentBalance = loan.balanceRemaining;

  let interestPaidPart = 0;
  let principalPaidPart = 0;

  if (currentBalance > 0 && remainingInterestTotal > 0) {
    const interestRatio = remainingInterestTotal / currentBalance;
    interestPaidPart = Math.min(paymentAmount * interestRatio, remainingInterestTotal);
    principalPaidPart = paymentAmount - interestPaidPart;
  } else {
    principalPaidPart = paymentAmount;
  }

  // Update loan record
  loan.paidPrincipal = parseFloat((loan.paidPrincipal + principalPaidPart).toFixed(2));
  loan.paidInterest = parseFloat((loan.paidInterest + interestPaidPart).toFixed(2));
  loan.balanceRemaining = parseFloat(Math.max(0, loan.balanceRemaining - paymentAmount).toFixed(2));

  if (loan.balanceRemaining <= 0.01) {
    loan.balanceRemaining = 0;
    loan.status = 'Paid Off';
  }

  const borrower = db.borrowers.find(b => b.id === loan.borrowerId);
  const txnId = `TXN-${Math.floor(100 + Math.random() * 900)}`;

  const newTxn = {
    id: txnId,
    loanId: loan.id,
    borrowerName: borrower ? borrower.name : 'Unknown Borrower',
    date: date || new Date().toISOString().split('T')[0],
    amount: paymentAmount,
    principalPaid: parseFloat(principalPaidPart.toFixed(2)),
    interestPaid: parseFloat(interestPaidPart.toFixed(2)),
    lateFee: fee,
    method: method || 'Cash Handover',
    notes: notes || 'Regular installment repayment'
  };

  db.transactions.unshift(newTxn);
  db.loans[loanIndex] = loan;
  writeDB(db);

  res.status(201).json({
    transaction: newTxn,
    updatedLoan: loan
  });
});

// 5. Calculator Endpoint
app.post('/api/calculator', (req, res) => {
  const { principal, annualInterestRate, tenureMonths, interestType } = req.body;
  const result = calculateEMI(principal, annualInterestRate, tenureMonths, interestType || 'reducing');
  res.json(result);
});

// 6. Data Backup / Restore
app.get('/api/backup', (req, res) => {
  const db = readDB();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=fundify_backup_${Date.now()}.json`);
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/restore', (req, res) => {
  try {
    const data = req.body;
    if (!data.borrowers || !data.loans || !data.transactions) {
      return res.status(400).json({ error: 'Invalid backup structure.' });
    }
    writeDB(data);
    res.json({ success: true, message: 'Database restored successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore database.' });
  }
});

app.post('/api/reset-sample', (req, res) => {
  const fresh = getSeedData();
  writeDB(fresh);
  res.json({ success: true, message: 'Sample dataset reset to defaults!' });
});

// Start Server with Port Fallback
function startServer(portToUse) {
  const server = app.listen(portToUse, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Fundify Node.js Financial Server running!`);
    console.log(`🌐 Local Web Portal: http://localhost:${portToUse}`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n[Notice] Port ${portToUse} is currently in use. Trying port ${portToUse + 1}...`);
      startServer(portToUse + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);

