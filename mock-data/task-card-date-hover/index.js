const userDetailsApi = {
  message: 'Tasks returned successfully!',
  tasks: [
    {
      id: 'BMc4Bgy7FD7BOEa0NZzP',
      percentCompleted: 100,
      endsOn: 1690437548, //27th july 2023
      github: {
        issue: { id: 1806764661, assignee: 'sahsisunny', status: 'open' },
      },
      createdBy: 'ankush',
      assignee: 'sunny-s',
      title: 'Sync Discord User to RDS backend ',
      type: 'feature',
      priority: 'TBD',
      startedOn: 1689553319.9,
      status: 'COMPLETED',
      assigneeId: 'jbGcfZLGYjHwxQ1Zh8ZJ',
    },
    {
      id: 'CyGNTPGoA7Cgi3bbb3Mt',
      percentCompleted: 100,
      endsOn: 1694232000, // Sept 09 2023
      isNoteworthy: true,
      createdBy: 'ankush',
      lossRate: { dinero: 200, neelam: 0 },
      assignee: 'sunny-s',
      title: 'Collapse non-interesting tasks or PRs in member details page',
      type: 'feature',
      priority: 'MEDIUM',
      completionAward: { dinero: 3000, neelam: 0 },
      startedOn: 1680397446.1,
      status: 'VERIFIED',
      assigneeId: 'jbGcfZLGYjHwxQ1Zh8ZJ',
    },
    {
      id: 'F2A6XVGgM3IshzEd5niL',
      percentCompleted: 100,
      endsOn: 1688445662, //Jul 4 2023
      isNoteworthy: false,
      createdBy: 'ankush',
      lossRate: { dinero: 100, neelam: 0 },
      assignee: 'sunny-s',
      title: 'Status site should use cloudinary images',
      type: 'feature',
      priority: 'HIGH',
      completionAward: { dinero: 1000, neelam: 0 },
      startedOn: 1680398131.277,
      status: 'VERIFIED',
      assigneeId: 'jbGcfZLGYjHwxQ1Zh8ZJ',
    },
  ],
};

module.exports = { userDetailsApi };
