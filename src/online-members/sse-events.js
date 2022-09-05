'use strict';

// setupDragDropEvent('.members-list');

let currentOnlineList = [];
let previousOnlineList = [];

function setUpOnlineMembersEventSource(url) {
  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onopen = (e) => {
    console.info('The connection has been established.');
  };

  eventSource.onmessage = function (event) {
    try {
      const objectData = JSON.parse(event.data);
      currentOnlineList = objectData.users;

      previousOnlineList.forEach((member) => {
        members[member].isOnline = false;
      });

      currentOnlineList.forEach((member) => {
        members[member].isOnline = true;
      });

      previousOnlineList = currentOnlineList;
      updateMembersOnlineStatus(currentOnlineList, members);
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

const onlineMembersEventSource =
  setUpOnlineMembersEventSource(RDS_SSE_ONLINE_URL);

function updateMembersOnlineStatus(onlieMembersList, members) {
  let targetPositionOfOnlineMember = 0;
  const membersUl = document.getElementById(MEMBERS_LIST_ID);
  const memberLi = membersUl.getElementsByTagName('li');
  // Hiding online status for all members
  for (const member of memberLi) {
    const memberDiv = member.getElementsByClassName(MEMBERS_CLASS)[0];
    const memberUsername = memberDiv.dataset.username;

    const memberOnlineStatusDiv =
      member.getElementsByClassName(MEMBERS_ONLINE_CLASS)[0];
    memberOnlineStatusDiv.classList.add(MEMBERS_ONLINE_HIDDEN_CLASS);

    // Showing online status for online members
    if (members[memberUsername].isOnline) {
      memberOnlineStatusDiv.classList.remove(MEMBERS_ONLINE_HIDDEN_CLASS);

      // Moving online users to the top of list
      membersUl.insertBefore(member, memberLi[targetPositionOfOnlineMember++]);
    }
  }
}
