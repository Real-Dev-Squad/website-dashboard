import { createElement, removeSkillFromUser } from './utils.js';
import { modalOverlay } from './script.js';

function roleElement(roleTagname, roleLevel, roleTagnameid, userid) {
  const element = createElement({
    type: 'div',
    attributes: { class: 'roles-div-item' },
    innerHTML: `${roleTagname} <small>LVL: ${roleLevel}</small>`,
  });
  const removeBtn = createElement({
    type: 'button',
    attributes: { class: 'remove-btn' },
    innerHTML: `&#x2715`,
  });
  removeBtn.addEventListener('click', () => handleRemoveSkill(element));
  element.appendChild(removeBtn);

  async function handleRemoveSkill(element) {
    modalOverlay.classList.add('active');
    const response = await removeSkillFromUser(roleTagnameid, userid);
    if (response.ok) {
      element.remove();
    }
    modalOverlay.classList.remove('active');
  }

  return element;
}

export default roleElement;
