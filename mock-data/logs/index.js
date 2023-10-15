const extensionRequestLogs = {
  fuQs71a0Y7BX3n4rc5Ii: {
    message: 'Logs returned successfully!',
    logs: [
      {
        meta: {
          extensionRequestId: 'fuQs71a0Y7BX3n4rc5Ii',
          userId: 'XBucw7nHW1wOxdWrmLVa',
          taskId: '7gZ9E0XTQCEFvUynVqAw',
          name: 'Joy Gupta',
        },
        type: 'extensionRequests',
        body: { newEndsOn: 1697780640, oldEndsOn: 1697800440 },
        timestamp: { _seconds: 1697135779, _nanoseconds: 784000000 },
      },
      {
        meta: {
          extensionRequestId: 'fuQs71a0Y7BX3n4rc5Ii',
          userId: 'XBucw7nHW1wOxdWrmLVa',
          taskId: '7gZ9E0XTQCEFvUynVqAw',
          username: 'joygupta',
          name: 'Joy Gupta',
        },
        type: 'extensionRequests',
        body: { status: 'APPROVED' },
        timestamp: { _seconds: 1697042773, _nanoseconds: 461000000 },
      },
      {
        meta: {
          extensionRequestId: 'fuQs71a0Y7BX3n4rc5Ii',
          userId: 'XBucw7nHW1wOxdWrmLVa',
          taskId: '7gZ9E0XTQCEFvUynVqAw',
          name: 'Joy Gupta',
        },
        type: 'extensionRequests',
        body: { newEndsOn: 1697800440, oldEndsOn: 1697714040 },
        timestamp: { _seconds: 1697042756, _nanoseconds: 261000000 },
      },
      {
        meta: {
          extensionRequestId: 'fuQs71a0Y7BX3n4rc5Ii',
          userId: 'XBucw7nHW1wOxdWrmLVa',
          taskId: '7gZ9E0XTQCEFvUynVqAw',
          name: 'Joy Gupta',
        },
        type: 'extensionRequests',
        body: { newReason: 'ER 1 SU', oldReason: 'ER 1' },
        timestamp: { _seconds: 1697042745, _nanoseconds: 921000000 },
      },
      {
        meta: {
          extensionRequestId: 'fuQs71a0Y7BX3n4rc5Ii',
          userId: 'XBucw7nHW1wOxdWrmLVa',
          taskId: '7gZ9E0XTQCEFvUynVqAw',
          name: 'Joy Gupta',
        },
        type: 'extensionRequests',
        body: {
          newTitle: 'ER 1 Title SU',
          newEndsOn: 1697714040,
          oldTitle: 'ER 1 Title',
          oldEndsOn: 1697733840,
        },
        timestamp: { _seconds: 1697042732, _nanoseconds: 911000000 },
      },
    ],
  },
  lw7dRB0I3a6ivsFR5Izs: { message: 'Logs returned successfully!', logs: [] },
};
const extensionRequestLogsInSentence = {
  'log-container-fuQs71a0Y7BX3n4rc5Ii': [
    'Joy has created this extension request on Wed, 11/10/2023, 22:14:45.',
    'You changed the title from ER 1 Title to ER 1 Title SU.',
    'You changed the ETA from Thu, 19/10/2023, 22:14:00 to Thu, 19/10/2023, 16:44:00.',
    'You changed the reason from ER 1 to ER 1 SU.',
    'You changed the ETA from Thu, 19/10/2023, 16:44:00 to Fri, 20/10/2023, 16:44:00.',
    'You APPROVED this request 3 days ago.',
  ],
  'log-container-lw7dRB0I3a6ivsFR5Izs': [
    'JoyTest has created this extension request on Sun, 15/10/2023, 10:05:31.',
  ],
};
module.exports = {
  extensionRequestLogs,
  extensionRequestLogsInSentence,
};
