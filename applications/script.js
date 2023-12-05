import { createElement } from './utils.js';

function createApplicationCard({ username, companyName, skills, intro }) {
  const applicationCard = createElement({
    type: 'div',
    attributes: { class: 'application-card' },
  });

  const userInfoContainer = createElement({
    type: 'div',
    attributes: { class: 'user-info' },
  });

  const usernameText = createElement({
    type: 'p',
    attributes: { class: 'username' },
    innerText: username,
  });

  const companyNameText = createElement({
    type: 'p',
    attributes: { class: 'company-name' },
    innerText: `Company name: ${companyName}`,
  });

  const skillsText = createElement({
    type: 'p',
    attributes: { class: 'skills' },
    innerText: `Skills: ${skills}`,
  });

  userInfoContainer.appendChild(usernameText);
  userInfoContainer.appendChild(companyNameText);
  userInfoContainer.appendChild(skillsText);

  const introductionText = createElement({
    type: 'p',
    attributes: { class: 'user-intro' },
    innerText: intro,
  });

  const viewDetailsButton = createElement({
    type: 'button',
    attributes: { class: 'view-details-button' },
    innerText: 'View Details',
  });

  applicationCard.appendChild(userInfoContainer);
  applicationCard.appendChild(introductionText);
  applicationCard.appendChild(viewDetailsButton);

  return applicationCard;
}

(function renderApplicationCards() {
  const applicationContainer = document.querySelector('.application-container');
  Array.from({ length: 10 }).map(() => {
    const applicationCard = createApplicationCard({
      username: 'Vinayak',
      companyName: 'JumpingMinds',
      intro:
        'mattis aliquam faucibus purus in massa tempor nec feugiat nisl pretium fusce id velit ut tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed viverra tellus in hac habitasse platea dictumst vestibulum rhoncus est pe..',
      skills: 'React, Node js',
    });
    applicationContainer.appendChild(applicationCard);
  });
})();
