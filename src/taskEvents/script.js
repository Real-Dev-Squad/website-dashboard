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
  name.addEventListener("click", createModal)
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

function createUserActivityBtn() {
  const activityBtnDiv = createElement({type: "div", attributes: {class: "activityBtnDiv"}})
  const activityBtn = createElement({type: "button", attributes: {class: "activityBtn"}, innerText: "show user activity"})
  activityBtnDiv.appendChild(activityBtn)
  return activityBtnDiv;
}

function createRolesDiv(roles) {
  const Allroles = [...roles]
  const rolesDiv = createElement({type: "div", attributes: {class: "roles-div"}})
  Allroles.map(role => {
    const element = createElement({type: "div", attributes: {class: "roles-div-item"}, innerText: role})
    const removeBtn = createElement({type: "button", attributes: {class: "removeBtn"}, innerText: "x"})
    element.appendChild(removeBtn)
    rolesDiv.append(element)
  })
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

function createModal () {
  overlay.style.display = "block"
  const userImg = createElement({type: "img", attributes: {src: "https://res.cloudinary.com/dj8wcjoc8/image/upload/v1664903864/40eysn_1_vxg36h.jpg", alt: "user img", class: "userImg"}})
  const userName = createElement({type: "p", attributes: {class: "username"}, innerText: "vinayak"})
  
  document.querySelector(".top-div").prepend(userName)
  document.querySelector(".top-div").prepend(userImg)


  const input = createInput()
  modal.appendChild(input)

  const rolesArray = ["React-level1", "Ember-level2", "Remix-level3", "NodeJs-level3", ]
  const roles = createRolesDiv(rolesArray)
  modal.appendChild(roles)

  const activityBtn = createUserActivityBtn();
  modal.appendChild(activityBtn)

}

function closeModal() {
  document.querySelector(".username").remove();
  document.querySelector(".userImg").remove();
  document.querySelector(".input-div").remove();
  document.querySelector(".roles-div").remove();
  document.querySelector(".activityBtnDiv").remove();
  overlay.style.display = "none"
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
