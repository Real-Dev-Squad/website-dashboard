'use strict';

// setupDragDropEvent('.members-list');

let currentOnlineList = [];
let previousOnlineList = [];

function setUpEventSource(url) {
  const evtSource = new EventSource(url);

  evtSource.onopen = (e) => {
    console.log('The connection has been established.');
  };

  evtSource.onmessage = function (event) {
    const objectData = JSON.parse(event.data);
    currentOnlineList = objectData.users;

    previousOnlineList.forEach((member) => {
      members[member].isOnline = false;
    });

    currentOnlineList.forEach((member) => {
      members[member].isOnline = true;
    });

    previousOnlineList = currentOnlineList;
    updateMembersOnlineStatus(currentOnlineList);
  };

  evtSource.onerror = (e) => {
    console.log('An error occurred while attempting to connect.', e);
    eventSource.close();
  };

  return evtSource;
}

const eventSource = setUpEventSource(RDS_SSE_ONLINE_URL);

function updateMembersOnlineStatus(onlieMembersList) {
  let toPositionOfOnlineMember = 0;
  const memebrsUl = document.getElementById(MEMBERS_LIST_ID);
  const memberLi = memebrsUl.getElementsByTagName('li');
  // Hiding online status for all members
  for (let i = 0; i < memberLi.length; i++) {
    const memberDiv = memberLi[i].getElementsByClassName(MEMBERS_CLASS)[0];
    const memberUsername = memberDiv.dataset.username;

    const memberOnlineStatusDiv =
      memberLi[i].getElementsByClassName(MEMBERS_ONLINE_CLASS)[0];
    memberOnlineStatusDiv.classList.add(MEMBERS_ONLINE_HIDDEN_CLASS);

    // Showing online status for online memebrs
    if (members[memberUsername].isOnline) {
      memberOnlineStatusDiv.classList.remove(MEMBERS_ONLINE_HIDDEN_CLASS);

      const membersParentDiv = memberDiv.parentNode.parentNode;
      // Moving online users to the top of list
      memebrsUl.insertBefore(memberLi[i], memberLi[toPositionOfOnlineMember++]);
    }
  }
}
