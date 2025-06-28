import { ContentEntity, WatchProgress, ContinueWatchingItem } from '../types/api';

// Mock content data generator
export const generateMockContent = (): ContentEntity[] => [
  {
    id: 1,
    title: "Fury",
    description: "April 1945. As the Allies make their final push in the European Theatre, a battle-hardened Army sergeant named Wardaddy commands a Sherman tank and his five-man crew on a deadly mission behind enemy lines.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/pfte7wdMobMF4CVHuOxyu6oqeeA.jpg",
    type: "movie",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/pft8dLdZgWS3qz4PL8M4KKtlU8w.jpg",
    durationInSeconds: 8040, // 2h 14m
    trailerID: 101,
    cast: ["Brad Pitt", "Shia LaBeouf", "Logan Lerman", "Michael Peña", "Jon Bernthal"],
    availableLanguages: ["English", "Spanish", "French", "German", "Arabic"],
    contentRating: "R",
    tags: ["War", "Drama", "Action", "Historical"],
    drm: true // R-rated content requires DRM
  },
  {
    id: 2,
    title: "The Big Bang Theory",
    description: "A woman who moves into an apartment across the hall from two brilliant but socially awkward physicists shows them how little they know about life outside of the laboratory.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    durationInSeconds: 1320, // 22m per episode
    trailerID: 102,
    cast: ["Jim Parsons", "Johnny Galecki", "Kaley Cuoco", "Simon Helberg", "Kunal Nayyar"],
    availableLanguages: ["English", "Spanish", "French", "German", "Italian", "Arabic"],
    contentRating: "TV-PG",
    tags: ["Comedy", "Sitcom", "Science", "Friendship"],
    drm: false // Free content, no DRM needed
  },
  {
    id: 3,
    title: "Stranger Things",
    description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    durationInSeconds: 3000, // 50m per episode
    trailerID: 103,
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour", "Gaten Matarazzo"],
    availableLanguages: ["English", "Spanish", "French", "German", "Portuguese", "Arabic"],
    contentRating: "TV-14",
    tags: ["Sci-Fi", "Horror", "Drama", "Supernatural", "80s"],
    drm: true // Premium Netflix content
  },
  {
    id: 4,
    title: "Brooklyn Nine-Nine",
    description: "Comedy series following the exploits of Det. Jake Peralta and his diverse, lovable colleagues as they police the NYPD's 99th Precinct.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/hgRMSOt7a1b8qyQR68vUixJPang.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/ncC9ZgZuKOdaVm7yXinUn26Qyok.jpg",
    durationInSeconds: 1320, // 22m per episode
    trailerID: 104,
    cast: ["Andy Samberg", "Stephanie Beatriz", "Terry Crews", "Melissa Fumero", "Joe Lo Truglio"],
    availableLanguages: ["English", "Spanish", "French", "German", "Arabic"],
    contentRating: "TV-14",
    tags: ["Comedy", "Police", "Workplace", "Crime"],
    drm: false // Free content, no DRM needed
  },
  {
    id: 5,
    title: "The Mandalorian",
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/o7qi7v4m7bEEvX7RsUcU8Vxmz2X.jpg",
    durationInSeconds: 2400, // 40m per episode
    trailerID: 105,
    cast: ["Pedro Pascal", "Gina Carano", "Carl Weathers", "Giancarlo Esposito"],
    availableLanguages: ["English", "Spanish", "French", "German", "Japanese", "Arabic"],
    contentRating: "TV-PG",
    tags: ["Sci-Fi", "Action", "Adventure", "Star Wars", "Western"],
    drm: true // Premium Disney+ content
  },
  {
    id: 6,
    title: "Deadpool",
    description: "A wisecracking mercenary gets experimented on and becomes immortal but ugly, and sets out to track down the man who ruined his looks.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/9X7YweCJw3q8Mcf6GadxReFEksM.jpg",
    type: "movie",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/en971MEXui9diirXlogOrPKmsEn.jpg",
    durationInSeconds: 6480, // 1h 48m
    trailerID: 106,
    cast: ["Ryan Reynolds", "Morena Baccarin", "Ed Skrein", "T.J. Miller", "Gina Carano"],
    availableLanguages: ["English", "Spanish", "French", "German", "Portuguese", "Arabic"],
    contentRating: "R",
    tags: ["Action", "Comedy", "Superhero", "Marvel", "Anti-Hero"],
    drm: true // R-rated content requires DRM
  },
  {
    id: 7,
    title: "Game of Thrones",
    description: "Nine noble families fight for control over the mythical lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    durationInSeconds: 3600, // 60m per episode
    trailerID: 107,
    cast: ["Emilia Clarke", "Peter Dinklage", "Kit Harington", "Lena Headey", "Nikolaj Coster-Waldau"],
    availableLanguages: ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Mandarin"],
    contentRating: "TV-MA",
    tags: ["Fantasy", "Drama", "Political", "Medieval", "Epic"],
    drm: true // TV-MA content requires DRM
  },
  {
    id: 8,
    title: "Avengers: Endgame",
    description: "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    type: "movie",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    durationInSeconds: 10860, // 3h 1m
    trailerID: 108,
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
    availableLanguages: ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Mandarin", "Japanese"],
    contentRating: "PG-13",
    tags: ["Action", "Adventure", "Superhero", "Marvel", "Epic"],
    drm: true // Premium movie content
  },
  {
    id: 9,
    title: "The Office",
    description: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/qWnJzyZhyy17WgJZGtAf4bqfoP5.jpg",
    durationInSeconds: 1320, // 22m per episode
    trailerID: 109,
    cast: ["Steve Carell", "John Krasinski", "Jenna Fischer", "Rainn Wilson", "Mindy Kaling"],
    availableLanguages: ["English", "Spanish", "French", "German", "Portuguese", "Arabic"],
    contentRating: "TV-14",
    tags: ["Comedy", "Mockumentary", "Workplace", "Sitcom"],
    drm: false // Free content, no DRM needed
  },
  {
    id: 10,
    title: "Breaking Bad",
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family's future.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    durationInSeconds: 2700, // 45m per episode
    trailerID: 110,
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "RJ Mitte", "Dean Norris"],
    availableLanguages: ["English", "Spanish", "French", "German", "Portuguese", "Arabic"],
    contentRating: "TV-MA",
    tags: ["Crime", "Drama", "Thriller", "Dark", "Antihero"],
    drm: true // TV-MA content requires DRM
  },
  {
    id: 11,
    title: "Friends",
    description: "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    durationInSeconds: 1320, // 22m per episode
    trailerID: 111,
    cast: ["Jennifer Aniston", "Courteney Cox", "Lisa Kudrow", "Matt LeBlanc", "Matthew Perry", "David Schwimmer"],
    availableLanguages: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Arabic"],
    contentRating: "TV-PG",
    tags: ["Comedy", "Romance", "Friendship", "Sitcom", "90s"],
    drm: false // Free content, no DRM needed
  },
  {
    id: 12,
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    logoTitleImage: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    type: "movie",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    durationInSeconds: 8880, // 2h 28m
    trailerID: 112,
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Ellen Page", "Ken Watanabe"],
    availableLanguages: ["English", "Spanish", "French", "German", "Japanese", "Arabic", "Mandarin"],
    contentRating: "PG-13",
    tags: ["Sci-Fi", "Thriller", "Action", "Mind-bending", "Heist"],
    drm: true // Premium movie content
  }
];

// Mock watch progress data
export const generateMockWatchProgress = (): WatchProgress[] => [
  {
    contentId: 1,
    progressInSeconds: 3600, // 1 hour into Fury
    lastWatched: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    completed: false
  },
  {
    contentId: 2,
    progressInSeconds: 900, // 15 minutes into Big Bang Theory
    lastWatched: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    completed: false
  },
  {
    contentId: 3,
    progressInSeconds: 2700, // 45 minutes into Stranger Things
    lastWatched: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    completed: false
  },
  {
    contentId: 8,
    progressInSeconds: 5400, // 1.5 hours into Endgame
    lastWatched: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    completed: false
  },
  {
    contentId: 10,
    progressInSeconds: 2700, // Completed Breaking Bad episode
    lastWatched: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    completed: true
  }
];

// Mock user's favorite list
export const generateMockMyList = (): number[] => [2, 3, 5, 7, 8, 10, 12];

// Helper function to get random items from array
export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to filter content by type
export const filterContentByType = (content: ContentEntity[], type?: ContentEntity['type']): ContentEntity[] => {
  if (!type) return content;
  return content.filter(item => item.type === type);
};

// Generate playout data for a specific content ID
export const generatePlayoutDataForContent = (contentId: number): any | null => {
  const mockContent = generateMockContent();
  const content = mockContent.find(c => c.id === contentId);
  
  if (!content) {
    return null;
  }

  return {
    // Base streaming URLs - always generate both clear and DRM URLs
    hls: {
      clear: `https://streaming.thamaneyah.com/hls/${content.id}/master.m3u8`,
      fairplay: `https://streaming.thamaneyah.com/hls/fairplay/${content.id}/master.m3u8`
    },
    dash: {
      clear: `https://streaming.thamaneyah.com/dash/${content.id}/manifest.mpd`,
      widevine: `https://streaming.thamaneyah.com/dash/widevine/${content.id}/manifest.mpd`
    },
    smoothStreaming: {
      clear: `https://streaming.thamaneyah.com/smooth/${content.id}/manifest`,
      playready: `https://streaming.thamaneyah.com/smooth/playready/${content.id}/manifest`
    },
    
    // DRM configuration - use content.drm field
    drm: {
      enabled: content.drm,
      fairplay: {
        licenseUrl: `https://drm.thamaneyah.com/fairplay/license/${content.id}`,
        certificateUrl: `https://drm.thamaneyah.com/fairplay/certificate`,
        keyId: `fp_key_${content.id}_${Date.now()}`
      },
      widevine: {
        licenseUrl: `https://drm.thamaneyah.com/widevine/license/${content.id}`,
        keyId: `wv_key_${content.id}_${Date.now()}`
      },
      playready: {
        licenseUrl: `https://drm.thamaneyah.com/playready/license/${content.id}`,
        keyId: `pr_key_${content.id}_${Date.now()}`
      }
    },

    // Content markers (in seconds)
    markers: {
      intro: {
        start: content.type === 'show' ? 0 : 0,
        end: content.type === 'show' ? 30 : 0 // Shows have 30s intro
      },
      credits: {
        start: content.durationInSeconds - (content.type === 'movie' ? 120 : 30),
        end: content.durationInSeconds
      },
      skipIntro: content.type === 'show' ? 30 : 0,
      skipCredits: content.durationInSeconds - (content.type === 'movie' ? 120 : 30)
    },

    // Thumbnails and preview
    thumbnails: {
      preview: `https://thumbnails.thamaneyah.com/${content.id}/preview.vtt`,
      sprite: `https://thumbnails.thamaneyah.com/${content.id}/sprite.jpg`,
      interval: 10 // Thumbnail every 10 seconds
    },

    // Quality levels available
    qualityLevels: [
      { resolution: '1920x1080', bitrate: 8000000, fps: 30, codec: 'H.264' },
      { resolution: '1280x720', bitrate: 4000000, fps: 30, codec: 'H.264' },
      { resolution: '854x480', bitrate: 2000000, fps: 30, codec: 'H.264' },
      { resolution: '640x360', bitrate: 1000000, fps: 30, codec: 'H.264' }
    ],

    // Audio tracks based on content's available languages
    audioTracks: content.availableLanguages.map((lang, index) => ({
      id: `audio_${index}`,
      language: lang,
      label: `${lang} Audio`,
      codec: 'AAC',
      channels: lang === 'English' ? '5.1' : '2.0',
      bitrate: lang === 'English' ? 256000 : 128000
    })),

    // Subtitle tracks based on content's available languages
    subtitleTracks: content.availableLanguages.map((lang, index) => ({
      id: `subtitle_${index}`,
      language: lang,
      label: `${lang} Subtitles`,
      format: 'WebVTT',
      url: `https://subtitles.thamaneyah.com/${content.id}/${lang.toLowerCase()}.vtt`
    })),

    // Chapters (for longer content)
    chapters: content.durationInSeconds > 3600 ? [
      { start: 0, end: 1800, title: 'Opening' },
      { start: 1800, end: 3600, title: 'First Act' },
      { start: 3600, end: 5400, title: 'Second Act' },
      { start: 5400, end: content.durationInSeconds, title: 'Finale' }
    ] : [],

    // Advertising (for free content - opposite of DRM)
    advertising: {
      enabled: !content.drm, // Free content (no DRM) has ads
      preroll: !content.drm ? [{
        duration: 30,
        url: `https://ads.thamaneyah.com/preroll/video_${Math.floor(Math.random() * 5) + 1}.mp4`,
        clickthrough: 'https://ads.thamaneyah.com/click/preroll'
      }] : [],
      midroll: !content.drm && content.durationInSeconds > 1800 ? [{
        position: Math.floor(content.durationInSeconds / 2),
        duration: 15,
        url: `https://ads.thamaneyah.com/midroll/video_${Math.floor(Math.random() * 3) + 1}.mp4`,
        clickthrough: 'https://ads.thamaneyah.com/click/midroll'
      }] : [],
      postroll: !content.drm ? [{
        duration: 15,
        url: `https://ads.thamaneyah.com/postroll/video_${Math.floor(Math.random() * 3) + 1}.mp4`,
        clickthrough: 'https://ads.thamaneyah.com/click/postroll'
      }] : []
    }
  };
};

// Helper function to search content
export const searchContent = (content: ContentEntity[], query: string): ContentEntity[] => {
  const lowerQuery = query.toLowerCase();
  return content.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.cast.some(actor => actor.toLowerCase().includes(lowerQuery)) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}; 