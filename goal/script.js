(() => {
  const edits = document.querySelectorAll('.inputBox label.editable');
  edits.forEach((edit, index) => {
    const element = document.createElement('span');
    element.innerHTML = 'Edit';
    element.classList.add('edit-button');
    element.addEventListener('click', (event) => {
      event.target.classList.toggle('edit-button__active');
      const input = event.target.parentElement.nextElementSibling;
      input.classList.toggle('notEditing');
    });
    edit.append(element);
  });
})();

const createGoalPage = document.getElementById('goal-page-container');
const errorContainer = document.getElementById('error-container');
const params = new URLSearchParams(window.location.search);
if (params.get('dev') === 'true') {
  createGoalPage.classList.remove('hidden');
  errorContainer.classList.add('hidden');
}
