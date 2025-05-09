const account = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2020-04-10T14:43:26.374Z',
      '2020-06-25T18:49:59.371Z',
      '2020-03-26T12:01:20.894Z',
    ],
    items: [
      'Salary', 'Gift', 'Snacks', 'Toys', 'Rent', 'Books', 'Bonus', 'Ice Cream'
    ],
    currency: 'USD',
    locale: 'en-US',
  };
  const labelDate = document.querySelector('.date');
  const formTransfer = document.querySelector('.form--transfer');
  const inputItem = document.querySelector('.form__input--to');
  const inputAmount = document.querySelector('.form__input--amount');
  const movementsContainer = document.querySelector('.movements');
  const balanceEl = document.querySelector('.balance__value');
  const summaryIn = document.querySelector('.summary__value--in');
  const summaryOut = document.querySelector('.summary__value--out');
  const formDeposit = document.querySelector('.form--deposit');
const inputDepositAmount = document.querySelector('.form__input--deposit-amount');

document.addEventListener('DOMContentLoaded', () => {
  const savedAccount = localStorage.getItem('currentAccount');
  if (savedAccount) {
    currentAccount = JSON.parse(savedAccount);
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    updateUI(currentAccount);
  }
});

  const formatDate = dateStr => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(account.locale).format(date);
  };

  const updateUI = () => {
    // Clear current UI
    movementsContainer.innerHTML = '';

    account.movements.forEach((mov, i) => {
      const type = mov > 0 ? 'deposit' : 'withdrawal';
      const date = formatDate(account.movementsDates[i]);
      const item = account.items[i] || (type === 'deposit' ? 'Deposit' : 'Expense');

      const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__date">${date}</div>
          <div class="movements__item">${item}</div>
          <div class="movements__value">${mov.toLocaleString(account.locale, {
            style: 'currency',
            currency: account.currency,
          })}</div>
        </div>
      `;
      movementsContainer.insertAdjacentHTML('afterbegin', html);
    });

    const balance = account.movements.reduce((acc, mov) => acc + mov, 0);
    balanceEl.textContent = balance.toLocaleString(account.locale, {
      style: 'currency',
      currency: account.currency,
    });

    const incomes = account.movements.filter(mov => mov > 0).reduce((a, b) => a + b, 0);
    const out = account.movements.filter(mov => mov < 0).reduce((a, b) => a + b, 0);
    summaryIn.textContent = incomes.toLocaleString(account.locale, {
      style: 'currency',
      currency: account.currency,
    });
    summaryOut.textContent = Math.abs(out).toLocaleString(account.locale, {
      style: 'currency',
      currency: account.currency,
    });
  };

  const addExpense = (item, amount) => {
    const balance = account.movements.reduce((acc, mov) => acc + mov, 0);
    if (amount > balance) {
      alert('Not enough funds!');
      return;
    }
    account.movements.push(-amount);
    account.movementsDates.push(new Date().toISOString());
    account.items.push(item);
    updateUI();
  };

  formTransfer.addEventListener('submit', function (e) {
    e.preventDefault();
    const item = inputItem.value;
    const amount = +inputAmount.value;
    if (item && amount > 0) {
      addExpense(item, amount);
      inputItem.value = inputAmount.value = '';
    }
  });


  formDeposit.addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = +inputDepositAmount.value;
  if (amount > 0) {
    account.movements.push(amount);
    account.movementsDates.push(new Date().toISOString());
    account.items.push('Deposit');
    updateUI();
    inputDepositAmount.value = '';
  }
});

  
  // Initial load
  updateUI();