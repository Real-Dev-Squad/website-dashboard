'use strict';

// setupDragDropEvent('.members-list');

let currentOnlineList = [];
let previousOnlineList = [];

function setUpOnlineUsersEventSource(url) {
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onopen = (e) => {
    console.info('The connection has been established.');
  };

  eventSource.onmessage = function (event) {
    try {
      const objectData = JSON.parse(event.data);
      currentOnlineList = objectData.users;

      previousOnlineList.forEach((user) => {
        users[user].isOnline = false;
      });

      currentOnlineList.forEach((user) => {
        users[user].isOnline = true;
      });

      previousOnlineList = currentOnlineList;
      updateUsersOnlineStatus(currentOnlineList, users);
    } catch (error) {
      console.error(
        'Error occurred while processing data, please contact admin',
        error,
      );
    }
  };

  eventSource.onerror = (e) => {
    console.error('An error occurred while attempting to connect.', e);
    eventSource.close();
  };

  return eventSource;
}

const onlineUsersEventSource = setUpOnlineUsersEventSource(RDS_SSE_ONLINE_URL);

function updateUsersOnlineStatus(onlineUsersList, users) {
  let targetPositionOfOnlineMember = 0;
  const usersUl = document.getElementById(USERS_LIST_ID);
  const userLi = usersUl.getElementsByTagName('li');
  // Hiding online status for all users
  for (const user of userLi) {
    const userDiv = user.getElementsByClassName(USERS_CLASS)[0];
    const username = userDiv.dataset.username;

    const userOnlineStatusDiv =
      user.getElementsByClassName(USERS_ONLINE_CLASS)[0];
    userOnlineStatusDiv.classList.add(USERS_ONLINE_HIDDEN_CLASS);

    // Showing online status for online users
    if (users[username].isOnline) {
      userOnlineStatusDiv.classList.remove(USERS_ONLINE_HIDDEN_CLASS);

      // Moving online users to the top of list
      usersUl.insertBefore(user, userLi[targetPositionOfOnlineMember++]);
    }
  }
}
