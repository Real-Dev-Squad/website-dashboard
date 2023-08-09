const extensionRequestsList = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      assignee: 'abc',
      id: 'lGQ3AjUlgNB6Jd8jXaEC',
      newEndsOn: 1692149100,
      oldEndsOn: 1691639385.762,
      reason: 'a reason, a very good one',
      status: 'PENDING',
      taskId: 'GCYGDiU0lw4fwc3qljSY',
      timestamp: 1690429937,
      title: 'A title',
    },
    {
      assignee: 'someone',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'j',
    },
    {
      assignee: 'someone 2',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'DENIED',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'j',
    },
  ],
};

const extensionRequestsListPending = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      assignee: 'someone',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'j',
    },
    {
      assignee: 'someone 2',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'j',
    },
  ],
};

const extensionRequestsListApproved = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      assignee: 'someone',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'APPROVED',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'j',
    },
    {
      assignee: 'someone 2',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'APPROVED',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'j',
    },
  ],
};
module.exports = {
  extensionRequestsList,
  extensionRequestsListApproved,
  extensionRequestsListPending,
};
