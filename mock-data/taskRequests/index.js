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
    requestors: [
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

const individualTaskReqDetailWithMarkDownInDescription = {
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
        description: '### Heading',
        markdownEnabled: true,
        userId: 'SooJK37gzjIZfFNH0tlL',
        status: 'PENDING',
      },
    ],
    status: 'PENDING',
    id: 'dM5wwD9QsiTzi7eG7Oq6',
    url: 'http://localhost:3000/taskRequests/dM5wwD9QsiTzi7eG7Oq6',
  },
};

const taskDetailCreation = {
  message: 'Task request returned successfully',
  data: {
    createdAt: 1698090070313,
    lastModifiedAt: 1698090070313,
    requestType: 'CREATION',
    createdBy: 'ajeyak',
    requestors: ['eChYAP0kUwLo4wQ1gqMV'],
    lastModifiedBy: 'ajeyak',
    taskTitle: 'Fix: user data is not showing up in memberSkillsUpdateModal',
    externalIssueUrl:
      'https://api.github.com/repos/Real-Dev-Squad/members-site/issues/92',
    users: [
      {
        proposedStartDate: 1698089500541,
        proposedDeadline: 1698089500541,
        description: ' ',
        userId: 'eChYAP0kUwLo4wQ1gqMV',
        status: 'PENDING',
      },
    ],
    status: 'PENDING',
    usersCount: 1,
    id: 'uC0IUpkFMx393XjnKx4w',
    url: 'https://realdevsquad.com/taskRequests/uC0IUpkFMx393XjnKx4w',
  },
};

const githubIssue = {
  url: 'https://api.github.com/repos/Real-Dev-Squad/members-site/issues/92',
  repository_url: 'https://api.github.com/repos/Real-Dev-Squad/members-site',
  labels_url:
    'https://api.github.com/repos/Real-Dev-Squad/members-site/issues/92/labels{/name}',
  comments_url:
    'https://api.github.com/repos/Real-Dev-Squad/members-site/issues/92/comments',
  events_url:
    'https://api.github.com/repos/Real-Dev-Squad/members-site/issues/92/events',
  html_url: 'https://github.com/Real-Dev-Squad/members-site/issues/92',
  id: 1883898994,
  node_id: 'I_kwDOIe8XEs5wSgRy',
  number: 92,
  title: 'Fix: user data is not showing up in memberSkillsUpdateModal',
  user: {
    login: 'anishpawaskar',
    id: 22213872,
    node_id: 'MDQ6VXNlcjIyMjEzODcy',
    avatar_url: 'https://avatars.githubusercontent.com/u/22213872?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/anishpawaskar',
    html_url: 'https://github.com/anishpawaskar',
    followers_url: 'https://api.github.com/users/anishpawaskar/followers',
    following_url:
      'https://api.github.com/users/anishpawaskar/following{/other_user}',
    gists_url: 'https://api.github.com/users/anishpawaskar/gists{/gist_id}',
    starred_url:
      'https://api.github.com/users/anishpawaskar/starred{/owner}{/repo}',
    subscriptions_url:
      'https://api.github.com/users/anishpawaskar/subscriptions',
    organizations_url: 'https://api.github.com/users/anishpawaskar/orgs',
    repos_url: 'https://api.github.com/users/anishpawaskar/repos',
    events_url: 'https://api.github.com/users/anishpawaskar/events{/privacy}',
    received_events_url:
      'https://api.github.com/users/anishpawaskar/received_events',
    type: 'User',
    site_admin: false,
  },
  labels: [],
  state: 'closed',
  locked: false,
  assignee: {
    login: 'anishpawaskar',
    id: 22213872,
    node_id: 'MDQ6VXNlcjIyMjEzODcy',
    avatar_url: 'https://avatars.githubusercontent.com/u/22213872?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/anishpawaskar',
    html_url: 'https://github.com/anishpawaskar',
    followers_url: 'https://api.github.com/users/anishpawaskar/followers',
    following_url:
      'https://api.github.com/users/anishpawaskar/following{/other_user}',
    gists_url: 'https://api.github.com/users/anishpawaskar/gists{/gist_id}',
    starred_url:
      'https://api.github.com/users/anishpawaskar/starred{/owner}{/repo}',
    subscriptions_url:
      'https://api.github.com/users/anishpawaskar/subscriptions',
    organizations_url: 'https://api.github.com/users/anishpawaskar/orgs',
    repos_url: 'https://api.github.com/users/anishpawaskar/repos',
    events_url: 'https://api.github.com/users/anishpawaskar/events{/privacy}',
    received_events_url:
      'https://api.github.com/users/anishpawaskar/received_events',
    type: 'User',
    site_admin: false,
  },
  assignees: [
    {
      login: 'anishpawaskar',
      id: 22213872,
      node_id: 'MDQ6VXNlcjIyMjEzODcy',
      avatar_url: 'https://avatars.githubusercontent.com/u/22213872?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/anishpawaskar',
      html_url: 'https://github.com/anishpawaskar',
      followers_url: 'https://api.github.com/users/anishpawaskar/followers',
      following_url:
        'https://api.github.com/users/anishpawaskar/following{/other_user}',
      gists_url: 'https://api.github.com/users/anishpawaskar/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/anishpawaskar/starred{/owner}{/repo}',
      subscriptions_url:
        'https://api.github.com/users/anishpawaskar/subscriptions',
      organizations_url: 'https://api.github.com/users/anishpawaskar/orgs',
      repos_url: 'https://api.github.com/users/anishpawaskar/repos',
      events_url: 'https://api.github.com/users/anishpawaskar/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/anishpawaskar/received_events',
      type: 'User',
      site_admin: false,
    },
  ],
  milestone: null,
  comments: 0,
  created_at: '2023-09-06T12:21:37Z',
  updated_at: '2023-11-08T19:02:33Z',
  closed_at: '2023-11-08T19:02:33Z',
  author_association: 'CONTRIBUTOR',
  active_lock_reason: null,
  body: "- When super_user try to update skills of new users the data of user is not being passed that's why in memberSkillsUpdateModal it is showing undefined and undefined instead of showing firstname and lastname of user.\r\n\r\n![Real Dev Squad - Google Chrome 06-09-2023 17_47_05](https://github.com/Real-Dev-Squad/members-site/assets/22213872/2f89448e-94e4-4290-8ba3-45bc147f31cc)\r\n",
  closed_by: {
    login: 'anishpawaskar',
    id: 22213872,
    node_id: 'MDQ6VXNlcjIyMjEzODcy',
    avatar_url: 'https://avatars.githubusercontent.com/u/22213872?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/anishpawaskar',
    html_url: 'https://github.com/anishpawaskar',
    followers_url: 'https://api.github.com/users/anishpawaskar/followers',
    following_url:
      'https://api.github.com/users/anishpawaskar/following{/other_user}',
    gists_url: 'https://api.github.com/users/anishpawaskar/gists{/gist_id}',
    starred_url:
      'https://api.github.com/users/anishpawaskar/starred{/owner}{/repo}',
    subscriptions_url:
      'https://api.github.com/users/anishpawaskar/subscriptions',
    organizations_url: 'https://api.github.com/users/anishpawaskar/orgs',
    repos_url: 'https://api.github.com/users/anishpawaskar/repos',
    events_url: 'https://api.github.com/users/anishpawaskar/events{/privacy}',
    received_events_url:
      'https://api.github.com/users/anishpawaskar/received_events',
    type: 'User',
    site_admin: false,
  },
  reactions: {
    url: 'https://api.github.com/repos/Real-Dev-Squad/members-site/issues/92/reactions',
    total_count: 0,
    '+1': 0,
    '-1': 0,
    laugh: 0,
    hooray: 0,
    confused: 0,
    heart: 0,
    rocket: 0,
    eyes: 0,
  },
  timeline_url:
    'https://api.github.com/repos/Real-Dev-Squad/members-site/issues/92/timeline',
  performed_via_github_app: null,
  state_reason: 'completed',
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
const userInformationTaskCreation = {
  message: 'User returned successfully!',
  user: {
    id: 'eChYAP0kUwLo4wQ1gqMV',
    incompleteUserDetails: false,
    website: 'www.',
    discordId: '1095941231403597854',
    last_name: 'asdfasdfsd',
    linkedin_id: 'afds',
    created_at: 1697215478406,
    yoe: 100,
    instagram_id: 'sdaf',
    github_created_at: 1694358348000,
    github_display_name: null,
    github_id: 'Aryex82',
    company: 'Rebel base',
    designation: 'adsf',
    twitter_id: 'ajeya900',
    first_name: 'ajeya',
    username: 'ajeyak',
    updated_at: 1701555788092,
    roles: {
      archived: false,
      in_discord: true,
      member: false,
      super_user: true,
    },
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
const superUserData = {
  id: 'V4rqL1aDecNGoa1IxiCu',
  incompleteUserDetails: false,
  discordId: '12345',
  roles: {
    archived: false,
    super_user: true,
  },
  linkedin_id: 'kotesh',
  last_name: 'Mudila',
  yoe: '5',
  github_display_name: 'kotesh Mudila',
  company_name: 'Juniper networks ',
  github_id: 'kotesh-arya',
  designation: 'Front end engineer',
  twitter_id: 'Codesh_',
  first_name: 'Kotesh',
  username: 'kotesh',
  picture: {
    publicId: 'profile/w2XR9Gkid6Kg5xCJ5Elm/rzh3cwff7hh7srvg63mb',
    url: 'https://res.cloudinary.com/realdevsquad/image/upload/v1692990078/profile/w2XR9Gkid6Kg5xCJ5Elm/rzh3cwff7hh7srvg63mb.png',
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
  'https://staging-api.realdevsquad.com/users/self': superUserData,
  'https://api.realdevsquad.com/taskRequests/dM5wwD9QsiTzi7eG7Oq5':
    individualTaskReqDetail,
  'https://api.realdevsquad.com/taskRequests/dM5wwD9QsiTzi7eG7Oq6':
    individualTaskReqDetailWithMarkDownInDescription,
  'https://staging-api.realdevsquad.com/taskRequests/dM5wwD9QsiTzi7eG7Oq5':
    individualTaskReqDetail,
  'https://staging-api.realdevsquad.com/taskRequests/dM5wwD9QsiTzi7eG7Oq6':
    individualTaskReqDetailWithMarkDownInDescription,
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
  'https://staging-api.realdevsquad.com/users/userId/eChYAP0kUwLo4wQ1gqMV':
    userInformationTaskCreation,
  'https://staging-api.realdevsquad.com/taskRequests/uC0IUpkFMx393XjnKx4w':
    taskDetailCreation,
  'https://api.github.com/repos/Real-Dev-Squad/members-site/issues/92':
    githubIssue,
};

module.exports = {
  fetchedTaskRequests,
  defaultMockResponseHeaders,
  urlMappings,
};
