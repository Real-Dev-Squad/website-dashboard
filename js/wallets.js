const BASE_URL = 'https://api.realdevsquad.com';

const walletsRef = document.querySelector('.wallets');

const ipUsernames = document.querySelector('#all-users');
const usernames = ipUsernames.value;

const nodeMapping = {};

function createUserWallet (username) {
  const userWallet = document.createElement('div');
  userWallet.classList.add('user-wallet');
  nodeMapping[username] = userWallet;

  const currenciesHolder = document.createElement('div');
  currenciesHolder.classList.add('user-wallet__currencies');
  userWallet.append(currenciesHolder);

  const refreshButton = document.createElement('button');
  refreshButton.classList.add('user-wallet__refresh-btn');
  refreshButton.onclick = function() {
    updateWalletForUser(username);
  }
  userWallet.append(refreshButton);

  walletsRef.append(userWallet);
  return userWallet;
}

function getUserWallet (username) {
  const userWallet = nodeMapping[username] || createUserWallet(username);
  return userWallet;
}

function updateWalletForUser(username) {
  const userWallet = getUserWallet(username);
  const currenciesHolder = userWallet.querySelector('.user-wallet__currencies');

  setTimeout(() => {
    // Remove previous
    const previousCurrencies = currenciesHolder.querySelectorAll('.currency');
    previousCurrencies.forEach(node => node.remove());

    // Add fresh
    const currencies = { 
      dinero: 100,
      neelam: 2
    };

    // const c = createCurrencyNode('neelam', currencies.neelam);
    // currenciesHolder.append(c);
    // const ca = createCurrencyNode('dinero', Math.random());
    // currenciesHolder.append(ca);

  }, 200);
}

function createCurrencyNode(currencyType, currencyVal) {
  const currencyRef = document.createElement('div');
  currencyRef.classList.add('currency');

  // Create icon
  const icon = document.createElement('div');
  icon.classList.add('currency--icon');
  icon.classList.add(`currency-type-${currencyType}`);
  currencyRef.append(icon);

  // Create balance
  const balanceHolder = document.createElement('div');
  balanceHolder.classList.add('currency--balance');
  const balance = document.createTextNode(currencyVal);
  balanceHolder.append(balance);
  currencyRef.append(balanceHolder);

  return currencyRef;
}

getUserWallet('akanksha');
