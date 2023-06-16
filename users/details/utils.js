function generateNoDataFoundSection(message) {
  document.title = 'User Not Found';
  const notFoundDiv = createElement({ type: 'div', classList: ['not-found'] });
  const notFoundImg = createElement({
    type: 'img',
    classList: ['not-found-img'],
  });
  notFoundImg.src = '/images/page-not-found.png';
  notFoundImg.setAttribute('alt', 'page not found');
  const notFoundText = createElement({
    type: 'h1',
    classList: ['not-found-text-h1'],
  });
  notFoundText.appendChild(createTextNode(message));
  notFoundDiv.append(notFoundImg, notFoundText);
  const container = document.querySelector('.user-details-header');
  container.appendChild(notFoundDiv);
}
