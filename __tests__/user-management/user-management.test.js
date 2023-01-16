import { fireEvent, getByText } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(
  path.resolve(__dirname, '../../user-management/index.html'),
  'utf8',
);

let dom;
let container;

// import '../../user-management/constants.js'
// import '../../user-management/utils.js'
import { init } from '../../user-management/script.js';

// require('../../user-management/constants.js')
// require('../../user-management/utils.js')
// require('../../user-management/script.js')

describe('test the index.html page of user management', () => {
  beforeEach(() => {
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    container = dom.window.document;
  });

  it('renders the heading and title element', () => {
    expect(container.querySelector('title')).not.toBeNull();
    expect(container.querySelector('title').textContent).toBe(
      'User Management',
    );
    expect(container.querySelector('h1')).not.toBeNull();
    expect(container.querySelector('h1').textContent).toBe('User Management');
  });

  it('Users Search input element exists', () => {
    const inputElement = container.querySelector('#user-search');
    expect(inputElement).toBeTruthy();
    expect(inputElement).toHaveAttribute('placeholder', 'Search Users');
    const userNote = container.querySelector('#user-note');
    expect(userNote).toBeTruthy();
    expect(userNote.innerHTML).toBe('user can be searched by username only');
  });

  it('tile view and table view button element exist and have an image child with correct alt attribute', () => {
    const tableViewBtn = container.querySelector('#table-view-btn');
    expect(tableViewBtn).not.toBeNull();
    const imgTableViewBtn = tableViewBtn.querySelector('img');
    expect(imgTableViewBtn).toBeTruthy();
    expect(imgTableViewBtn.getAttribute('alt')).toBe('table-view');

    const tileViewBtn = container.querySelector('#tile-view-btn');
    expect(tileViewBtn).not.toBeNull();
    const imgTileViewBtn = tileViewBtn.querySelector('img');
    expect(imgTileViewBtn).toBeTruthy();
    expect(imgTileViewBtn.getAttribute('alt')).toBe('tile-view');
  });

  test('prevButton and nextButton to navigate between pages exist', () => {
    const prevButton = container.querySelector('#prevButton');
    const nextButton = container.querySelector('#nextButton');
    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
  });
});

// describe('test the javascript file in user management page', () => {

//   jest.mock('../../user-management/script.js', () => {
//     return {
//       showTileView: jest.fn()
//     }
//   })

//   beforeEach(() => {
//     dom = new JSDOM(html, { runScripts: 'dangerously' })
//     container = dom.window.document
//     const prevBtn = container.createElement("button")
//     prevBtn.id = "prevButton"
//     container.body.appendChild(prevBtn)
//     require('../../user-management/constants.js')
//     require('../../user-management/utils.js')
//     require('../../user-management/script.js')
//   })

//   it('should add the tile-width class to the list element and remove-element to the image element', () => {
//     showTileView();
//     const listContainerElement = container.getElementById(USER_LIST_ELEMENT).lastChild;
//     listContainerElement.childNodes.forEach((listElement) => {
//       const imgElement = listElement.firstChild;
//       expect(imgElement.classList.contains('remove-element')).toBe(true);
//       expect(listElement.classList.contains('tile-width')).toBe(true);
//     });
//   });

//   it('should change the class of element', () => {
//     const mockElement = { classList: { add: jest.fn() } }
//     showTileView.call({ tableViewBtn: mockElement })
//     expect(mockElement.classList.add).toHaveBeenCalledWith('btn-active')
//   })
// })

describe('init', () => {
  dom = new JSDOM(html, { runScripts: 'dangerously' });
  const document = dom.window.document;
  const prevBtn = document.createElement('button');
  const nextBtn = document.createElement('button');
  const tileViewBtn = document.createElement('button');
  const tableViewBtn = document.createElement('button');
  const userSearchElement = document.createElement('input');
  const userListElement = document.createElement('div');
  const paginationElement = document.createElement('div');
  const loaderElement = document.createElement('div');
  prevBtn.id = 'prevButton';
  nextBtn.id = 'nextButton';
  tileViewBtn.id = 'tile-view-btn';
  tableViewBtn.id = 'table-view-btn';
  userSearchElement.id = 'user-search';
  userListElement.id = 'user-list';
  paginationElement.id = 'pagination';
  loaderElement.id = 'loader';

  // const userListElement = document.getElementById('user-list');
  // const loaderElement = document.getElementById('loader');
  // const tileViewBtn = document.getElementById('tile-view-btn');
  // const tableViewBtn = document.getElementById('tile-view-btn');
  // const userSearchElement = document.getElementById('user-search');
  // const paginationElement = document.getElementById('pagination');
  // const prevBtn = document.getElementById('prevButton');
  // const nextBtn = document.getElementById('nextButton');

  // beforeEach(() => {

  //   // require('../../user-management/constants.js')
  //   // require('../../user-management/utils.js')
  //   // require('../../user-management/script.js')

  //   // require('../../user-management/constants.js')
  //   // require('../../user-management/utils.js')
  //   // require('../../user-management/script.js')

  // });

  it('should call showUserDataList when prev button is clicked', () => {
    const showUserDataListMock = jest.fn();

    init(
      prevBtn,
      nextBtn,
      tileViewBtn,
      tableViewBtn,
      userSearchElement,
      userListElement,
      paginationElement,
      loaderElement,
      showUserDataListMock,
    );
    // prevBtn.dispatchEvent(new Event('click'));
    fireEvent.click(prevBtn);
    expect(showUserDataListMock).toHaveBeenCalled();
  });

  it('should call showUserDataList when next button is clicked', () => {
    const showUserDataListMock = jest.fn();
    init(
      prevBtn,
      nextBtn,
      tileViewBtn,
      tableViewBtn,
      userSearchElement,
      userListElement,
      paginationElement,
      loaderElement,
      showUserDataListMock,
    );
    nextBtn.dispatchEvent(new Event('click'));
    expect(showUserDataListMock).toHaveBeenCalled();
  });

  it('should call showTileView when tileView button is clicked', () => {
    const showTileViewMock = jest.fn();
    init(
      prevBtn,
      nextBtn,
      tileViewBtn,
      tableViewBtn,
      userSearchElement,
      userListElement,
      paginationElement,
      loaderElement,
      showTileViewMock,
    );
    tileViewBtn.dispatchEvent(new Event('click'));
    expect(showTileViewMock).toHaveBeenCalled();
  });

  it('should call showTableView when tableView button is clicked', () => {
    const showTableViewMock = jest.fn();
    init(
      prevBtn,
      nextBtn,
      tileViewBtn,
      tableViewBtn,
      userSearchElement,
      userListElement,
      paginationElement,
      loaderElement,
      showTableViewMock,
    );
    tableViewBtn.dispatchEvent(new Event('click'));
    expect(showTableViewMock).toHaveBeenCalled();
  });
});
