const mockUserData = {
  message: 'Users found successfully!',
  users: [
    {
      id: 'aaL1MXrpmnUNfLkhgXRj',
      github_created_at: 1595870020000,
      github_display_name: 'Shubham Sharma',
      github_id: 'skv93-coder',
      incompleteUserDetails: false,
      discordId: '1005550883062415400',
      last_name: 'Sharma',
      linkedin_id:
        'https://www.linkedin.com/authwall?trk=bf&trkInfo=AQHYMsRP3tc0OAAAAYoNZX6wuATNqBsHaNmcvvyvI7xW6_p1BWwaPmUuzm_BCNN9-yOKsgGnYm0D8lgJIw3wn_5LghX6G6_oytuczTfM5P6SsJRZy7LFYiEoIs8YPP8Bx5IkPls=&original_referer=&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fshubham-sharma-165600206',
      company: 'Igzy',
      designation: 'Junior engineer',
      twitter_id: 'ShubhamSha11638',
      first_name: 'Shubham',
      username: 'shubham-sharma',
      created_at: 1705233567138,
      github_user_id: '68867418',
      updated_at: 1707409606780,
      roles: {
        member: false,
        in_discord: true,
        archived: false,
        super_user: true,
      },
    },
  ],
  links: {
    next: '/search?1=10&state=ACTIVE,OOO,IDLE,ONBOARDING,ONBOARDING&time=31d&size=10&dev=true',
    prev: null,
  },
  count: 39,
};

const superUserDetails = {
  message: 'User returned successfully!',
  user: {
    id: 'XAF7rSUvk4p0d098qWYS',
    profileURL: 'https://my.realdevsquad.com/identity',
    discordJoinedAt: '2020-02-01T08:33:38.278000+00:00',
    roles: {
      archived: false,
      in_discord: true,
      member: true,
      super_user: true,
      admin: true,
    },
    created_at: 1693166951852,
    yoe: '8',
    github_created_at: 1341655281000,
    updated_at: 1693224375990,
    company: 'Amazon',
    twitter_id: 'ankushdharkar',
    first_name: 'Ankush',
    ' instagram_id': 'ankushdharkar',
    website: 'NA',
    incompleteUserDetails: false,
    discordId: '154585730465660929',
    linkedin_id: 'ankushdharkar',
    last_name: 'Dharkar',
    picture: {
      publicId: 'profile/XAF7rSUvk4p0d098qWYS/me40uk7taytbjaa67mhe',
      url: 'https://res.cloudinary.com/realdevsquad/image/upload/v1692058952/profile/XAF7rSUvk4p0d098qWYS/me40uk7taytbjaa67mhe.jpg',
    },
    github_display_name: 'Ankush Dharkar',
    company_name: 'Amazon',
    github_id: 'ankushdharkar',
    designation: 'SDE',
    status: 'idle',
    username: 'ankush',
  },
};

module.exports = { mockUserData, superUserDetails };
