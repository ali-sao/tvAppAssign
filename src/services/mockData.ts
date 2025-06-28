import { ContentEntity, WatchProgress, ContinueWatchingItem } from '../types/api';
import { englishVTT } from '../../assets/subtitles/english';
import { arabicVTT } from '../../assets/subtitles/arabic';

// Mock content data generator
export const generateMockContent = (): ContentEntity[] => [
  {
    id: 1,
    title: "Fury",
    description: "April 1945. As the Allies make their final push in the European Theatre, a battle-hardened Army sergeant named Wardaddy commands a Sherman tank and his five-man crew on a deadly mission behind enemy lines.",
    posterImage: "https://image.tmdb.org/t/p/w500/pfte7wdMobMF4CVHuOxyu6oqeeA.jpg",
    logoTitleImage:"https://i.pinimg.com/736x/e5/26/5b/e5265b4302f8ac19675000b8bd5fb586.jpg",
    type: "movie",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/pft8dLdZgWS3qz4PL8M4KKtlU8w.jpg",
    durationInSeconds: 8040, // 2h 14m
    trailerID: 101,
    cast: ["Brad Pitt", "Shia LaBeouf", "Logan Lerman", "Michael Peña", "Jon Bernthal"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "R",
    tags: ["War", "Drama", "Action", "Historical"],
    drm: false
  },
  {
    id: 2,
    title: "The Big Bang Theory",
    description: "A woman who moves into an apartment across the hall from two brilliant but socially awkward physicists shows them how little they know about life outside of the laboratory.",
    posterImage: "https://image.tmdb.org/t/p/w500/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg",
    logoTitleImage:"https://www.vhv.rs/dpng/d/594-5941666_big-bang-theory-hd-png-download.png",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    durationInSeconds: 1320, // 22m per episode
    trailerID: 102,
    cast: ["Jim Parsons", "Johnny Galecki", "Kaley Cuoco", "Simon Helberg", "Kunal Nayyar"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "TV-PG",
    tags: ["Comedy", "Sitcom", "Science", "Friendship"],
    drm: false // Free content, no DRM needed
  },
  {
    id: 3,
    title: "Stranger Things",
    description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    posterImage: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    logoTitleImage:"https://i.pinimg.com/564x/e0/ed/f6/e0edf62ad959221627229bda43c05e52.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    durationInSeconds: 3000, // 50m per episode
    trailerID: 103,
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour", "Gaten Matarazzo"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "TV-14",
    tags: ["Sci-Fi", "Horror", "Drama", "Supernatural", "80s"],
    drm: false // Premium Netflix content
  },
  {
    id: 4,
    title: "Brooklyn Nine-Nine",
    description: "Comedy series following the exploits of Det. Jake Peralta and his diverse, lovable colleagues as they police the NYPD's 99th Precinct.",
    posterImage: "https://image.tmdb.org/t/p/w500/hgRMSOt7a1b8qyQR68vUixJPang.jpg",
    logoTitleImage:"https://img.favpng.com/16/6/6/brooklyn-nine-nine-png-favpng-yFUdP9hKF30w41kw4Kb7WL9A2.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/ncC9ZgZuKOdaVm7yXinUn26Qyok.jpg",
    durationInSeconds: 1320, // 22m per episode
    trailerID: 104,
    cast: ["Andy Samberg", "Stephanie Beatriz", "Terry Crews", "Melissa Fumero", "Joe Lo Truglio"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "TV-14",
    tags: ["Comedy", "Police", "Workplace", "Crime"],
    drm: false // Free content, no DRM needed
  },
  {
    id: 5,
    title: "The Mandalorian",
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    posterImage: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    logoTitleImage:"https://pngimg.com/d/mandalorian_PNG1.png",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/o7qi7v4m7bEEvX7RsUcU8Vxmz2X.jpg",
    durationInSeconds: 2400, // 40m per episode
    trailerID: 105,
    cast: ["Pedro Pascal", "Gina Carano", "Carl Weathers", "Giancarlo Esposito"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "TV-PG",
    tags: ["Sci-Fi", "Action", "Adventure", "Star Wars", "Western"],
    drm: false // Premium Disney+ content
  },
  {
    id: 6,
    title: "Deadpool",
    description: "A wisecracking mercenary gets experimented on and becomes immortal but ugly, and sets out to track down the man who ruined his looks.",
    posterImage: "https://image.tmdb.org/t/p/w500/9X7YweCJw3q8Mcf6GadxReFEksM.jpg",
    logoTitleImage:"https://e7.pngegg.com/pngimages/917/351/png-clipart-deadpool-deadpool-logo-at-the-movies-deadpool-thumbnail.png",
    type: "movie",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/en971MEXui9diirXlogOrPKmsEn.jpg",
    durationInSeconds: 6480, // 1h 48m
    trailerID: 106,
    cast: ["Ryan Reynolds", "Morena Baccarin", "Ed Skrein", "T.J. Miller", "Gina Carano"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "R",
    tags: ["Action", "Comedy", "Superhero", "Marvel", "Anti-Hero"],
    drm: false // R-rated content requires DRM
  },
  {
    id: 7,
    title: "Game of Thrones",
    description: "Nine noble families fight for control over the mythical lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    posterImage: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    logoTitleImage:"https://i.pinimg.com/736x/77/87/aa/7787aa2f928c61a45279a93f10ad0cf7.jpg",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    durationInSeconds: 3600, // 60m per episode
    trailerID: 107,
    cast: ["Emilia Clarke", "Peter Dinklage", "Kit Harington", "Lena Headey", "Nikolaj Coster-Waldau"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "TV-MA",
    tags: ["Fantasy", "Drama", "Political", "Medieval", "Epic"],
    drm: false // TV-MA content requires DRM
  },
  {
    id: 8,
    title: "Avengers: Endgame",
    description: "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    posterImage: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    logoTitleImage:"https://upload.wikimedia.org/wikipedia/commons/4/4d/Avengers_endgame_logo.png",
    type: "movie",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    durationInSeconds: 10860, // 3h 1m
    trailerID: 108,
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "PG-13",
    tags: ["Action", "Adventure", "Superhero", "Marvel", "Epic"],
    drm: false // Premium movie content
  },
  {
    id: 9,
    title: "The Office",
    description: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
    posterImage: "https://image.tmdb.org/t/p/w500/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
    logoTitleImage:"https://image.tmdb.org/t/p/original/9h5aA5FhdKSkpLI0JvD4NsJZqIh.png",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/qWnJzyZhyy17WgJZGtAf4bqfoP5.jpg",
    durationInSeconds: 1320, // 22m per episode
    trailerID: 109,
    cast: ["Steve Carell", "John Krasinski", "Jenna Fischer", "Rainn Wilson", "Mindy Kaling"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "TV-14",
    tags: ["Comedy", "Mockumentary", "Workplace", "Sitcom"],
    drm: false // Free content, no DRM needed
  },
  {
    id: 10,
    title: "Breaking Bad",
    description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family's future.",
    posterImage: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    logoTitleImage:"https://www.liblogo.com/img-logo/sml/br3044bd6b-breaking-bad-logo-breaking-bad-tv-series-logo-vector-in-eps-ai-cdr-free-download.webp",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    durationInSeconds: 2700, // 45m per episode
    trailerID: 110,
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "RJ Mitte", "Dean Norris"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "TV-MA",
    tags: ["Crime", "Drama", "Thriller", "Dark", "Antihero"],
    drm: false // TV-MA content requires DRM
  },
  {
    id: 11,
    title: "Friends",
    description: "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.",
    posterImage: "https://image.tmdb.org/t/p/w500/f496cm9enuEsZkSPzCwnTESEK5s.jpg",
    logoTitleImage:"https://toppng.com/uploads/preview/friendstv-club-friends-logo-white-11563064051qpcqpvese2.png",
    type: "show",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    durationInSeconds: 1320, // 22m per episode
    trailerID: 111,
    cast: ["Jennifer Aniston", "Courteney Cox", "Lisa Kudrow", "Matt LeBlanc", "Matthew Perry", "David Schwimmer"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "TV-PG",
    tags: ["Comedy", "Romance", "Friendship", "Sitcom", "90s"],
    drm: false // Free content, no DRM needed
  },
  {
    id: 12,
    title: "Inception",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterImage: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    logoTitleImage:"https://www.pngplay.com/wp-content/uploads/12/Inception-PNG-Photos.png",
    type: "movie",
    heroImage: "https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    durationInSeconds: 8880, // 2h 28m
    trailerID: 112,
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Ellen Page", "Ken Watanabe"],
    availableLanguages: ["English", "Arabic"],
    contentRating: "PG-13",
    tags: ["Sci-Fi", "Thriller", "Action", "Mind-bending", "Heist"],
    drm: false // Premium movie content
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

// Real streaming URLs for testing
const getRealStreamingUrls = (contentId: number, isDrm: boolean) => {
  // For DRM content, we'll use publicly available test streams
  // For non-DRM content, we'll use reliable public test streams
  
  if (isDrm) {
    // Use Axinom test vectors for DRM content (these require proper license handling)
    return {
      hls: {
        clear: "https://media.axprod.net/TestVectors/Cmaf/clear_1080p_h264/manifest.m3u8",
        fairplay: "https://media.axprod.net/TestVectors/Cmaf/protected_1080p_h264_cbcs/manifest.m3u8"
      },
      dash: {
        clear: "https://media.axprod.net/TestVectors/Cmaf/clear_1080p_h264/manifest.mpd",
        widevine: "https://media.axprod.net/TestVectors/Cmaf/protected_1080p_h264_cbcs/manifest.mpd"
      }
    };
  } else {
    // Use various public test streams for non-DRM content
    const publicStreams = [
      {
        // Apple's bipbop test stream
        hls: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
        dash: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd"
      },
      {
        // Tears of Steel - Unified Streaming
        hls: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
        dash: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.mpd"
      },
      {
        // Big Buck Bunny - Various sources
        hls: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        dash: "https://dash.akamaized.net/dash264/TestCases/1a/qualcomm/1/MultiRate.mpd"
      },
      {
        // Sintel test stream
        hls: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
        dash: "https://bitdash-a.akamaihd.net/content/sintel/sintel.mpd"
      },
      {
        // Live test stream (Akamai)
        hls: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
        dash: "https://cdn.bitmovin.com/content/assets/art-of-motion-dash-hls-progressive/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd"
      }
    ];
    
    // Select stream based on content ID to provide variety
    const streamIndex = (contentId - 1) % publicStreams.length;
    return publicStreams[streamIndex];
  }
};

// Generate playout data for a specific content ID
export const generatePlayoutDataForContent = (contentId: number): any | null => {
  const mockContent = generateMockContent();
  const content = mockContent.find(c => c.id === contentId);
  
  if (!content) {
    return null;
  }

  // Get real streaming URLs based on content DRM status
  const streamingUrls = getRealStreamingUrls(contentId, content.drm);

  return {
    // Real streaming URLs
    hls: {
      clear: streamingUrls.hls,
      fairplay: streamingUrls.hls // For testing, use same URL (would be different in production)
    },
    dash: {
      clear: streamingUrls.dash,
      widevine: streamingUrls.dash // For testing, use same URL (would be different in production)
    },
    smoothStreaming: {
      clear: `https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest`,
      playready: `https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest`
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

    // Subtitle tracks based on content's available languages - using real demo VTT files
    subtitleTracks: content.availableLanguages.map((lang, index) => {
      // Use real demo VTT files for testing
      // Use imported VTT content as data URLs
      const demoVttFiles: Record<string, string> = {
        'English': `data:text/vtt;charset=utf-8,${encodeURIComponent(englishVTT)}`,
        'Arabic': `data:text/vtt;charset=utf-8,${encodeURIComponent(arabicVTT)}`
      };
      
      return {
        id: `subtitle_${index}`,
        language: lang,
        label: `${lang} Subtitles`,
        format: 'WebVTT',
        url: demoVttFiles[lang] || 'https://gist.githubusercontent.com/samdutton/ca37f3adaf4e23679957b8083e061177/raw/sample.vtt'
      };
    }),

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