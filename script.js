// DOM elements
const balanceEl = document.getElementById('balance');
const transactionListEl = document.getElementById('transactions');
const form = document.getElementById('transaction-form');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const dateInput = document.getElementById('date');
const noteInput = document.getElementById('note');
const walletSelect = document.getElementById('wallet');
const walletListEl = document.getElementById('wallet-list');
const addWalletBtn = document.getElementById('add-wallet-btn');
const walletNameInput = document.getElementById('wallet-name');

// Account DOM elements
const accountSelectionScreen = document.getElementById('account-selection-screen');
const accountsListEl = document.getElementById('accounts-list');
const addAccountBtn = document.getElementById('add-account-btn');
const accountNameInput = document.getElementById('account-name');
const container = document.querySelector('.container');
const currentAccountNameEl = document.getElementById('current-account-name');
const switchAccountBtn = document.getElementById('switch-account-btn');

// Modal DOM elements
const editWalletModal = document.getElementById('edit-wallet-modal');
const editWalletNameInput = document.getElementById('edit-wallet-name');
const updateWalletBtn = document.getElementById('update-wallet-btn');
const editAccountModal = document.getElementById('edit-account-modal');
const editAccountNameInput = document.getElementById('edit-account-name');
const updateAccountBtn = document.getElementById('update-account-btn');
const closeBtns = document.querySelectorAll('.close-btn');


// App state
let accounts = [];
let wallets = [];
let transactions = [];
let selectedAccountId = null;
let editingWalletId = null;
let editingAccountId = null;

// Load data from local storage
function loadData() {
    accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    wallets = JSON.parse(localStorage.getItem('wallets')) || [];
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    selectedAccountId = JSON.parse(localStorage.getItem('selectedAccountId')) || null;
}

// Save data to local storage
function saveData() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('wallets', JSON.stringify(wallets));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('selectedAccountId', JSON.stringify(selectedAccountId));
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// --- Account Management ---

function displayAccountSelection() {
    accountSelectionScreen.style.display = 'flex';
    container.style.display = 'none';
    accountsListEl.innerHTML = '';

    accounts.forEach(account => {
        const accountItem = document.createElement('div');
        accountItem.classList.add('account-item');
        accountItem.innerHTML = `
            <span>${account.name}</span>
            <div>
                <button onclick="openEditAccountModal(${account.id})">Edit</button>
                <button onclick="deleteAccount(${account.id})">Delete</button>
            </div>
        `;
        accountItem.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                selectAccount(account.id);
            }
        });
        accountsListEl.appendChild(accountItem);
    });
}

function addAccount() {
    const name = accountNameInput.value.trim();
    if (name === '') {
        alert('Please enter an account name');
        return;
    }
    const account = {
        id: generateID(),
        name: name,
        createdAt: new Date().toISOString()
    };
    accounts.push(account);
    saveData();
    accountNameInput.value = '';
    displayAccountSelection();
}

function selectAccount(id) {
    selectedAccountId = id;
    saveData();
    initApp();
}

function deleteAccount(id) {
    if (confirm('Are you sure you want to delete this account? This will delete all associated wallets and transactions.')) {
        accounts = accounts.filter(acc => acc.id !== id);
        wallets = wallets.filter(w => w.accountId !== id);
        transactions = transactions.filter(t => t.accountId !== id);
        saveData();
        if (selectedAccountId === id) {
            selectedAccountId = null;
            saveData();
        }
        init();
    }
}

function openEditAccountModal(id) {
    editingAccountId = id;
    const account = accounts.find(acc => acc.id === id);
    editAccountNameInput.value = account.name;
    editAccountModal.style.display = 'block';
}

function updateAccount() {
    const newName = editAccountNameInput.value.trim();
    if (newName === '') {
        alert('Please enter an account name');
        return;
    }
    const account = accounts.find(acc => acc.id === editingAccountId);
    account.name = newName;
    saveData();
    closeEditAccountModal();
    if (selectedAccountId === editingAccountId) {
        currentAccountNameEl.textContent = newName;
    }
    displayAccountSelection();
}

function closeEditAccountModal() {
    editAccountModal.style.display = 'none';
}


// --- Wallet Management ---

function addWallet() {
    const name = walletNameInput.value.trim();
    if (name === '') {
        alert('Please enter a wallet name');
        return;
    }
    const wallet = {
        id: generateID(),
        accountId: selectedAccountId,
        name: name,
        balance: 0
    };
    wallets.push(wallet);
    saveData();
    walletNameInput.value = '';
    initApp();
}

function deleteWallet(id) {
    if (confirm('Are you sure you want to delete this wallet and all its transactions?')) {
        wallets = wallets.filter(w => w.id !== id);
        transactions = transactions.filter(t => t.walletId !== id);
        saveData();
        initApp();
    }
}

function openEditWalletModal(id) {
    editingWalletId = id;
    const wallet = wallets.find(w => w.id === id);
    editWalletNameInput.value = wallet.name;
    editWalletModal.style.display = 'block';
}

function updateWallet() {
    const newName = editWalletNameInput.value.trim();
    if (newName === '') {
        alert('Please enter a wallet name');
        return;
    }
    const wallet = wallets.find(w => w.id === editingWalletId);
    wallet.name = newName;
    saveData();
    closeEditWalletModal();
    initApp();
}

function closeEditWalletModal() {
    editWalletModal.style.display = 'none';
}


// --- Transaction Management ---

function addTransaction(e) {
    e.preventDefault();
    if (amountInput.value.trim() === '' || dateInput.value.trim() === '' || !walletSelect.value) {
        alert('Please fill all required fields');
        return;
    }
    const transaction = {
        id: generateID(),
        accountId: selectedAccountId,
        walletId: +walletSelect.value,
        type: typeInput.value,
        amount: typeInput.value === 'expense' ? -Math.abs(+amountInput.value) : +amountInput.value,
        date: dateInput.value,
        note: noteInput.value,
    };
    transactions.push(transaction);
    saveData();
    amountInput.value = '';
    dateInput.value = '';
    noteInput.value = '';
    initApp();
}

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    initApp();
}


// --- UI and Calculation ---

function displayWallets() {
    const accountWallets = wallets.filter(w => w.accountId === selectedAccountId);
    walletListEl.innerHTML = '';
    walletSelect.innerHTML = '<option value="" disabled selected>Select Wallet</option>';

    accountWallets.forEach(wallet => {
        const item = document.createElement('li');
        item.innerHTML = `
            ${wallet.name} <span>${wallet.balance.toFixed(2)} DZD</span>
            <div>
                <button onclick="openEditWalletModal(${wallet.id})">Edit</button>
                <button onclick="deleteWallet(${wallet.id})">Delete</button>
            </div>
        `;
        walletListEl.appendChild(item);

        const option = document.createElement('option');
        option.value = wallet.id;
        option.textContent = wallet.name;
        walletSelect.appendChild(option);
    });
}

function displayTransactions() {
    const accountTransactions = transactions.filter(t => t.accountId === selectedAccountId);
    transactionListEl.innerHTML = '';
    accountTransactions.forEach(transaction => {
        const item = document.createElement('li');
        const wallet = wallets.find(w => w.id === transaction.walletId);
        item.classList.add(transaction.type);
        const sign = transaction.amount < 0 ? '-' : '+';
        item.innerHTML = `
            ${transaction.note ? `<span>${transaction.note}</span>` : ''}
            <span>${wallet ? wallet.name : 'N/A'}</span>
            <span>${transaction.date}</span>
            <span>${sign}${Math.abs(transaction.amount)}</span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
        `;
        transactionListEl.appendChild(item);
    });
}

function calculateBalances() {
    const accountWallets = wallets.filter(w => w.accountId === selectedAccountId);
    const accountTransactions = transactions.filter(t => t.accountId === selectedAccountId);

    accountWallets.forEach(wallet => {
        wallet.balance = 0;
    });

    accountTransactions.forEach(transaction => {
        const wallet = accountWallets.find(w => w.id === transaction.walletId);
        if (wallet) {
            wallet.balance += transaction.amount;
        }
    });

    const totalBalance = accountWallets.reduce((acc, wallet) => acc + wallet.balance, 0);

    balanceEl.innerText = `${totalBalance.toFixed(2)} DZD`;
}


// --- Initialization ---

function initApp() {
    accountSelectionScreen.style.display = 'none';
    container.style.display = 'block';

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
    currentAccountNameEl.textContent = selectedAccount.name;

    calculateBalances();
    displayWallets();
    displayTransactions();
}

function init() {
    loadData();
    if (accounts.length === 0) {
        displayAccountSelection();
    } else if (selectedAccountId === null || !accounts.some(acc => acc.id === selectedAccountId)) {
        displayAccountSelection();
    } else {
        initApp();
    }
}

init();

// Event Listeners
addAccountBtn.addEventListener('click', addAccount);
switchAccountBtn.addEventListener('click', displayAccountSelection);
addWalletBtn.addEventListener('click', addWallet);
form.addEventListener('submit', addTransaction);
updateWalletBtn.addEventListener('click', updateWallet);
updateAccountBtn.addEventListener('click', updateAccount);

closeBtns.forEach(btn => btn.addEventListener('click', () => {
    editWalletModal.style.display = 'none';
    editAccountModal.style.display = 'none';
}));

window.addEventListener('click', (e) => {
    if (e.target == editWalletModal || e.target == editAccountModal) {
        editWalletModal.style.display = 'none';
        editAccountModal.style.display = 'none';
    }
});
