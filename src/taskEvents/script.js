import {BASE_URL} from './url.js'
const container = document.getElementById("taskEvents-container")
const modal = document.getElementById("modal")
const overlay = document.querySelector(".overlay")

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

function createEventCard(eventTitle, eventdescription, isStatus, username) {
  const eventcard = createElement({type: "div", attributes: {class: "event_card"}})
  const title = createElement({type: "p", attributes: {class: "title"}, innerText: eventTitle})
  const detail = createElement({type: "p", attributes: {class: "detail"}, innerText: eventdescription})

  eventcard.appendChild(title)
  eventcard.appendChild(detail)
  if(isStatus) {
    const openProfile = createElement({type: "button", attributes: {class: "button"}, innerText: "update skill"})
    openProfile.addEventListener("click", () => renderModal(username))
    eventcard.appendChild(openProfile)
  }
  container.append(eventcard)
}

function openRolesList() {
  const img = createElement({type: "img", attributes: {class: "cancel", src: "./assets/cancel.png", alt: "cancel icon"}})
  const skillArray = ["react", "remix", "ember", "nodejs", "django"]
  const level = [1, 2, 3, 4, 5]
  const addRoleDiv = createElement({type: "div", attributes: {class: "addRoleDiv"}})
  img.addEventListener("click", () => addRoleDiv.style.display = "none")
  addRoleDiv.appendChild(img)
  const addSkillTitle = createElement({type: "h3", attributes: {class: "addSkillTitle"}, innerText: "add skills to user"})
  const selectSkill = createElement({type: "select", attributes: {class: "select-skill"}})
  const selectLevel = createElement({type: "select", attributes: {class: "select-level"}})

  for(let i = 0; i < skillArray.length; i++) {
    let option = createElement({type: "option", attributes: {class: "option", value: skillArray[i]}, innerText: skillArray[i]})
    selectSkill.appendChild(option)
  }
  
  for(let i = 0; i < level.length; i++) {
    let option = createElement({type: "option", attributes: {class: "option", value: level[i]}, innerText: level[i]})
    selectLevel.appendChild(option)
  }

  addRoleDiv.appendChild(addSkillTitle)
  addRoleDiv.appendChild(selectSkill)
  addRoleDiv.appendChild(selectLevel)
  overlay.appendChild(addRoleDiv)
}

function addRoles(roles) {
  const Allroles = [...roles]
  const rolesDiv = createElement({type: "div", attributes: {class: "roles_div"}})
  // function renderRoles() {
  //   rolesDiv.innerHTML = ""
  // }
  Allroles.map(role => {
    const element = createElement({type: "div", attributes: {class: "role_div_item"}, innerText: role})
    rolesDiv.append(element)
  })
  const addBtn = createElement({type: "button", attributes: {class: "addBtn"}, innerText: "+"})
  addBtn.addEventListener("click", () => {
    openRolesList()
  })
  rolesDiv.appendChild(addBtn)
  return rolesDiv;
}

function createModal(imgURl, userName, skillTags) {
  const userImg = createElement({type: "img", attributes: {class: "userImg", src: imgURl, alt: "user img"}})
  const userDetailSection = createElement({type: "div", attributes: {class: "user_details"}})
  const username = createElement({type: "p", attributes: {class: "username",}, innerText: `${userName}`});
  const title = createElement({type: "h3", attributes: {class: "skill-title"}, innerText: "Skills"})
  const rolesDiv = addRoles(skillTags)
  userDetailSection.appendChild(username)
  userDetailSection.appendChild(title)
  userDetailSection.appendChild(rolesDiv)
  modal.appendChild(userImg)
  modal.appendChild(userDetailSection)
}


function closeModal () {
  overlay.style.display = "none";
}
async function renderModal(userName) {
  try {
    overlay.style.display = "block"
    modal.innerHTML = `<p id="modal-loading>Loading</p>`
    const img = createElement({type: "img", attributes: {class: "cancel", src: "./assets/cancel.png", alt: "cancel icon"}})
    img.addEventListener("click", closeModal)
    modal.appendChild(img)
    const {user} = await getUserData(userName)
    console.log(user)
    console.log("hey")
    const {picture, username} = user;
    const roles = ["react-level1", "nodejs-level1", "remix-level1", "ember-level7"]
    createModal("https://res.cloudinary.com/dj8wcjoc8/image/upload/v1664562169/IMG-20200708-WA0043_ywhc0s.jpg", username, roles)
  } catch (err) {
    alert("an error occured")
    console.log(err)
  } finally {
    document.getElementById("modal-loading").style.display = "none"
  }
}

async function renderCard () {
  try {
    const {logs} = await getTaskLogs()
    
    logs.map(log => {
      let title;
      let status;
      let percentCompleted;
    
      if(log.body.status) {
        title = 'status changed'
        status = `${log.meta.username} changed status to ${log.body.status}`
        createEventCard(title, status, true, log.meta.username)
        return;
      }
    
      if(log.body.percentCompleted) {
        title = 'percent completed changed'
        percentCompleted = `${log.meta.username} completed ${log.body.percentCompleted}% task`
        createEventCard(title, percentCompleted);
        return;
      }
    })
  } catch (error) {
    console.log(error)
    alert("error happened")
  } finally {
    document.getElementById("loader").style.display = 'none'
  }
}

renderCard()
