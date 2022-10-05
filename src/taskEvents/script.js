import {BASE_URL} from './url.js'
const container = document.getElementById("taskEvents-container")
const modal = document.getElementById("modal")
const overlay = document.querySelector(".overlay")

const closeBtn = document.getElementById("closeBtn")
closeBtn.addEventListener("click", closeModal)

async function getTaskLogs() {
  const res = await fetch(`${BASE_URL}/logs/tasks`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });

  const task_logs = await res.json();
  return task_logs;
}

async function getTaskData(id) {
  const res = await fetch(`${BASE_URL}/tasks/details/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json'
    }
  })
  const task_details = await res.json();
  return task_details;
}

async function getUserData(username) {
  console.log(username)
  const res = await fetch(`${BASE_URL}/users/${username}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json'
    }
  })
  const userData = await res.json();
  return userData
}

function createElement({type, attributes={}, innerText}) {
    const element = document.createElement(type)
    Object.keys(attributes).forEach(item => {
        element.setAttribute(item, attributes[item]);
    })
    element.textContent = innerText
    return element
}

function createEventCard(title, eventdescription, purpose, username) {
  const eventcard = createElement({type: "details", attributes: {class: "event_card"}})
  const summary = createElement({type: "summary", attributes: {class: "summary"}})
  const sumarryContainer = createElement({type: "div", attributes: {class: "sumarryContainer"}})

  const name = createElement({type: "button", attributes: {class: "name"}, innerText: username})
  name.addEventListener("click", () => createModal(username))
  const log = createElement({type: "p", attributes: {class: "log"}, innerText: eventdescription})
  const icon = createElement({type: "img", attributes: {class: "dropDown", src: "./assets/down.png", alt: "dropdown icon"}})
  const detailsContainer = createElement({type: "div", attributes: {class: "details-div-container"}})
  const details = createElement({type: "div", attributes: {class: "details-div"}})

  const taskTitleDiv = createElement({type: "div", attributes: {class: "task-title-div"}})
  const tasktitle = createElement({type: "span", attributes: {class: "task-title"}, innerText: "Title: "})
  const titleDetail = createElement({type: "span", attributes: {class: "task-title-detail"}, innerText: title})

  taskTitleDiv.appendChild(tasktitle)
  taskTitleDiv.appendChild(titleDetail)

  const taskPurposeDiv = createElement({type: "div", attributes: {class: "task-purpose-div"}})
  const taskPurpose = createElement({type: "span", attributes: {class: "task-purpose"}, innerText: "Purpose: "})
  const taskPurposeDetail = createElement({type: "span", attributes: {class: "task-purpose-detail"}, innerText: purpose})

  taskPurposeDiv.appendChild(taskPurpose)
  taskPurposeDiv.appendChild(taskPurposeDetail)

  details.appendChild(taskTitleDiv)
  details.appendChild(taskPurposeDiv)

  detailsContainer.appendChild(details)

  sumarryContainer.appendChild(name)
  sumarryContainer.appendChild(log)
  summary.appendChild(sumarryContainer)
  summary.appendChild(icon)

  eventcard.appendChild(summary)
  eventcard.appendChild(detailsContainer)
  container.append(eventcard)
}

function removeSkill (e) {
  // this is not how it's going to be done, when we have the userSkills this function is going to change
  alert(e.target.parentElement.textContent)
  e.target.parentElement.remove()
}

function createUserActivityBtn() {
  const activityBtnDiv = createElement({type: "div", attributes: {class: "activityBtnDiv"}})
  const activityBtn = createElement({type: "button", attributes: {class: "activityBtn"}, innerText: "show user activity"})
  activityBtnDiv.appendChild(activityBtn)
  return activityBtnDiv;
}

function openAddRoleDiv() {
  // make a div which covers 100% of the modal and is going to contains two drop downs and 
  // a submit button which will make a request to the backend and save the skill in userSkills collection
}

function createRolesDiv(roles) {
  const Allroles = [...roles]
  const rolesDiv = createElement({type: "div", attributes: {class: "roles-div"}})
  Allroles.map((role, index) => {
    const element = createElement({type: "div", attributes: {class: "roles-div-item"}, innerText: role})
    const removeBtn = createElement({type: "button", attributes: {class: "removeBtn", id: index}, innerText: "x"})
    removeBtn.addEventListener("click", removeSkill)
    element.appendChild(removeBtn)
    rolesDiv.append(element)
  })
  const addBtn = createElement({type: "button", attributes: {class: "addBtn"}, innerText: "+"})
  addBtn.addEventListener("click", openAddRoleDiv)
  rolesDiv.appendChild(addBtn)
  return rolesDiv
}

function createInput() {
  const inputDiv = createElement({type: "div", attributes: {class: "input-div"}})
  const inputEl = createElement({type: "input", attributes: {class: "inputEl", placeholder: "start typing to add a new skill"}})
  const addBtn = createElement({type: "button", attributes: {class: "addBtn"}})
  addBtn.addEventListener("click", () => console.log("do something here"))
  const addBtnImg = createElement({type: "img", attributes: {class: "addBtnImg", src: "./assets/add.png", alt: "add button image"}})
  addBtn.appendChild(addBtnImg)
  inputDiv.appendChild(inputEl)
  inputDiv.appendChild(addBtn)
  return inputDiv
}

async function createModal (username) {
  overlay.style.display = "block"
  const { user } = await getUserData(username)
  // another call for roles will be made when we have userSkills collection
  const userImg = createElement({type: "img", attributes: {src: user.picture.url, alt: "user img", class: "userImg"}})
  const userName = createElement({type: "p", attributes: {class: "username"}, innerText: user.username})
  
  document.querySelector(".top-div").prepend(userName)
  document.querySelector(".top-div").prepend(userImg)

  const skillTitle = createElement({type: "p", attributes: {class: "skillTitle"}, innerText: "Skills"})
  modal.appendChild(skillTitle)

  const rolesArray = ["React-level1", "Ember-level2", "Remix-level3", "NodeJs-level3", "random-levl1", ]
  const roles = createRolesDiv(rolesArray)
  modal.appendChild(roles)

  const activityBtn = createUserActivityBtn();
  modal.appendChild(activityBtn)

}

function closeModal() {
  overlay.style.display = "none"
  document.querySelector(".roles-div").remove();
  document.querySelector(".activityBtnDiv").remove();
  document.querySelector(".username").remove();
  document.querySelector(".skillTitle").remove();
  document.querySelector(".userImg").remove();
}

async function getData(data) {
  const message = data.body.message;
  const userName = data.meta.username;
  const taskId = data.meta.taskId;
  const { taskData } = await getTaskData(taskId)

  return {
    ...taskData,
    message,
    userName
  };
}

async function renderCard () {
  try {
    const {logs} = await getTaskLogs()
    const promises = logs.map((log) => getData(log))
    const allTaskData = await Promise.all(promises)
    allTaskData.map(data => createEventCard(data.title, data.message, data.purpose, data.userName))
  } catch (error) {
    console.log(error)
    alert("error happened")
  } finally {
    document.getElementById("loader").style.display = 'none'
  }
}

renderCard()
