const taskDone = {
  message: 'task returned successfully',
  taskData: {
    percentCompleted: 80,
    endsOn: 1692149100,
    isNoteworthy: false,
    createdBy: 'ajeyak',
    lossRate: {
      dinero: 100,
      neelam: 0,
    },
    assignee: 'ajeyak',
    title: 'A Task',
    type: 'feature',
    priority: 'HIGH',
    completionAward: {
      dinero: 1000,
      neelam: 0,
    },
    startedOn: 1690429785.762,
    status: 'DONE',
    assigneeId: 'eChYAP0kUwLo4wQ1gqMV',
    dependsOn: [],
  },
};

const taskVerified = {
  message: 'task returned successfully',
  taskData: {
    percentCompleted: 70,
    endsOn: 1690528980,
    isNoteworthy: false,
    createdBy: 'ajeyak',
    lossRate: {
      dinero: 100,
      neelam: 0,
    },
    assignee: 'ajeyak',
    title: 'Testing task - 2',
    type: 'feature',
    priority: 'MEDIUM',
    completionAward: {
      dinero: 1000,
      neelam: 0,
    },
    startedOn: 1688745009.949,
    status: 'VERIFIED',
    assigneeId: 'eChYAP0kUwLo4wQ1gqMV',
    dependsOn: [],
  },
};

const auditLogTasks = {
  '7gZ9E0XTQCEFvUynVqAw': {
    message: 'task returned successfully',
    taskData: {
      percentCompleted: 20,
      endsOn: 1697800440,
      isNoteworthy: false,
      createdBy: 'joygupta',
      lossRate: { dinero: 100, neelam: 0 },
      assignee: 'joygupta',
      title: 'First Task',
      type: 'feature',
      priority: 'HIGH',
      completionAward: { dinero: 1000, neelam: 0 },
      startedOn: 1695452396.039,
      status: 'IN_PROGRESS',
      assigneeId: 'XBucw7nHW1wOxdWrmLVa',
      dependsOn: [],
    },
  },
  mZB0akqPUa1GQQdrgsx7: {
    message: 'task returned successfully',
    taskData: {
      percentCompleted: 0,
      endsOn: 1697480760,
      isNoteworthy: false,
      createdBy: 'joygupta',
      lossRate: { dinero: 100, neelam: 0 },
      assignee: 'testunity',
      title: 'Task for new user',
      type: 'feature',
      priority: 'HIGH',
      completionAward: { dinero: 1000, neelam: 0 },
      startedOn: 1695831976.165,
      status: 'ASSIGNED',
      assigneeId: 'Hgbb5mFvy0nHaKCTPVcP',
      dependsOn: [],
    },
  },
};

const taskCompleted = {
  message: 'task returned successfully',
  taskData: {
    percentCompleted: 100,
    endsOn: 1692149100,
    isNoteworthy: false,
    createdBy: 'ajeyak',
    lossRate: {
      dinero: 100,
      neelam: 0,
    },
    assignee: 'ajeyak',
    title: 'A Task',
    type: 'feature',
    priority: 'HIGH',
    completionAward: {
      dinero: 1000,
      neelam: 0,
    },
    startedOn: 1690429785.762,
    status: 'COMPLETED',
    assigneeId: 'eChYAP0kUwLo4wQ1gqMV',
    dependsOn: [],
  },
};

module.exports = {
  taskDone,
  taskVerified,
  auditLogTasks,
  taskCompleted,
};
