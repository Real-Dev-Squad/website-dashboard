import { createElement, removeSkillFromUser } from './utils.js';
import { modalOverlay } from './script.js';

function roleElement(roleTagname, roleLevel, roleTagnameId, userId) {
  const roleItemElement = createElement({
    type: 'div',
    attributes: { class: 'roles-div-item' },
    innerText: `${roleTagname} `,
  });
  const roleLevelElement = createElement({
    type: 'small',
    innerText: `LVL: ${roleLevel}`,
  });
  roleItemElement.append(roleLevelElement);
  // <small>LVL: ${roleLevel}</small>`
  const removeBtn = createElement({
    type: 'button',
    attributes: { class: 'remove-btn' },
    innerText: 'x',
  });
  removeBtn.addEventListener('click', () => handleRemoveSkill(roleItemElement));
  roleItemElement.appendChild(removeBtn);

  async function handleRemoveSkill(roleItemElement) {
    modalOverlay.classList.add('active');
    const response = await removeSkillFromUser(roleTagnameId, userId);
    if (response.ok) {
      roleItemElement.remove();
    }
    modalOverlay.classList.remove('active');
  }

  return roleItemElement;
}

export default roleElement;
