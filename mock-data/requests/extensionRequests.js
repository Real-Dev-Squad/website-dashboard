const pendingExtensionRequest = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      reason:
        "I wasn't able to fix the errors mostly due to their weird behaviour, but also because I wasn't able to give a lot of time to the task as I'm preparing for an upcoming interview. \nI did take Pallab's help, which gave me some new directions to explore, but haven't found anything concrete yet.",
      requestNumber: 5,
      newEndsOn: 1725321600,
      oldEndsOn: 1723507200,
      title: 'Extension Request',
      taskId: 'aWi9iHYZwq7ZzocqB8Fm',
      status: 'PENDING',
      id: 'ezyT2eQFn42fflFmGuwv',
      timestamp: 1722927106,
      assignee: 'sourav-mehra',
      assigneeId: 'rGb2y0PhImYdRNX4XrTB',
    },
  ],
  next: '',
};

const approvedExtensionRequest = {
  message: 'Extension Requests returned successfully!',
  allExtensionRequests: [
    {
      reason:
        'I was busy wrapping up final days of my college journey and also I am waiting for new designs for drop downs',
      newEndsOn: 1684591080,
      oldEndsOn: 1683849600,
      title: 'New Designs for dropdown',
      taskId: 'OAsbYBPje8XSOE7NMlig',
      status: 'APPROVED',
      id: 'rQXUZnhIYlQwCarLb2jt',
      timestamp: 1684245514,
      assignee: 'fakhruddinkw',
      assigneeId: 'yXQ15GVgFilj2otPgEpX',
    },
    {
      reason:
        'I am learning the Pre-requisites for Backend and I found an Issue while working https://github.com/Real-Dev-Squad/website-backend/issues/1159#issuecomment-1600869172',
      newEndsOn: 1687699740,
      oldEndsOn: 1687132800,
      title: 'Update task status to assigned on successful assignment',
      taskId: 'nPyNAwTtdijshRtSbyOj',
      status: 'APPROVED',
      id: 'jbpdFUUJklhz5m4N3RmY',
      timestamp: 1687355768,
      assignee: 'kotesh',
      assigneeId: 'WEY4h6ZCHAHO84fJ2OS3',
    },
    {
      reason: 'for api checking',
      newEndsOn: 1687867440,
      oldEndsOn: 1669939126.685,
      title: 'extension-request',
      taskId: 'y12uACixqne8nTOA3r2s',
      status: 'APPROVED',
      id: 'c65v2BUg5Nlbms4k3HOK',
      timestamp: 1687868244,
      assignee: 'vinit',
      assigneeId: 'EiSLciqWVhAg4AWw1T1N',
    },
    {
      reason:
        ' for this issue I will need an extension till 26th, I had underestimated the time required(will try and finish it before the 26th, keeping some buffer as i need to learn a few things, have discussed with Prakash regarding the requirements and approach, will need some more time in implementing and writing tests as I am new to this, also I will be ooo for a few days so will be keeping the buffer for that as well) will give better estimates next time onwards',
      newEndsOn: 1690367400,
      oldEndsOn: 1688774400,
      title: 'Feature to add data access layer in the backend',
      taskId: '8PgfwddhjMPlcJb5VTzj',
      status: 'APPROVED',
      id: 'fUuCJQQHRHniqXdm4YMy',
      timestamp: 1688121137,
      assignee: 'sriza',
      assigneeId: '7VLdqMZn8gFrB3HwfEhm',
    },
    {
      reason: 'Not been active due to work related reasons,',
      newEndsOn: 1689022980,
      oldEndsOn: 1687305600,
      title: 'RTK migration in status site',
      taskId: '6yeKQpIcx7INAkLCvZaf',
      status: 'APPROVED',
      id: '4wbcqdML1yATm8qRxlYe',
      timestamp: 1688144733,
      assignee: 'bhavika-tibrewal',
      assigneeId: 'sj9t9GBbJ0yvMtw4WXNd',
    },
  ],
  next: '/extension-requests?cursor=4wbcqdML1yATm8qRxlYe&order=asc&size=5&q=status%3AAPPROVED',
};

const requestActionResponse = {
  message: 'Request approved successfully',
  data: {
    id: 'ezyT2eQFn42fflFmGuwv',
    updatedAt: 1722927106,
    lastModifiedBy: 'rGb2y0PhImYdRNX4XrTB',
    taskId: 'aWi9iHYZwq7ZzocqB8Fm',
    title: 'Extension Request',
    oldEndsOn: 1723507200,
    newEndsOn: 1725321600,
    status: 'APPROVED',
  },
};

module.exports = {
  pendingExtensionRequest,
  approvedExtensionRequest,
  requestActionResponse,
};
