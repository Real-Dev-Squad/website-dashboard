'use strict';

let flags;

// initialize
async function initialize() {
  flags = await fetchFlags();
  renderFlagDropdown(flags);
  handleOnSubmit();
}
initialize();

// On selecting/changing flag
async function handleFlagChange(e) {
  const flagId = e.value;
  const flag = flags.find((flag) => flag.flagId === flagId);

  setFlag(flag);
  document.getElementById('create-flag').style.display = 'block';
}

// On selecting Add button
async function handleAddFlag() {
  document.getElementById('flag-dropdown-default').selected = 'selected';
  setFlag(newFlagConfig);

  document.getElementById('create-flag').style.display = 'none';
  console.log(document.getElementById('create-flag'));
}

// Submitting form
async function handleOnSubmit() {
  const flagForm = document.querySelector('#flag-form');
  flagForm.addEventListener('submit', (e) => {
    e.preventDefault();

    toggleSubmitButton({ enable: false });
    // Using flagId to determine weather we want to add or update flag
    const { flagId, ...data } = getFlagFormData(flagForm);
    flagId ? updateFlagCall(flagId, data) : addFlagCall(data);
  });
}
