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
      message: 'Testing purpose',
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
      message: 'Testing purpose',
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

module.exports = { pendingRequest, approvedRequest, requestActionResponse };
