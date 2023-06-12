import { modalOverlay } from './script.js';

const modal = document.getElementById('modal');
/** 
  @params skillTagName: tagname of skill to be added to skill element
  @params skillLevel: level of skill to be added to skill element
  @params skillTagId: tagId of skill
  @params userId: id of the user that skills are being modified
  @params skills: all skills of the user
  @returns skillItemElement: HTML element of skill consisting of tagname and level with remove button
*/
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
    modal.style.pointerEvents = 'none';
    modalOverlay.classList.add('active');
    const response = await removeSkillFromUser(skillTagId, userId);
    if (response.ok) {
      const skillToBeRemoved = (skill) => skill.tagId === skillTagId;
      const index = skills.findIndex(skillToBeRemoved);
      skills.splice(index, 1);
      skillItemElement.remove();
    }
    modal.style.pointerEvents = 'auto';
    modalOverlay.classList.remove('active');
  }

  return skillItemElement;
}

export default skillElement;
