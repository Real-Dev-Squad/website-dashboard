// using mock data for the time being
import data from './mockData.json' assert { type: 'json' };

const wrapper = document.createElement('div');
wrapper.classList.add('wrapperDiv');

//fixing footer at bottom to handle even if there is no data present
const footerDiv = document.querySelector('#footer');
document.body.insertBefore(wrapper, footerDiv);

//resusable function to extract the key property field and displaying the data
function formatPropertyField(property) {
  return property
    .split('_')
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(' ');
}

function createCard({ oldData, newData }) {
  const cardContainer = createCardComponent({
    className: 'cardDiv',
    tagName: 'div',
    parent: wrapper,
  });

  const userName = document.createElement('p');
  userName.classList.add('userNameContainer');
  cardContainer.appendChild(userName);
  userName.innerText = `Username: ${oldData.first_name.toLowerCase()}`;

  const dataContainer = document.createElement('div');
  dataContainer.classList.add('dataContainer');
  cardContainer.appendChild(dataContainer);

  const dataInnerContainer = document.createElement('div');
  dataInnerContainer.classList.add('dataInnerContainer');
  dataContainer.appendChild(dataInnerContainer);

  const oldDataContainer = document.createElement('div');
  oldDataContainer.classList.add('oldDataContainer');
  dataInnerContainer.appendChild(oldDataContainer);

  const oldDataHeading = document.createElement('h3');
  oldDataHeading.innerText = 'Old Data';
  oldDataContainer.appendChild(oldDataHeading);

  const oldUserInfoList = document.createElement('ul');
  oldUserInfoList.classList.add('userInfoListContainer');
  oldDataContainer.appendChild(oldUserInfoList);

  //looping through the old data to display in list
  for (const listItem in oldData) {
    const li = document.createElement('li');
    li.innerText = `${formatPropertyField(listItem)}: ${oldData[listItem]}`;
    oldUserInfoList.appendChild(li);
  }

  const newDataContainer = document.createElement('div');
  newDataContainer.classList.add('newDataContainer');
  dataInnerContainer.appendChild(newDataContainer);

  const newDataHeading = document.createElement('h3');
  newDataHeading.innerText = 'New Data';
  newDataContainer.appendChild(newDataHeading);

  const newUserInfoList = document.createElement('ul');
  newUserInfoList.classList.add('userInfoListContainer');
  newDataContainer.appendChild(newUserInfoList);

  //looping through the new data to display in list
  for (const listItem in newData) {
    const li = document.createElement('li');
    li.innerText = `${formatPropertyField(listItem)}: ${newData[listItem]}`;
    newUserInfoList.appendChild(li);
  }

  const buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('buttonsContainer');
  dataContainer.appendChild(buttonsContainer);

  const approveBtn = document.createElement('button');
  const rejectBtn = document.createElement('button');
  approveBtn.innerText = 'Approve';
  rejectBtn.innerText = 'Reject';

  buttonsContainer.appendChild(approveBtn);
  buttonsContainer.appendChild(rejectBtn);
}

data.forEach((item) => {
  createCard(item);
});

// creating a resuable card container component for showing multiple cards
function createCardComponent({ className, tagName, innerText, parent }) {
  const component = document.createElement(tagName);
  if (className) {
    component.classList.add(className);
  }

  if (innerText) {
    component.innerText = innerText;
  }

  if (parent) {
    parent.appendChild(component);
  }

  return component;
}
