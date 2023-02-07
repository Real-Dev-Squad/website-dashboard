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
