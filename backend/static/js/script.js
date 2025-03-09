// Глобальні змінні
let currentBalance = 0;
let categories = [];
let transactions = [];
let currentModal = null;

// Тестові дані
const testTransactions = [
    {
        date: '2024-03-20',
        type: 'income',
        category: 'Зарплата',
        amount: 25000,
        description: 'Зарплата за березень'
    },
    {
        date: '2024-03-19',
        type: 'expense',
        category: 'Продукти',
        amount: 1500,
        description: 'Покупки в АТБ'
    },
    {
        date: '2024-03-18',
        type: 'income',
        category: 'Фріланс',
        amount: 5000,
        description: 'Проект для клієнта'
    },
    {
        date: '2024-03-17',
        type: 'expense',
        category: 'Комунальні',
        amount: 2800,
        description: 'Оплата за лютий'
    }
];

// Тестові дані для карток
const testCards = [
    {
        type: 'Universal Card',
        number: '4444 5555 6666 1234',
        balance: 15000,
        expire: '09/25',
        color: 'gradient-purple'
    },
    {
        type: 'Premium Card',
        number: '4444 5555 6666 5678',
        balance: 25000,
        expire: '11/26',
        color: 'gradient-green'
    },
    {
        type: 'Travel Card',
        number: '4444 5555 6666 9012',
        balance: 8000,
        expire: '03/25',
        color: 'gradient-blue'
    }
];

// Додаємо тестові дані для статистики карток
const cardStatistics = {
    '4444 5555 6666 1234': {
        expenses: [2300, 1900, 2100, 1800, 2200, 2300],
        income: 15000,
        categories: {
            'Продукти': 800,
            'Комунальні': 1200,
            'Розваги': 600,
            'Транспорт': 400
        }
    },
    '4444 5555 6666 5678': {
        expenses: [3500, 3200, 3800, 3100, 3600, 3400],
        income: 25000,
        categories: {
            'Продукти': 1200,
            'Комунальні': 1800,
            'Розваги': 1000,
            'Транспорт': 800
        }
    },
    '4444 5555 6666 9012': {
        expenses: [1800, 1500, 1700, 1400, 1600, 1500],
        income: 8000,
        categories: {
            'Продукти': 500,
            'Комунальні': 800,
            'Розваги': 400,
            'Транспорт': 300
        }
    }
};

// Зберігаємо початковий HTML головної сторінки
let mainPageContent = '';

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Зберігаємо початковий контент головної сторінки
    mainPageContent = `
        <div class="top-bar">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Пошук транзакцій...">
            </div>
            <div class="user-menu">
                <div class="balance-total">
                    <span class="balance-label">Баланс</span>
                    <span class="balance-amount">0.00 ₴</span>
                </div>
            </div>
        </div>

        <div class="cards-section">
            <div class="section-header">
                <h2>Мої картки</h2>
                <button class="btn-add" onclick="showModal('addCard')">
                    <i class="bi bi-plus-lg"></i>
                    Додати картку
                </button>
            </div>
            <div class="cards-grid">
                ${testCards.map(card => generateCardHTML(card)).join('')}
                <div class="card-item add-card" onclick="showModal('addCard')">
                    <i class="bi bi-plus-lg"></i>
                    <span>Додати нову картку</span>
                </div>
            </div>
        </div>

        <div class="quick-actions">
            <button class="btn-action" onclick="showModal('income')">
                <i class="bi bi-plus-circle"></i>
                <span>Поповнити</span>
            </button>
            <button class="btn-action" onclick="showModal('expense')">
                <i class="bi bi-dash-circle"></i>
                <span>Оплатити</span>
            </button>
            <button class="btn-action" onclick="showModal('transfer')">
                <i class="bi bi-arrow-left-right"></i>
                <span>Переказати</span>
            </button>
            <button class="btn-action" onclick="showModal('template')">
                <i class="bi bi-star"></i>
                <span>Шаблони</span>
            </button>
        </div>

        <div class="transactions-section">
            <div class="section-header">
                <h2>Історія операцій</h2>
                <div class="transaction-filters">
                    <button class="active" data-filter="all" onclick="displayTransactions('all')">Всі</button>
                    <button data-filter="income" onclick="displayTransactions('income')">Доходи</button>
                    <button data-filter="expense" onclick="displayTransactions('expense')">Витрати</button>
                    <button data-filter="transfer" onclick="displayTransactions('transfer')">Перекази</button>
                </div>
            </div>
            <div class="transactions-list">
                <table>
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Опис</th>
                            <th>Категорія</th>
                            <th>Сума</th>
                            <th>Тип</th>
                        </tr>
                    </thead>
                    <tbody id="transactionsTable"></tbody>
                </table>
            </div>
        </div>`;
    
    initializeApp();
    setupNavigationHandlers();
});

function initializeApp() {
    updateBalance();
    displayTransactions();
    loadInitialView();
}

// Функція для оновлення балансу
function updateBalance() {
    const totalBalance = testCards.reduce((acc, card) => acc + card.balance, 0);
    
    // Оновлюємо загальний баланс
    document.querySelectorAll('.balance-amount').forEach(element => {
        element.textContent = `${totalBalance.toLocaleString()} ₴`;
    });
}

// Навігація між вкладками
function setupNavigationHandlers() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.getAttribute('data-view') || 'main';
            
            // Оновлюємо активний стан перед завантаженням вигляду
            menuItems.forEach(mi => mi.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            loadView(view);
        });
    });
}

function loadInitialView() {
    const currentView = window.location.hash.slice(1) || 'main';
    loadView(currentView);
}

function loadView(view) {
    const mainContent = document.querySelector('.main-content');
    
    // Очищаємо поточний контент
    mainContent.innerHTML = '';
    
    // Оновлюємо URL
    window.location.hash = view;
    
    switch(view) {
        case 'main':
            mainContent.innerHTML = mainPageContent;
            updateBalance();
            displayTransactions();
            break;
        case 'cards':
            mainContent.innerHTML = generateCardsView();
            updateBalance();
            break;
        case 'transfers':
            mainContent.innerHTML = generateTransfersView();
            break;
        case 'analytics':
            mainContent.innerHTML = generateAnalyticsView();
            setTimeout(() => initializeCharts(), 100);
            break;
        case 'settings':
            mainContent.innerHTML = generateSettingsView();
            break;
    }
}

// Генерація контенту для різних вкладок
function generateCardsView() {
    return `
        <div class="top-bar">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Пошук карток...">
            </div>
            <div class="user-menu">
                <div class="balance-total">
                    <span class="balance-label">Загальний баланс</span>
                    <span class="balance-amount">0.00 ₴</span>
                </div>
            </div>
        </div>

        <div class="cards-section">
            <div class="section-header">
                <h2>Мої картки</h2>
                <button class="btn-add" onclick="showModal('addCard')">
                    <i class="bi bi-plus-lg"></i>
                    Додати картку
                </button>
            </div>
            <div class="cards-grid">
                ${testCards.map(card => generateCardHTML(card)).join('')}
                <div class="card-item add-card" onclick="showModal('addCard')">
                    <i class="bi bi-plus-lg"></i>
                    <span>Додати нову картку</span>
                </div>
            </div>
        </div>

        <div class="quick-actions">
            <button class="btn-action" onclick="showModal('income')">
                <i class="bi bi-plus-circle"></i>
                <span>Поповнити</span>
            </button>
            <button class="btn-action" onclick="showModal('expense')">
                <i class="bi bi-dash-circle"></i>
                <span>Оплатити</span>
            </button>
            <button class="btn-action" onclick="showModal('transfer')">
                <i class="bi bi-arrow-left-right"></i>
                <span>Переказати</span>
            </button>
        </div>
    `;
}

function generateTransfersView() {
    return `
        <div class="top-bar">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Пошук переказів...">
            </div>
            <div class="user-menu">
                <div class="balance-total">
                    <span class="balance-label">Загальний баланс</span>
                    <span class="balance-amount">0.00 ₴</span>
                </div>
            </div>
        </div>

        <div class="cards-section">
            <div class="section-header">
                <h2>Мої картки</h2>
            </div>
            <div class="cards-grid">
                ${testCards.map(card => generateCardHTML(card)).join('')}
            </div>
        </div>

        <div class="transfers-grid">
            <div class="transfer-section">
                <h3>Швидкий переказ</h3>
                <form class="transfer-form">
                    <div class="form-group">
                        <label>Картка відправника</label>
                        <select class="form-select">
                            ${testCards.map(card => `<option>${card.type} (*${card.number.slice(-4)})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Номер картки отримувача</label>
                        <input type="text" class="form-control" placeholder="**** **** **** ****">
                    </div>
                    <div class="form-group">
                        <label>Сума</label>
                        <input type="number" class="form-control" placeholder="0.00">
                    </div>
                    <button type="submit" class="btn btn-primary">Переказати</button>
                </form>
            </div>
            <div class="transfer-section">
                <h3>Останні перекази</h3>
                <div class="recent-transfers">
                    <!-- Тут буде список останніх переказів -->
                </div>
            </div>
        </div>
    `;
}

function generateAnalyticsView() {
    return `
        <div class="top-bar">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Пошук по аналітиці...">
            </div>
            <div class="user-menu">
                <div class="balance-total">
                    <span class="balance-label">Загальний баланс</span>
                    <span class="balance-amount">0.00 ₴</span>
                </div>
            </div>
        </div>

        <div class="cards-section analytics-view">
            <div class="section-header">
                <h2>Мої картки</h2>
                <div class="card-info-hint">
                    Натисніть на картку для перегляду детальної статистики
                </div>
            </div>
            <div class="cards-grid">
                ${testCards.map(card => generateCardHTML(card, true)).join('')}
            </div>
        </div>

        <div id="analyticsContent">
            <div class="section-header">
                <h2>Загальна аналітика</h2>
                <div class="period-selector">
                    <button class="active">Місяць</button>
                    <button>Квартал</button>
                    <button>Рік</button>
                </div>
            </div>
            <div class="analytics-grid">
                <div class="chart-container">
                    <canvas id="expensesChart"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="categoryChart"></canvas>
                </div>
                <div class="statistics-container">
                    <div class="stat-card">
                        <h4>Загальні витрати</h4>
                        <p class="stat-value expense-amount">-4,300 ₴</p>
                    </div>
                    <div class="stat-card">
                        <h4>Загальні доходи</h4>
                        <p class="stat-value income-amount">+30,000 ₴</p>
                    </div>
                    <div class="stat-card">
                        <h4>Баланс</h4>
                        <p class="stat-value">25,700 ₴</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateSettingsView() {
    return `
        <div class="top-bar">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Пошук налаштувань...">
            </div>
            <div class="user-menu">
                <div class="balance-total">
                    <span class="balance-label">Загальний баланс</span>
                    <span class="balance-amount">0.00 ₴</span>
                </div>
            </div>
        </div>

        <div class="cards-section">
            <div class="section-header">
                <h2>Мої картки</h2>
            </div>
            <div class="cards-grid">
                ${testCards.map(card => generateCardHTML(card)).join('')}
            </div>
        </div>

        <div class="section-header">
            <h2>Налаштування</h2>
        </div>
        <div class="settings-grid">
            <div class="settings-section">
                <h3>Персональні дані</h3>
                <form class="settings-form">
                    <div class="form-group">
                        <label>Ім'я</label>
                        <input type="text" class="form-control" value="Користувач">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" class="form-control" value="user@example.com">
                    </div>
                    <button type="submit" class="btn btn-primary">Зберегти зміни</button>
                </form>
            </div>
            <div class="settings-section">
                <h3>Налаштування безпеки</h3>
                <form class="settings-form">
                    <div class="form-group">
                        <label>Поточний пароль</label>
                        <input type="password" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Новий пароль</label>
                        <input type="password" class="form-control">
                    </div>
                    <button type="submit" class="btn btn-primary">Змінити пароль</button>
                </form>
            </div>
            <div class="settings-section">
                <h3>Сповіщення</h3>
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="emailNotif" checked>
                    <label class="form-check-label" for="emailNotif">Email сповіщення</label>
                </div>
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="pushNotif" checked>
                    <label class="form-check-label" for="pushNotif">Push сповіщення</label>
                </div>
            </div>
        </div>
    `;
}

// Ініціалізація графіків для аналітики
function initializeCharts() {
    if (typeof Chart === 'undefined') return;
    
    // Графік витрат
    const expensesCtx = document.getElementById('expensesChart');
    if (expensesCtx) {
        new Chart(expensesCtx, {
            type: 'line',
            data: {
                labels: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'],
                datasets: [{
                    label: 'Витрати',
                    data: [4300, 3900, 4100, 3800, 4200, 4300],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            }
        });
    }
    
    // Графік категорій
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Продукти', 'Комунальні', 'Розваги', 'Транспорт'],
                datasets: [{
                    data: [1500, 2800, 1200, 800],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0'
                    ]
                }]
            }
        });
    }
}

// Функції для роботи з API
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api/${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

// Функції для роботи з категоріями
async function loadCategories() {
    try {
        categories = await apiCall('categories');
        updateCategorySelect();
    } catch (error) {
        showError('Помилка завантаження категорій');
    }
}

function updateCategorySelect() {
    const select = document.getElementById('category');
    select.innerHTML = '<option value="">Виберіть категорію</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Функції для роботи з транзакціями
async function loadTransactions() {
    try {
        transactions = await apiCall('transactions');
        updateTransactionsTable();
    } catch (error) {
        showError('Помилка завантаження транзакцій');
    }
}

function updateTransactionsTable() {
    const tbody = document.getElementById('transactionsTable');
    tbody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString('uk-UA')}</td>
            <td>${transaction.category}</td>
            <td>${transaction.description || '-'}</td>
            <td class="${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}">
                ${transaction.type === 'income' ? '+' : '-'} ${transaction.amount.toFixed(2)} ₴
            </td>
            <td>${transaction.type === 'income' ? 'Дохід' : 'Витрата'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Функції для роботи з модальними вікнами
function showModal(type) {
    currentModal = type;
    const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
    const title = document.getElementById('modalTitle');
    
    if (type === 'income') {
        title.textContent = 'Додати дохід';
    } else if (type === 'expense') {
        title.textContent = 'Додати витрату';
    } else {
        title.textContent = 'Додати категорію';
    }
    
    modal.show();
}

async function saveTransaction() {
    const amount = parseFloat(document.getElementById('amount').value);
    const categoryId = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    
    if (!amount || !categoryId) {
        showError('Заповніть всі обов\'язкові поля');
        return;
    }
    
    try {
        const data = {
            amount: amount,
            category_id: categoryId,
            description: description,
            type: currentModal
        };
        
        await apiCall('transactions', 'POST', data);
        await loadTransactions();
        await updateBalance();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
        modal.hide();
        
        showSuccess('Транзакцію успішно додано');
    } catch (error) {
        showError('Помилка при збереженні транзакції');
    }
}

// Допоміжні функції
function showError(message) {
    const toast = new bootstrap.Toast(document.getElementById('errorToast'));
    document.getElementById('errorToastBody').textContent = message;
    toast.show();
}

function showSuccess(message) {
    const toast = new bootstrap.Toast(document.getElementById('successToast'));
    document.getElementById('successToastBody').textContent = message;
    toast.show();
}

// Функція для перемикання теми
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.setAttribute('data-theme', 'light');
        themeIcon.className = 'bi bi-sun-fill';
        themeText.textContent = 'Темна тема';
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = 'bi bi-moon-fill';
        themeText.textContent = 'Світла тема';
    }
}

// Функція для відображення транзакцій
function displayTransactions(filter = 'all') {
    const tbody = document.getElementById('transactionsTable');
    tbody.innerHTML = '';
    
    const filteredTransactions = testTransactions.filter(transaction => {
        switch(filter) {
            case 'income':
                return transaction.type === 'income';
            case 'expense':
                return transaction.type === 'expense';
            case 'transfer':
                return transaction.type === 'transfer';
            default:
                return true;
        }
    });
    
    filteredTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString('uk-UA')}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type}-amount">
                ${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()} ₴
            </td>
            <td>${transaction.type === 'income' ? 'Дохід' : transaction.type === 'expense' ? 'Витрата' : 'Переказ'}</td>
        `;
        tbody.appendChild(row);
    });

    // Оновлюємо активний стан кнопок фільтрів
    const filterButtons = document.querySelectorAll('.transaction-filters button');
    filterButtons.forEach(button => {
        const buttonFilter = button.getAttribute('data-filter');
        button.classList.toggle('active', buttonFilter === filter);
    });
}

// Оновлюємо функцію для генерації статистики по картці
function generateCardStatistics(card) {
    const stats = cardStatistics[card.number];
    const totalExpenses = stats.expenses[stats.expenses.length - 1];
    
    return `
        <div class="section-header">
            <h2>Статистика картки ${card.type}</h2>
            <div class="period-selector">
                <button class="active">Місяць</button>
                <button>Квартал</button>
                <button>Рік</button>
            </div>
        </div>
        <div class="analytics-grid">
            <div class="chart-container">
                <canvas id="cardExpensesChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="cardCategoryChart"></canvas>
            </div>
            <div class="statistics-container">
                <div class="stat-card">
                    <h4>Витрати з картки</h4>
                    <p class="stat-value expense-amount">-${totalExpenses.toLocaleString()} ₴</p>
                </div>
                <div class="stat-card">
                    <h4>Поповнення картки</h4>
                    <p class="stat-value income-amount">+${stats.income.toLocaleString()} ₴</p>
                </div>
                <div class="stat-card">
                    <h4>Баланс картки</h4>
                    <p class="stat-value">${card.balance.toLocaleString()} ₴</p>
                </div>
            </div>
        </div>
    `;
}

// Оновлюємо функцію для ініціалізації графіків картки
function initializeCardCharts(card) {
    if (typeof Chart === 'undefined') return;
    
    const stats = cardStatistics[card.number];
    
    // Графік витрат по картці
    const cardExpensesCtx = document.getElementById('cardExpensesChart');
    if (cardExpensesCtx) {
        new Chart(cardExpensesCtx, {
            type: 'line',
            data: {
                labels: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'],
                datasets: [{
                    label: 'Витрати по картці',
                    data: stats.expenses,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Графік категорій витрат по картці
    const cardCategoryCtx = document.getElementById('cardCategoryChart');
    if (cardCategoryCtx) {
        new Chart(cardCategoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(stats.categories),
                datasets: [{
                    data: Object.values(stats.categories),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Оновлюємо функцію generateCardHTML
function generateCardHTML(card, isAnalytics = false) {
    const clickHandler = isAnalytics ? `onclick="showCardStatistics(${JSON.stringify(card).replace(/"/g, '&quot;')})"` : '';
    const dataAttr = `data-number="${card.number}"`;
    return `
        <div class="card-item ${card.color}" ${clickHandler} ${dataAttr}>
            <div class="card-header">
                <span class="card-type">${card.type}</span>
                <i class="bi bi-credit-card"></i>
            </div>
            <div class="card-number">${card.number.replace(/(\d{4})/g, '**** ').slice(0, -1)}</div>
            <div class="card-footer">
                <div class="card-balance">${card.balance.toLocaleString()} ₴</div>
                <div class="card-expire">${card.expire}</div>
            </div>
        </div>
    `;
}

// Додаємо функцію для відображення статистики по картці
function showCardStatistics(card) {
    const analyticsContent = document.getElementById('analyticsContent');
    analyticsContent.classList.add('loading');
    
    // Невелика затримка для анімації
    setTimeout(() => {
        analyticsContent.innerHTML = generateCardStatistics(card);
        analyticsContent.classList.remove('loading');
        initializeCardCharts(card);
        
        // Оновлюємо активний стан карток
        document.querySelectorAll('.card-item').forEach(cardItem => {
            cardItem.classList.remove('active');
        });
        document.querySelector(`.card-item[data-number="${card.number}"]`).classList.add('active');
    }, 300);
} 