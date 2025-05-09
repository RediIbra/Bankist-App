'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-03-04T17:01:17.194Z',
    '2023-03-06T23:36:17.929Z',
    '2023-03-10T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

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
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


const btnLogout = document.querySelector('.btn--logout');
const formLogin = document.querySelector('.login');
/////////////////////////////////////////////////
// Functions

document.querySelector('.btn--logout').addEventListener('click', function() {
  localStorage.removeItem('currentAccount');
  window.location.reload();
});

document.addEventListener('DOMContentLoaded', () => {
  const savedAccount = localStorage.getItem('currentAccount');
  if (savedAccount) {
    currentAccount = JSON.parse(savedAccount);
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;
    formLogin.classList.add('hidden');
    btnLogout.classList.remove('hidden');
    document.querySelector('.nav-links').classList.remove('hidden');
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

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
};

// Intl Numbers Functions
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // Fallbacks if data is missing
  const movsArray = Array.isArray(acc.movements) ? acc.movements : [];
  const datesArray = Array.isArray(acc.movementsDates) ? acc.movementsDates : [];

  const movs = sort
    ? movsArray.slice().sort((a, b) => a - b)
    : movsArray;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // Safe date lookup with a default
    const dateStr = datesArray[i] || new Date().toISOString();
    const date = new Date(dateStr);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Ensure all required fields exist and have the right type
  if (!Array.isArray(acc.movements)) acc.movements = [];
  if (!Array.isArray(acc.movementsDates)) acc.movementsDates = [];
  if (typeof acc.interestRate !== 'number') acc.interestRate = 0;
  if (typeof acc.currency !== 'string') acc.currency = 'USD';
  if (typeof acc.locale !== 'string') acc.locale = 'en-US';

  // Now safely call the display and calculation functions
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  const username = inputLoginUsername.value;
  const pin = +inputLoginPin.value;

  // Send login credentials to the backend API
  fetch(`http://localhost:3000/users/${username}`)
    .then(response => response.json())
    .then(data => {
      if (data.pin === pin) {
        // Login successful, display user data
        currentAccount = data;
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${currentAccount?.owner?.split(' ')[0]}`;
        containerApp.style.opacity = 100;
     
        // Show the navigation links
        document.querySelector('.nav-links').classList.remove('hidden');
        formLogin.classList.add('hidden');
        btnLogout.classList.remove('hidden');
        // Current date and time
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
        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();


        // Update UI with fetched data
        localStorage.setItem('currentAccount', JSON.stringify(currentAccount));

        // Retrieve user on page load
        const savedUser = localStorage.getItem('currentAccount');
        if (savedUser) {
          currentAccount = JSON.parse(savedUser);
          updateUI(currentAccount);
          containerApp.style.opacity = 100;
          labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        }
      } else {
        alert('Incorrect pin');
      }
    })
    .catch(err => {
      console.error('Error fetching user data:', err);
      alert('Error logging in');
    });
});



btnTransfer.addEventListener('click', async function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverUsername = inputTransferTo.value;
  const senderUsername   = currentAccount.username;

  // clear inputs immediately
  inputTransferAmount.value = inputTransferTo.value = '';

  // basic front-end validation
  if (
    amount <= 0 ||
    !receiverUsername ||
    senderUsername === receiverUsername ||
    currentAccount.balance < amount
  ) {
    return alert('Invalid transfer details');
  }

  try {
    // 1) Perform transfer on backend
    const res = await fetch('http://localhost:3000/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderUsername, receiverUsername, amount }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Transfer failed (${res.status})`);
    }

    // 2) Re-fetch updated sender data
    const userRes = await fetch(`http://localhost:3000/users/${senderUsername}`);
    if (!userRes.ok) throw new Error('Failed to reload user data');
    const updatedAccount = await userRes.json();

    // 3) Update currentAccount and UI
    currentAccount = updatedAccount;
    updateUI(currentAccount);

    // 4) Reset logout timer
    // clearInterval(timer);
    // timer = startLogOutTimer();
  } catch (err) {
    console.error('Transfer error:', err);
    alert(err.message);
  }
});


btnLoan.addEventListener('click', async function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  inputLoanAmount.value = '';

  if (amount <= 0) return alert('Enter a valid loan amount');

  try {
    // Request loan from backend
    const res = await fetch('http://localhost:3000/loan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentAccount.username,
        amount,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({}));
      throw new Error(err.error || `Loan failed (${res.status})`);
    }

    // Backend returns updated user
    const updatedAccount = await res.json();

    // Update local state and UI
    currentAccount = updatedAccount;
    updateUI(currentAccount);

    // Reset logout timer
    // clearInterval(timer);
    // timer = startLogOutTimer();
  } catch (err) {
    console.error('Loan error:', err);
    alert(err.message);
  }
});

btnClose.addEventListener('click', async function (e) {
  e.preventDefault();

  // 1) Must be logged in
  if (!currentAccount) {
    return alert('You must be logged in to delete your account.');
  }

  const username = inputCloseUsername.value;
  const pin      = +inputClosePin.value;

  // 2) Validate that the inputs match the logged-in user
  if (username !== currentAccount.username || pin !== currentAccount.pin) {
    inputCloseUsername.value = inputClosePin.value = '';
    return alert('Username or PIN incorrect');
  }

  // Clear inputs
  inputCloseUsername.value = inputClosePin.value = '';

  try {
    // 3) Call backend to delete the logged-in user
    const res = await fetch('http://localhost:3000/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, pin }),
    });

    if (res.status === 204) {
      // 4) Successful deletion: hide UI and reset state
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Account deleted. Goodbye!';
      currentAccount = null;
    } else {
      // 5) Handle errors
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Delete failed (${res.status})`);
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert(err.message);
  }
});



let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////