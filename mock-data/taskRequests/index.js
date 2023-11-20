const fetchedTaskRequests = [
  {
    id: '123CCXSDF123',
    url: `https://api.realdevsquad.com/taskRequests/123CCXSDF123`,
    taskId: 'TESTID123',
    status: 'WAITING',
    task: {
      percentCompleted: 0,
      isNoteworthy: true,
      purpose: 'Test purpose',
      assignee: false,
      title: 'Test title',
      type: 'feature',
      priority: 'HIGH',
      status: 'ASSIGNED',
    },
    users: [
      {
        proposedStartDate: 1700304616479,
        proposedDeadline: 1700909416479,
        userId: 'eChYAP0kUwLo4wQ1gqMV',
        status: 'PENDING',
        username: 'ajeyak',
        first_name: 'Test first_name',
      },
    ],
  },
];

const individualTaskReqDetail = {
  message: 'Task request returned successfully',
  data: {
    createdAt: 1698837978463,
    lastModifiedAt: 1698837978463,
    requestType: 'ASSIGNMENT',
    createdBy: 'randhir',
    lastModifiedBy: 'randhir',
    taskTitle: 'sample golang task s402',
    externalIssueUrl:
      'https://api.github.com/repos/Real-Dev-Squad/website-backend/issues/1310',
    taskId: '44SwDPe1r6AgoOtWq8EN',
    users: [
      {
        proposedStartDate: 1698684354000,
        proposedDeadline: 1699142400000,
        description: 'code change 3 days , testing - 2 days. total - 5 days',
        userId: 'SooJK37gzjIZfFNH0tlL',
        status: 'PENDING',
      },
    ],
    status: 'PENDING',
    id: 'dM5wwD9QsiTzi7eG7Oq5',
    url: 'http://localhost:3000/taskRequests/dM5wwD9QsiTzi7eG7Oq5',
  },
};

const individualTaskDetail = {
  message: 'task returned successfully',
  taskData: {
    percentCompleted: 100,
    createdBy: 'randhir',
    assignee: 'randhir',
    type: 'feature',
    priority: 'HIGH',
    title: 'sample golang task',
    endsOn: 1699142.4,
    startedOn: 1698684.354,
    status: 'ASSIGNED',
    assigneeId: 'SooJK37gzjIZfFNH0tlL',
    dependsOn: [],
  },
};

const userInformation = {
  message: 'User returned successfully!',
  user: {
    id: 'SooJK37gzjIZfFNH0tlL',
    profileURL: 'https://rahul-goyal-profile-service.herokuapp.com/',
    incompleteUserDetails: false,
    profileStatus: 'VERIFIED',
    last_name: 'singh',
    picture: {
      publicId: 'profile/DtR9sK7CysOVHP17zl8N/bbtkpea622crqotnhsa3',
      url: 'https://res.cloudinary.com/realdevsquad/image/upload/v1673312957/profile/DtR9sK7CysOVHP17zl8N/bbtkpea622crqotnhsa3.jpg',
    },
    github_display_name: 'Randhir Kumar Singh',
    github_id: 'heyrandhir',
    company: 'cg',
    designation: 'consultant',
    status: 'active',
    username: 'randhir',
    first_name: 'randhir',
    tokens: {
      githubAccessToken: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    },
    roles: {
      super_user: true,
      archived: false,
      in_discord: true,
    },
    github_created_at: 1641642287000,
    updated_at: 1698684157040,
    created_at: 1698684157040,
  },
};

const defaultMockResponseHeaders = {
  status: 200,
  contentType: 'application/json',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
};

const urlMappings = {
  'https://api.realdevsquad.com/taskRequests/dM5wwD9QsiTzi7eG7Oq5':
    individualTaskReqDetail,
  'https://staging-api.realdevsquad.com/taskRequests/dM5wwD9QsiTzi7eG7Oq5':
    individualTaskReqDetail,
  'https://api.realdevsquad.com/tasks/44SwDPe1r6AgoOtWq8EN/details':
    individualTaskDetail,
  'https://staging-api.realdevsquad.com/tasks/44SwDPe1r6AgoOtWq8EN/details':
    individualTaskDetail,
  'https://api.realdevsquad.com/users/userId/SooJK37gzjIZfFNH0tlL':
    userInformation,
  'https://staging-api.realdevsquad.com/users/userId/SooJK37gzjIZfFNH0tlL':
    userInformation,
  'https://staging-api.realdevsquad.com/taskRequests?action=approve':
    fetchedTaskRequests,
  'https://api.realdevsquad.com/taskRequests?action=approve':
    fetchedTaskRequests,
  'https://staging-api.realdevsquad.com/taskRequests?action=reject':
    fetchedTaskRequests,
  'https://api.realdevsquad.com/taskRequests?action=reject':
    fetchedTaskRequests,
};

module.exports = {
  fetchedTaskRequests,
  defaultMockResponseHeaders,
  urlMappings,
};
