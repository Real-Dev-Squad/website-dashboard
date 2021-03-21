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

    // const userAction = async () => {
    //   const response = await fetch(GET_WALLET);
    //   const json = await response.json(); //extract JSON from the http response
    //   // do something with response
    // }

    //To-Do: Delete the following mock once API call set up properly
    mockResponse = {
      "message": "Wallet returned successfully",
      "wallet": {
          "id": "id-of-wallet",
          "currencies": {
              "neelam": 14,
              "dinero": 200
          },
          "userId": "id-of-user"
      } 
    }

    const currencies = mockResponse.wallet.currencies;

    for (const currency in currencies) {
      let newCurrency = createCurrencyNode(`${currency}` , `${currencies[currency]}`);
      currenciesHolder.append(newCurrency);
    }
  }, 200);
}

function createCurrencyNode(currencyType, currencyVal) {
  const currencyRef = document.createElement('div');
  const currencyLabelRef = document.createElement('div');
  currencyRef.classList.add('currency');
  currencyLabelRef.classList.add('currencyLabel')

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
  const inputString = document.getElementById("all-users").value;
  const inputArray = inputString.split(',');

  inputArray.forEach(username => getUserWallet(username));
}

getWallets();