import { createElement, removeSkillFromUser } from './utils.js';
import { modalOverlay } from './script.js';

/**** 
  @params 
  skillTagName: tagname of skill to be added to skill element
  skillLevel: level of skill to be added to skill element
  skillTagId: tagId of skill
  userId: id of the user that skills are being modified
  skills: all skills of the user
  @returns skillItemElement: HTML element of skill consisting of tagname and level with remove button
****/

function skillElement(skillTagName, skillLevel, skillTagId, userId, skills) {
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
      const skillToBeRemoved = (skill) => skill.tagId === skillTagId;
      const index = skills.findIndex(skillToBeRemoved);
      skills.splice(index, 1);
      skillItemElement.remove();
    }
    modalOverlay.classList.remove('active');
  }

  return skillItemElement;
}

export default skillElement;
