/* Podbean — seeded demo data (persisted to localStorage by app.js) */
(function () {
  const DAY = 86400000;

  function isoAt(daysOffset, hour, minute) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hour == null ? 10 : hour, minute == null ? 0 : minute, 0, 0);
    return d.toISOString();
  }

  const EARNING_TITLES = [
    'Live Interview with Nadia Cole on Building a Career in Audio',
    'Talking Craft and Creative Process with Independent Producers',
    'How This Audio Story Got Made, from First Tape to Final Mix',
    'Live Q&A with Audio Creators on Making a Living from Sound',
    'In Conversation with a Sound Designer About the Art of the Edit',
    'Stories from Behind the Mic with the People Who Make Audio',
    'A Slow Sunday Conversation with a Producer About Creative Habits',
    'Long-Form Talks on Sound, Craft and the Business of Audio',
    'Live from the Studio with the Team Behind the Show',
    'Making Better Audio Through Better Interviews'
  ];

  const FAN_NAMES = ['Danielle Rossi', 'Marcus Lee', 'Priya Shah', 'Leo Martins', 'Sofia Alvarez', 'Noah Bennett', 'Ava Thompson', 'Ethan Cole', 'Maya Chen', 'Kai Walker'];

  const EARNING_POINTS = [1980, 1650, 1290, 2400, 980, 3200, 1450, 2100];

  function buildEarnings() {
    const rows = [];
    for (let i = 0; i < 32; i++) {
      rows.push({
        id: 'earn-' + (i + 1),
        showTitle: EARNING_TITLES[i % EARNING_TITLES.length],
        date: isoAt(-(i * 2 + 2), 10, 30),
        podPoints: EARNING_POINTS[i % EARNING_POINTS.length],
        giftUsers: 3 + (i % 9),
        giftCount: 3 + (i % 9) + 2 + ((i * 5) % 11),
        topGifter: FAN_NAMES[i % FAN_NAMES.length]
      });
    }
    return rows;
  }

  function buildPayouts() {
    const statuses = ['Pending', 'Paid', 'Paid', 'Paid', 'Paid', 'Failed', 'Paid'];
    const pointsPattern = [2980, 3240, 2560, 3120, 2740, 1980, 3410, 2680, 2950, 3340, 2240, 3060, 2470, 2890, 3520, 2160, 3010, 2620, 3280, 2380];
    const rows = [];
    for (let i = 0; i < 20; i++) {
      const points = pointsPattern[i % pointsPattern.length];
      rows.push({
        id: 'payout-' + (i + 1),
        podPoints: points,
        amount: points / 100,
        status: statuses[i % statuses.length],
        date: isoAt(-(i * 10 + 5), 16, 30)
      });
    }
    return rows;
  }

  const TOP_SHOW_TITLES = [
    ['Live Interview with Nadia Cole on Building a Career in Audio', '2026-10-12T10:30:00'],
    ['Talking Craft and Creative Process with Independent Producers', '2026-10-08T19:00:00'],
    ['How This Audio Story Got Made, from First Tape to Final Mix', '2026-10-03T09:00:00'],
    ['Live Q&A with Audio Creators on Making a Living from Sound', '2026-09-29T21:00:00'],
    ['In Conversation with a Sound Designer About the Art of the Edit', '2026-09-24T18:30:00'],
    ['Stories from Behind the Mic with the People Who Make Audio', '2026-09-20T10:00:00'],
    ['A Slow Sunday Conversation with a Producer About Creative Habits', '2026-09-15T12:00:00'],
    ['Long-Form Talks on Sound, Craft and the Business of Audio', '2026-09-09T15:30:00'],
    ['Behind the Scenes of a Live Podcast Tour', '2026-09-03T14:00:00'],
    ['Audience Q&A: Growing a Loyal Listener Base', '2026-08-28T11:00:00']
  ];

  function buildTopShows() {
    return TOP_SHOW_TITLES.map(function (item, i) {
      return {
        id: 'top-' + (i + 1),
        title: item[0],
        date: item[1],
        listeners: [28, 34, 26, 41, 22, 37, 19, 31, 24, 38][i],
        hours: ['3h 30m', '2h 45m', '3h 10m', '4h 05m', '2h 20m', '3h 55m', '2h 05m', '2h 40m', '2h 50m', '3h 20m'][i],
        engagement: [1000, 860, 940, 1120, 720, 880, 610, 760, 690, 830][i],
        podPoints: [180, 150, 170, 220, 120, 160, 90, 130, 110, 140][i]
      };
    });
  }

  function buildTopFans() {
    const names = FAN_NAMES;
    const engagement = [1980, 1742, 1510, 1388, 1204, 1096, 940, 826, 720, 640];
    const points = [1980, 1680, 1490, 1310, 1180, 1020, 880, 790, 700, 620];
    return names.map(function (name, i) {
      return {
        name: name,
        engagement: engagement[i],
        points: points[i],
        change: ['+1.5%', '+2.1%', '+0.8%', '+1.2%', '-0.4%', '+0.6%', '+1.9%', '+0.3%', '+1.1%', '+0.5%'][i]
      };
    });
  }

  function buildGifts() {
    const gifts = [
      ['Clap', 1980, '+1.5%'],
      ['Mic Drop', 1650, '+2.2%'],
      ['Applause', 1290, '+0.9%'],
      ['Heart', 980, '+1.4%'],
      ['Fire', 760, '+0.5%'],
      ['Star', 640, '+1.1%'],
      ['Confetti', 520, '+0.7%'],
      ['Trophy', 380, '+0.4%'],
      ['Rocket', 320, '+0.3%'],
      ['Crown', 260, '+0.2%']
    ];
    return gifts.map(function (g, i) {
      return { id: 'gift-' + i, name: g[0], beans: g[1], change: g[2], count: 12 - i };
    });
  }

  const COMMENTS = [
    { name: 'Leo Martins', time: '08:42', text: 'So excited for this one — the last episode was gold.' },
    { name: 'Priya Shah', time: '08:47', text: 'Can you talk about warm-up routines before going live?' }
  ];

  function createDefaultData() {
    return {
      currentUser: { name: 'Danita', email: 'danita@podbean.com' },
      shows: [
        {
          id: 'show-groove',
          title: 'Live Interview with Nadia Cole on Building a Career in Audio',
          visibility: 'public',
          status: 'live',
          date: isoAt(0, 10, 0),
          podPoints: 6869,
          listeners: 156,
          hearts: 1856,
          category: 'Education',
          about: 'A weekly live interview series with the producers, editors and hosts shaping the sound of modern audio.'
        },
        {
          id: 'show-pulse',
          title: 'Talking Craft and Creative Process with Independent Producers',
          visibility: 'unlisted',
          status: 'finished',
          date: isoAt(-8, 19, 0),
          podPoints: 3420,
          listeners: 86,
          hearts: 1040,
          category: 'Music',
          about: 'An intimate studio interview about craft, creative process and building a body of audio work.'
        },
        {
          id: 'show-harmonic',
          title: 'How This Audio Story Got Made, from First Tape to Final Mix',
          visibility: 'unlisted',
          status: 'finished',
          date: isoAt(-20, 20, 0),
          podPoints: 6869,
          listeners: 156,
          hearts: 1856,
          category: 'Music',
          about: 'Live conversations with editors and sound designers about the decisions behind memorable audio.'
        },
        {
          id: 'show-expired',
          title: 'Live Q&A with Audio Creators on Making a Living from Sound',
          visibility: 'unlisted',
          status: 'expired',
          date: isoAt(-180, 20, 0),
          podPoints: null,
          listeners: null,
          hearts: null,
          category: 'Music',
          about: 'A relaxed live Q&A with creators from the audio community.'
        },
        {
          id: 'show-creators-mic',
          title: 'In Conversation with a Sound Designer About the Art of the Edit',
          visibility: 'public',
          status: 'scheduled',
          date: isoAt(5, 19, 0),
          podPoints: null,
          listeners: null,
          hearts: null,
          category: 'Education',
          about: 'Independent producers talk openly about ideas, setbacks and the realities of making audio.'
        },
        {
          id: 'show-after-hours',
          title: 'Stories from Behind the Mic with the People Who Make Audio',
          visibility: 'unlisted',
          status: 'finished',
          date: isoAt(-45, 21, 0),
          podPoints: 3120,
          listeners: 98,
          hearts: 940,
          category: 'Comedy',
          about: 'A weekly interview series about the craft and business of audio storytelling.'
        },
        {
          id: 'show-sunday-sessions',
          title: 'A Slow Sunday Conversation with a Producer About Creative Habits',
          visibility: 'public',
          status: 'scheduled',
          date: isoAt(12, 10, 0),
          podPoints: null,
          listeners: null,
          hearts: null,
          category: 'Arts',
          about: 'A slower Sunday conversation with audio makers about the ideas that stay with them.'
        },
        {
          id: 'show-deep-cuts',
          title: 'Long-Form Talks on Sound, Craft and the Business of Audio',
          visibility: 'public',
          status: 'finished',
          date: isoAt(-12, 18, 30),
          podPoints: 5210,
          listeners: 121,
          hearts: 1320,
          category: 'Music',
          about: 'Long-form interviews that go beyond the headline and into the craft.'
        },
        {
          id: 'show-interview-room',
          title: 'Live from the Studio with the Team Behind the Show',
          visibility: 'unlisted',
          status: 'finished',
          date: isoAt(-30, 12, 0),
          podPoints: 2180,
          listeners: 72,
          hearts: 610,
          category: 'Education',
          about: 'Live, unscripted interviews with the people behind the microphone.'
        },
        {
          id: 'show-studio-notes',
          title: 'Making Better Audio Through Better Interviews',
          visibility: 'unlisted',
          status: 'finished',
          date: isoAt(-60, 15, 30),
          podPoints: 1890,
          listeners: 74,
          hearts: 610,
          category: 'Technology',
          about: 'The tools, habits and small decisions that make audio work better.'
        },
        {
          id: 'show-sound-design',
          title: 'Inside the Sound Design of a Narrative Podcast',
          visibility: 'public',
          status: 'finished',
          date: isoAt(-5, 18, 0),
          podPoints: 4380,
          listeners: 112,
          hearts: 1240,
          category: 'Technology',
          about: 'A scene-by-scene breakdown of how a narrative podcast finds its sound.'
        },
        {
          id: 'show-voice-coaching',
          title: 'Voice Coaching Live: Finding Your On-Air Presence',
          visibility: 'public',
          status: 'finished',
          date: isoAt(-16, 11, 0),
          podPoints: 2960,
          listeners: 88,
          hearts: 970,
          category: 'Education',
          about: 'Practical voice and delivery coaching for hosts who want to sound like themselves.'
        },
        {
          id: 'show-indie-network',
          title: 'Building an Indie Podcast Network from Scratch',
          visibility: 'unlisted',
          status: 'finished',
          date: isoAt(-26, 16, 30),
          podPoints: 3540,
          listeners: 102,
          hearts: 1180,
          category: 'Business',
          about: 'Founders of independent podcast networks share what worked and what did not.'
        },
        {
          id: 'show-field-recording',
          title: 'Field Recording Walkthrough with a Documentary Team',
          visibility: 'unlisted',
          status: 'finished',
          date: isoAt(-38, 9, 30),
          podPoints: 2410,
          listeners: 61,
          hearts: 720,
          category: 'Arts',
          about: 'Recording on location: gear, weather, permissions and capturing the unexpected.'
        },
        {
          id: 'show-live-mixdown',
          title: 'Live Mixdown Session: From Raw Tracks to Final Cut',
          visibility: 'public',
          status: 'scheduled',
          date: isoAt(3, 19, 30),
          podPoints: null,
          listeners: null,
          hearts: null,
          category: 'Music',
          about: 'A live mixing session that takes a raw multitrack recording through to the final cut.'
        }
      ],
      invites: [
        { id: 'inv-1', name: 'Julie Tran', email: 'julie.tran@example.com', status: 'Joined' },
        { id: 'inv-2', name: 'Marcus Lee', email: 'marcus.lee@example.com', status: 'Joined' },
        { id: 'inv-3', name: 'Nina Patel', email: 'nina.patel@example.com', status: 'Invited' },
        { id: 'inv-4', name: 'Sam Rivera', email: 'sam.rivera@example.com', status: 'Invited' }
      ],
      posts: [
        {
          id: 'post-1',
          author: 'Danita',
          postedAt: isoAt(0, 8, 30),
          time: 'Today · 08:30',
          title: "New Here? Start With These Three Habits",
          body: "We just wrapped our first month of live shows and the questions keep coming. Three things helped me most: pick a fixed time each week, keep a running list of topics, and treat the first five minutes as a warm-up. Join us live this Thursday and bring your own.",
          cover: null,
          likes: 9,
          liked: false,
          comments: COMMENTS.slice()
        },
        {
          id: 'post-2',
          author: 'Danita',
          postedAt: isoAt(-2, 9, 15),
          time: 'Today · 08:30',
          title: "A Quiet Studio Before the Show",
          body: "Ten minutes before we go live the room is still and the light outside is doing all the work. Tonight I'm talking about putting a show together when you only have an hour — see you in the room.",
          cover: 'sunset',
          likes: 9,
          liked: false,
          comments: COMMENTS.slice(0, 1)
        },
        {
          id: 'post-3',
          author: 'Danita',
          postedAt: isoAt(-5, 17, 45),
          time: 'Today · 08:30',
          title: "Ask Me Anything About Home Recording",
          body: "Recording from a small room? Wondering about mic placement, background noise, or keeping your levels steady? Drop your questions below and we'll answer a few of them live on Sunday.",
          cover: null,
          likes: 6,
          liked: false,
          comments: []
        }
      ],
      members: [
        { id: 'm1', name: 'Patricia Wang', points: 9974 },
        { id: 'm2', name: 'Paul Martinez', points: 7061 },
        { id: 'm3', name: 'Patricia Vega', points: 5960 },
        { id: 'm5', name: 'Feng Ji', points: 585 },
        { id: 'm6', name: 'Tess Morgan', points: 233 },
        { id: 'm7', name: 'Paul Michaels', points: 120 },
        { id: 'm8', name: 'Tara Nguyen', points: 35 },
        { id: 'm9', name: 'Gabriel Ortiz', points: 20 },
        { id: 'm10', name: 'Nina Patel', points: 18 },
        { id: 'm11', name: 'Owen Brooks', points: 14 },
        { id: 'm12', name: 'Maya Chen', points: 11 },
        { id: 'm13', name: 'Kai Walker', points: 8 },
        { id: 'm14', name: 'Iris Coleman', points: 5 },
        { id: 'm15', name: 'Liam Foster', points: 4 },
        { id: 'm16', name: 'Zoe Bennett', points: 3 },
        { id: 'm17', name: 'Hana Sato', points: 3 },
        { id: 'm18', name: 'Omar Haddad', points: 2 },
        { id: 'm19', name: 'Elena Petrova', points: 1 },
        { id: 'm20', name: 'Ava Kim', points: 2 },
        { id: 'm21', name: 'Diego Alvarez', points: 1 },
        { id: 'm22', name: 'Freya Lindqvist', points: 1 },
        { id: 'm23', name: 'Sam Rivera', points: 1 }
      ],
      topShows: buildTopShows(),
      topFans: buildTopFans(),
      gifts: buildGifts(),
      earnings: buildEarnings(),
      payouts: {
        account: 'danita@podbean.com',
        total: 1250.5,
        balance: 325.0,
        rows: buildPayouts()
      },
      membershipFee: null,
      liveGreeting: 'Hi, welcome to my live show! I hope you will enjoy my live show.',
      liveTheme: 'default',
      admins: [
        { id: 'adm-1', name: 'Danita', role: 'Owner' },
        { id: 'adm-2', name: 'Patricia Wang', role: 'Admin' }
      ],
      blockedUsers: [
        { id: 'blk-1', name: 'Ava Bennett', photo: 3 },
        { id: 'blk-2', name: 'Noah Carter', photo: 4 },
        { id: 'blk-3', name: 'Mia Rodriguez', photo: 2 },
        { id: 'blk-4', name: 'Ethan Brooks', photo: 6 },
        { id: 'blk-5', name: 'Sofia Kim', photo: 7 }
      ],
      notifications: [
        { id: 'n1', title: 'Danielle Rossi followed you', text: 'You have a new listener following your shows.', time: '2m ago', unread: true, icon: 'user' },
        { id: 'n2', title: 'Marcus Lee commented on your post', text: '“Really useful — the part about preparing an hour before helped a lot.”', time: '18m ago', unread: true, icon: 'message' },
        { id: 'n3', title: 'Priya Shah joined your fan club', text: 'Say hello and welcome her to the community.', time: '1h ago', unread: true, icon: 'users' }
      ],
      notificationsRead: false
    };
  }

  window.createDefaultData = createDefaultData;
  window.LIVE_DATA_META = { EARNING_TITLES: EARNING_TITLES, FAN_NAMES: FAN_NAMES, DAY: DAY };
})();
