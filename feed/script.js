const API_BASE_URL = window.API_BASE_URL;
const activityFeedContainer = document.getElementById(ACITIVITY_FEED_CONTAINER);
const activityList = document.querySelector('.activity-list');

let query = {}
let newLink = ''
async function renderFeed(){
  const div = document.createElement("div")
  div.innerText = "hello"
  activityFeedContainer.append(div)
  const activityFeedData = await getActivityFeedData(query, newLink);
  const allLogs = activityFeedData.logs;
  console.log(allLogs)

  for (let data of allLogs) {
    renderActivityItem(data);
  }
}

renderFeed()


function renderActivityItem(data) {
  const item = document.createElement('li');
  item.classList.add('activity-item');
console.log(data)
  let content = '';
  switch (data.type) {
    case logType.EXTENSION_REQUESTS:
      content =formatExtensionRequestsLog(data)
      break;
    // case logType.TASK:
    //   content = `
    //     <span class="user">${data.user.username || data.user.id}</span> requested an extension for task:
    //     <a href="${data.meta.taskId}">${data.task.title || 'Untitled Task'}</a>`;
    //   break;
    default:
      // Handle unknown event types gracefully
      content = 'Unknown activity type';
  }

  item.innerHTML = `
    ${content}`
  //   <time datetime="${new Date(data.timestamp).toISOString()}">${new Date(data.timestamp).toLocaleString()}</time>`;

  activityList.appendChild(item);
}


 function formatExtensionRequestsLog(data) {
  switch (data.body.status) {
    case "PENDING":
      return `<div>
        <p class="">${data.meta.userId || data.meta.createdBy}</p> raised an extension request for task:
        <a href="${data.meta.taskId}">${data?.meta?.taskId || 'Untitled Task'}</a>
        </div>
        <p>Ends On:</p>
`;
    case "APPROVED":
      return `
        <span class="user">${data.meta.userId || data.meta.createdBy}</span> approved an extension request for task:
        <a href="${data.meta.taskId}">${data?.meta?.taskId || 'Untitled Task'}</a>`;
    case "DENIED":
      return { action: "extension request got approved" };
    default:
      return {};
  }
}