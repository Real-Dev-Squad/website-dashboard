const pendingRequest = {
  message: 'Request fetched successfully',
  data: [
    {
      id: 'Wl4TTbpSrQDIjs6KLJwD',
      createdAt: 1711439903761,
      requestedBy: 'V4rqL1aDecNGoa1IxiCu',
      from: 1712275200000,
      until: 1712448000000,
      type: 'OOO',
      message: 'request message',
      lastModifiedBy: 'V4rqL1aDecNGoa1IxiCu',
      state: 'PENDING',
      updatedAt: 1711482912686,
    },
  ],
  next: null,
  prev: null,
};

const approvedRequest = {
  message: 'Request fetched successfully',
  data: [
    {
      id: 'Wl4TTbpSrQDIjs6KLJwD',
      createdAt: 1711439903761,
      requestedBy: 'V4rqL1aDecNGoa1IxiCu',
      from: 1712275200000,
      until: 1712448000000,
      type: 'OOO',
      message: 'request message',
      lastModifiedBy: 'V4rqL1aDecNGoa1IxiCu',
      state: 'APPROVED',
      updatedAt: 1711482912686,
    },
  ],
  next: null,
  prev: null,
};

const requestActionResponse = {
  message: 'Request approved successfully',
  data: {
    id: 'Wl4TTbpSrQDIjs6KLJwD',
    updatedAt: 1711490085808,
    lastModifiedBy: 'V4rqL1aDecNGoa1IxiCu',
    type: 'OOO',
    state: 'APPROVED',
  },
};

const extensionRequest = {
  message: 'Request fetched successfully',
  data: [
    {
      id: 'TlIWPP8WPcIebsVvwzxa',
      createdAt: 1714946917634,
      requestedBy: 'iODXB6ns8jaZB9p0XlBw',
      requestNumber: 1,
      newEndsOn: 1709674980000,
      oldEndsOn: 1703911191.083,
      assignee: 'sunny',
      type: 'EXTENSION',
      title: 'Extension Request',
      message: 'request message',
      taskId: 'YofR3z5fxudqrM55iXRI',
      lastModifiedBy: 'V4rqL1aDecNGoa1IxiCu',
      state: 'APPROVED',
      updatedAt: 1715602207156,
    },
  ],
  next: null,
  prev: null,
};

module.exports = {
  pendingRequest,
  approvedRequest,
  requestActionResponse,
  extensionRequest,
};
