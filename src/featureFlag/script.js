let applicationState = 'ADD_FLAG'; // ADD_FLAG UPDATE_FLAG

// initialize
async function initialize() {
  const flags = await fetchFlags();
  renderFlags(flags);
  configureListeners();
  handleOnSubmit();
}

initialize();

// On selecting flag

// On selecting Add button

// Submitting form
function handleOnSubmit() {
  const flagForm = document.querySelector('#flag-form');
  flagForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = getFlagFormData(flagForm, applicationState);
    console.log(data);
  });
}
