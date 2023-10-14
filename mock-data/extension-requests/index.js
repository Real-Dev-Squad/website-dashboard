const extensionRequestsList = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      assignee: 'sunny',
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
      assignee: 'randhir',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'DENIED',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'A new title',
    },
  ],
  next: '/extension-requests&size=5&order=asc',
};

const extensionRequestsListPendingDescending = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      assignee: 'randhir',
      id: 'QISvF7kAmnD9vXHwwIs8',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691993520.03,
      title: 'A new title',
    },
    {
      assignee: 'randhir',
      id: 'QISvF7kAmnD9vXHwwIs7',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691907153.157,
      title: 'A new title',
    },
    {
      assignee: 'randhir',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'b',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691820785.341,
      title: 'A new title',
    },
    {
      assignee: 'sunny',
      id: 'lGQ3AjUlgNB6Jd8jXaEC',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691734400.045,
      title: 'A title',
    },
  ],
  next: '/extension-requests?order=desc&size=5&q=status%3APENDING',
};

const extensionRequestsListUserSearch = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      assignee: 'sunny',
      id: 'lGQ3AjUlgNB6Jd8jXaEC',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691734400.045,
      title: 'A title',
    },
  ],
};
const extensionRequestsListPending = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      assignee: 'sunny',
      id: 'lGQ3AjUlgNB6Jd8jXaEC',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'PENDING',
      requestNumber: 5,
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691734400.045,
      title: 'A title',
    },
    {
      assignee: 'randhir',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691820785.341,
      title: 'A new title',
    },
    {
      assignee: 'randhir',
      id: 'QISvF7kAmnD9vXHwwIs7',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691907153.157,
      title: 'A different title 1',
    },
    {
      assignee: 'randhir',
      id: 'QISvF7kAmnD9vXHwwIs8',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'PENDING',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1691993520.03,
      title: 'A different title 2',
    },
  ],
  next: '/extension-requests?order=asc&size=5&q=status%3APENDING',
};

const extensionRequestsListApproved = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      assignee: 'sunny',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'APPROVED',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'test title',
    },
    {
      assignee: 'randhir',
      id: 'QISvF7kAmnD9vXHwwIsG',
      newEndsOn: 1690528980,
      oldEndsOn: 1689954609.948,
      reason: 'test reason',
      status: 'APPROVED',
      taskId: 'PYj79ki2agB0q5JN3kUf',
      timestamp: 1689233034,
      title: 'test title',
    },
  ],
  next: '/extension-requests?q=status%3AAPPROVED&size=5&order=asc',
};

const extensionRequestResponse = {
  message: 'Extension request APPROVED successfully',
  extensionLog: {
    type: 'extensionRequests',
    meta: {
      taskId: '0eoEcgIQI3fm5z3kcOPm',
      username: 'ajeyak',
      userId: 'eChYAP0kUwLo4wQ1gqMV',
    },
    body: {
      status: 'APPROVED',
    },
    id: '6tqDEKck3JDYbMM6d4nz',
  },
};

module.exports = {
  extensionRequestsList,
  extensionRequestsListApproved,
  extensionRequestsListPending,
  extensionRequestResponse,
  extensionRequestsListPendingDescending,
  extensionRequestsListUserSearch,
};
