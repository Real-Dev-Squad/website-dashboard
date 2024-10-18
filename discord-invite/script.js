// Script file for discord-invite feature.
const discordInviteDescription = document.querySelector(
  '#discord-invite-link-description',
);
const createInviteButton = document.querySelector('#create-discord-invite');

createInviteButton.addEventListener('click', () => {
  console.log('Invite button clicked', discordInviteDescription.value);
});
