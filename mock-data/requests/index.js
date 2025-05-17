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
      reason: 'need some time for job',
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
  data: {
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
};

const approvedRequestsData = {
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

    {
      id: 'Wl4TTbpSrQDIjs6KLJwD',
      createdAt: 1711439903661,
      requestedBy: 'V4rqL1aDecNGoa1IxiCu',
      from: 1712275206600,
      until: 1712448000000,
      type: 'OOO',
      message: 'request message for OOO',
      lastModifiedBy: 'V4rqL1aDecNGoa1IxiCu',
      state: 'APPROVED',
      updatedAt: 1711482912686,
    },
  ],
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

const onboardingExtensionRequest = {
  message: 'Request fetched successfully',
  data: [
    {
      id: 'Jne4XfI8lm5QTCfcHQyJ',
      createdAt: 1737140162577,
      type: 'ONBOARDING',
      state: 'APPROVED',
      userId: 'V4rqL1aDecNGoa1IxiCu',
      requestedBy: 'kotesh',
      oldEndsOn: 1731827984919,
      requestNumber: 1,
      reason: 'request reason',
      lastModifiedBy: 'V4rqL1aDecNGoa1IxiCu',
      newEndsOn: 1740756889491,
      updatedAt: 1738688705368,
      message: 'approved',
    },
    {
      id: 'Jne4XfI8lm5QTCfcHQyJ',
      createdAt: 1737140162577,
      type: 'ONBOARDING',
      state: 'PENDING',
      userId: 'V4rqL1aDecNGoa1IxiCu',
      requestedBy: 'kotesh',
      oldEndsOn: 1731827984919,
      requestNumber: 1,
      reason: 'request reason',
      newEndsOn: 1740756889491,
      updatedAt: 1738688705368,
    },
  ],
  next: null,
  prev: null,
};

module.exports = {
  pendingRequest,
  approvedRequest,
  approvedRequestsData,
  requestActionResponse,
  extensionRequest,
  onboardingExtensionRequest,
};
