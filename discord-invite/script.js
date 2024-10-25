// Script file for discord-invite feature.
import {
  createElement,
  getIsSuperUser,
  generateDiscordInviteLink,
} from './utils.js';

const discordInviteDescription = document.querySelector(
  '#discord-invite-link-description',
);
const createInviteButton = document.querySelector('#create-discord-invite');
const loader = document.querySelector('.loader');
const mainContainer = document.querySelector('.container');
const subContainer = document.querySelector('.wrapper');
const showDataWrapper = document.querySelector('.show-data-wrapper');
const invitePurpose = document.querySelector('.invite-purpose');
const discordInviteLink = document.querySelector('.discord-invite-link');

function changeLoaderVisibility({ hide }) {
  if (hide) loader.classList.add('hidden');
  else loader.classList.remove('hidden');
}

(async function renderCardsInitial() {
  changeLoaderVisibility({ hide: false });

  const isSuperUser = await getIsSuperUser();

  if (!isSuperUser) {
    const unAuthorizedText = createElement({
      type: 'h2',
      attributes: { class: 'unauthorized-text' },
      innerText: 'You are not authorized to view this page.',
    });
    mainContainer.append(unAuthorizedText);
    subContainer.classList.add('hidden');
    changeLoaderVisibility({ hide: true });
    return;
  }

  subContainer.classList.remove('hidden');

  changeLoaderVisibility({ hide: true });
})();

createInviteButton.addEventListener('click', async () => {
  const data = await generateDiscordInviteLink(discordInviteDescription.value);
  subContainer.classList.add('hidden');
  showDataWrapper.classList.remove('hidden');
  invitePurpose.innerHTML = data.purpose;
  discordInviteLink.innerHTML = data.inviteLink;
});
