const photoVerificationRequestsListPending = {
  message: 'User image verification record fetched successfully!',
  data: [
    {
      id: 'BEtG17kv0H27lWOGwTZX',
      discordId: '238947756238758',
      userId: '8o7f87h3u4h98fh9843hf834',
      discord: {
        date: {
          _seconds: 1712788779,
          _nanoseconds: 192000000,
        },
        url: 'https://cdn.discordapp.com/avatars/238947756238758/b0a2691fd3e05c28858f435f11f02e41.png',
        approved: false,
      },
      profile: {
        date: {
          _seconds: 1712788779,
          _nanoseconds: 192000000,
        },
        url: 'https://res.cloudinary.com/profile/8o7f87h3u4h98fh9843hf834/umgnk8o7ujrzbmybnwzf.jpg',
        publicId: 'profile/8o7f87h3u4h98fh9843hf834/umgnk8o7ujrzbmybnwzf',
        approved: false,
      },
      status: 'PENDING',
      user: {
        username: 'vinayak-g',
        picture:
          'https://res.cloudinary.com/profile/8o7f87h3u4h98fh9843hf834/umgnk8o7ujrzbmybnwzf.jpg',
      },
    },
    {
      id: 'X1Kua1HeUqtlX5Z6xwSq',
      discordId: '238947756238758',
      userId: '8o7f87h3u4h98fh9843hf834',
      status: 'PENDING',
      discord: {
        date: {
          _seconds: 1712835230,
          _nanoseconds: 7000000,
        },
        approved: false,
        url: 'https://cdn.discordapp.com/avatars/238947756238758/b0a2691fd3e05c28858f435f11f02e41.png',
      },
      profile: {
        date: {
          _seconds: 1712835230,
          _nanoseconds: 7000000,
        },
        approved: false,
      },
      user: {
        username: 'vinayak-g',
        picture:
          'https://res.cloudinary.com/profile/8o7f87h3u4h98fh9843hf834/umgnk8o7ujrzbmybnwzf.jpg',
      },
    },
  ],
};

const photoVerificationRequestsListUserSearch = {
  message: 'User image verification record fetched successfully!',
  data: [
    {
      discordId: '238947756238758',
      userId: '8o7f87h3u4h98fh9843hf834',
      discord: {
        date: {
          _seconds: 1712788779,
          _nanoseconds: 192000000,
        },
        url: 'https://cdn.discordapp.com/avatars/238947756238758/b0a2691fd3e05c28858f435f11f02e41.png',
        approved: true,
      },
      profile: {
        date: {
          _seconds: 1712788779,
          _nanoseconds: 192000000,
        },
        url: 'https://res.cloudinary.com/profile/8o7f87h3u4h98fh9843hf834/umgnk8o7ujrzbmybnwzf.jpg',
        publicId: 'profile/8o7f87h3u4h98fh9843hf834/umgnk8o7ujrzbmybnwzf',
        approved: false,
      },
      status: 'PENDING',
      user: {
        username: 'vinayak-g',
        picture:
          'https://res.cloudinary.com/profile/8o7f87h3u4h98fh9843hf834/umgnk8o7ujrzbmybnwzf.jpg',
      },
    },
  ],
};

const photoVerificationRequestApprovedResponse = {
  message: 'User image data verified successfully',
};

const photoVerificationRequestRejectedResponse = {
  message: 'User photo verification request rejected successfully',
};

const photoVerificationRequestDiscordUpdateResponse = {
  message: 'Discord avatar URL updated successfully!',
  discordAvatarUrl:
    'https://cdn.discordapp.com/avatars/238947756238758/b0a2691fd3e05c28858f435f11f02e41_new.png',
};

module.exports = {
  photoVerificationRequestApprovedResponse,
  photoVerificationRequestRejectedResponse,
  photoVerificationRequestsListPending,
  photoVerificationRequestsListUserSearch,
  photoVerificationRequestDiscordUpdateResponse,
};
