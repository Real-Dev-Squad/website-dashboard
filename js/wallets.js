const API_BASE_URL = 'https://api.realdevsquad.com';

const walletsRef = document.querySelector('.wallets');

const ipUsernames = document.querySelector('#all-users');
const usernames = ipUsernames.value;

const nodeMapping = {};

function createUserWallet(username) {
  const userWallet = document.createElement('div');
  userWallet.classList.add('user-wallet');
  nodeMapping[username] = userWallet;

  const currenciesHolder = document.createElement('div');
  currenciesHolder.classList.add('user-wallet__currencies');
  userWallet.append(currenciesHolder);

  const usernameHolder = document.createElement('div');
  usernameHolder.classList.add('user-wallet__username');
  usernameHolder.textContent = username;
  userWallet.append(usernameHolder);

  const refreshButton = document.createElement('button');
  refreshButton.classList.add('user-wallet__refresh-btn');
  refreshButton.textContent = 'Refresh';
  refreshButton.onclick = function () {
    updateWalletForUser(username);
  };
  userWallet.append(refreshButton);

  walletsRef.append(userWallet);
  return userWallet;
}

function getUserWallet(username) {
  const userWallet = nodeMapping[username] || createUserWallet(username);
  return userWallet;
}

function updateWalletForUser(username) {
  const userWallet = getUserWallet(username);
  const currenciesHolder = userWallet.querySelector('.user-wallet__currencies');

  // Remove previous
  const previousCurrencies = currenciesHolder.querySelectorAll('.currency');
  previousCurrencies.forEach((node) => node.remove());

  // Add fresh
  const userDataPromise = async () => {
    const response = await fetch(`${API_BASE_URL}/wallet/${username}`, {
      credentials: 'include',
    });
    return await response.json();
  };

  userDataPromise().then((data) => {
    const currencies = data.wallet.currencies;
    for (const [currency, value] of Object.entries(currencies)) {
      if (value > 0) {
        const newCurrency = createCurrencyNode(currency, value);
        currenciesHolder.append(newCurrency);
      }
    }
  });
}

function createCurrencyNode(currencyType, currencyVal) {
  const currencyRef = document.createElement('div');
  const currencyLabelRef = document.createElement('div');
  currencyRef.classList.add('currency');
  currencyLabelRef.classList.add('currencyLabel');

  // Create icon
  const icon = document.createElement('div');
  icon.classList.add('currency__icon');
  icon.classList.add(`currency-type--${currencyType}`);
  currencyRef.append(icon);

  // Create currency label
  const currencyLabel = document.createElement('p');
  currencyLabel.classList.add('currency__label');
  const currency = document.createTextNode(currencyType);
  currencyLabel.append(currency);
  currencyLabelRef.append(currencyLabel);

  // Create balance
  const balanceHolder = document.createElement('div');
  balanceHolder.classList.add('currency__balance');
  const balance = document.createTextNode(currencyVal);
  balanceHolder.append(balance);
  currencyLabelRef.append(balanceHolder);
  currencyRef.append(currencyLabelRef);

  return currencyRef;
}

function getWallets() {
  const inputString = document.getElementById('all-users').value;
  const usernamesProvided = inputString
    .split(',')
    .map((usrname) => usrname.trim());
  usernamesProvided.forEach((username) => updateWalletForUser(username));
}

getWallets();
