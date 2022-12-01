import { createElement, removeSkillFromUser } from './utils.js';
import { modalOverlay } from './script.js';

function skillElement(skillTagName, skillLevel, skillTagId, userId) {
  const skillItemElement = createElement({
    type: 'div',
    attributes: { class: 'roles-div-item' },
    innerText: `${skillTagName} `,
  });
  const skillLevelElement = createElement({
    type: 'small',
    innerText: `LVL: ${skillLevel}`,
  });
  skillItemElement.append(skillLevelElement);
  const removeBtn = createElement({
    type: 'button',
    attributes: { class: 'remove-btn' },
    innerText: 'x',
  });
  removeBtn.addEventListener('click', () =>
    handleRemoveSkill(skillItemElement),
  );
  skillItemElement.appendChild(removeBtn);

  async function handleRemoveSkill(skillItemElement) {
    modalOverlay.classList.add('active');
    const response = await removeSkillFromUser(skillTagId, userId);
    if (response.ok) {
      skillItemElement.remove();
    }
    modalOverlay.classList.remove('active');
  }

  return skillItemElement;
}

export default skillElement;
