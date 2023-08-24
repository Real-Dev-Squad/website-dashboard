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
    requestors: [
      {
        userExists: true,
        user: {
          id: 'V4rqL1aDecNGoa1IxiCu',
          incompleteUserDetails: false,
          discordId: '12345',
          roles: {
            archived: false,
          },
          linkedin_id: 'uiram',
          last_name: 'Raghunathan',
          yoe: '5',
          github_display_name: 'Sriram',
          company_name: 'Juniper networks ',
          github_id: '19sriram',
          designation: 'Front end engineer',
          twitter_id: '19sriram',
          first_name: 'Sriram',
          username: '19sriram',
        },
      },
    ],
  },
];

module.exports = {
  fetchedTaskRequests,
};
