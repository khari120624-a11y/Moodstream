export const moods = {
  happy: {
    name: 'Happy',
    emoji: '☀️',
    color: 'linear-gradient(135deg, #FF9933 0%, #FF5577 100%)',
    accent: '#FF7744',
    spotifyQuery: 'genre:pop happy hits energy OR bollywood happy pop',
    itunesQuery: 'happy hits pop bollywood',
    spotifyParams: {
      target_valence: 0.8,
      target_energy: 0.7,
      min_valence: 0.6,
    },
    fallbackSongs: [
      {
        spotifyId: 'fb_happy_1',
        title: 'Sunshine Groove',
        artist: 'The Joyriders',
        album: 'Summer Escape',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        mood: 'happy',
        language: 'english'
      },
      {
        spotifyId: 'fb_happy_2',
        title: 'Upbeat Horizons',
        artist: 'Neon Daydream',
        album: 'High Spirits',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        mood: 'happy',
        language: 'english'
      },
      {
        spotifyId: 'fb_happy_3',
        title: 'Golden Radiance',
        artist: 'Solar Flare',
        album: 'Equinox',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        mood: 'happy',
        language: 'english'
      },
      {
        spotifyId: 'fb_happy_ind_1',
        title: 'Desi Dhol Beat',
        artist: 'Balle Band',
        album: 'Punjab Vibes',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        mood: 'happy',
        language: 'indian'
      },
      {
        spotifyId: 'fb_happy_ind_2',
        title: 'Dil Bole Vibe',
        artist: 'Bollywood Fusion',
        album: 'Monsoon Pop',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        mood: 'happy',
        language: 'indian'
      },
      {
        spotifyId: 'fb_happy_ind_3',
        title: 'Sitar Joy Dance',
        artist: 'Ravi and Friends',
        album: 'East Raga',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        mood: 'happy',
        language: 'indian'
      }
    ]
  },
  sad: {
    name: 'Sad',
    emoji: '🌧️',
    color: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
    accent: '#26D0CE',
    spotifyQuery: 'melancholy acoustic unplugged OR bollywood sad songs status',
    itunesQuery: 'sad songs acoustic bollywood',
    spotifyParams: {
      target_valence: 0.15,
      target_energy: 0.25,
      max_valence: 0.35,
    },
    fallbackSongs: [
      {
        spotifyId: 'fb_sad_1',
        title: 'Raindrops on Window',
        artist: 'Echoes of Silence',
        album: 'Solitary Walk',
        imageUrl: 'https://images.unsplash.com/photo-1437419764061-2473afe69fc2?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        mood: 'sad',
        language: 'english'
      },
      {
        spotifyId: 'fb_sad_2',
        title: 'Shadows in the Mist',
        artist: 'Nocturnal',
        album: 'Midnight Whispers',
        imageUrl: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        mood: 'sad',
        language: 'english'
      },
      {
        spotifyId: 'fb_sad_3',
        title: 'Lost in Thought',
        artist: 'The Quiet Room',
        album: 'Fading Lights',
        imageUrl: 'https://images.unsplash.com/photo-1489641499538-be3a887fa21e?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        mood: 'sad',
        language: 'english'
      },
      {
        spotifyId: 'fb_sad_ind_1',
        title: 'Tum Hi Ho (Melancholy Flute)',
        artist: 'Acoustic India',
        album: 'Silent Tears',
        imageUrl: 'https://images.unsplash.com/photo-1437419764061-2473afe69fc2?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        mood: 'sad',
        language: 'indian'
      },
      {
        spotifyId: 'fb_sad_ind_2',
        title: 'Tears of the Sitar',
        artist: 'Pandit Ji',
        album: 'Deep Ragas',
        imageUrl: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        mood: 'sad',
        language: 'indian'
      },
      {
        spotifyId: 'fb_sad_ind_3',
        title: 'Kabira Acoustic Cover',
        artist: 'Dev & Riya',
        album: 'Unplugged Classics',
        imageUrl: 'https://images.unsplash.com/photo-1489641499538-be3a887fa21e?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        mood: 'sad',
        language: 'indian'
      }
    ]
  },
  energetic: {
    name: 'Energetic',
    emoji: '⚡',
    color: 'linear-gradient(135deg, #F12711 0%, #F5AF19 100%)',
    accent: '#F12711',
    spotifyQuery: 'genre:dance workout high energy OR punjabi bhangra energetic electronic',
    itunesQuery: 'workout dance bhangra punjabi energy',
    spotifyParams: {
      target_energy: 0.9,
      target_tempo: 128,
      min_energy: 0.8,
    },
    fallbackSongs: [
      {
        spotifyId: 'fb_energy_1',
        title: 'Hyperdrive',
        artist: 'Velocity',
        album: 'Neon Grid',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        mood: 'energetic',
        language: 'english'
      },
      {
        spotifyId: 'fb_energy_2',
        title: 'Lightning Storm',
        artist: 'Electro Pulse',
        album: 'Overdrive',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        mood: 'energetic',
        language: 'english'
      },
      {
        spotifyId: 'fb_energy_3',
        title: 'Synthwave Skyline',
        artist: 'Retro Racer',
        album: 'Outrun 84',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        mood: 'energetic',
        language: 'english'
      },
      {
        spotifyId: 'fb_energy_ind_1',
        title: 'Bhangra Dhamaka Energy',
        artist: 'Dhol Kings',
        album: 'Punjab Beats',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        mood: 'energetic',
        language: 'indian'
      },
      {
        spotifyId: 'fb_energy_ind_2',
        title: 'Masala Club Beat',
        artist: 'DJ Mumbai',
        album: 'Bollywood Remixes',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        mood: 'energetic',
        language: 'indian'
      },
      {
        spotifyId: 'fb_energy_ind_3',
        title: 'High Octane Sitar Rock',
        artist: 'Fusion Project',
        album: 'Rock the Raga',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        mood: 'energetic',
        language: 'indian'
      }
    ]
  },
  chill: {
    name: 'Chill',
    emoji: '🌊',
    color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    accent: '#11998e',
    spotifyQuery: 'chillout ambient lofi chill OR bollywood lofi instrumental',
    itunesQuery: 'lofi chill ambient instrumental bollywood',
    spotifyParams: {
      target_energy: 0.4,
      target_valence: 0.6,
      max_energy: 0.55,
    },
    fallbackSongs: [
      {
        spotifyId: 'fb_chill_1',
        title: 'Ocean Breeze',
        artist: 'Tidepool',
        album: 'Coastal Drift',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        mood: 'chill',
        language: 'english'
      },
      {
        spotifyId: 'fb_chill_2',
        title: 'Sublime Horizon',
        artist: 'Pacific Calm',
        album: 'Lazy Waves',
        imageUrl: 'https://images.unsplash.com/photo-1473116763269-255ea7b29a16?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        mood: 'chill',
        language: 'english'
      },
      {
        spotifyId: 'fb_chill_3',
        title: 'Sunset Café',
        artist: 'Lofi Horizons',
        album: 'Espresso Beats',
        imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        mood: 'chill',
        language: 'english'
      },
      {
        spotifyId: 'fb_chill_ind_1',
        title: 'Monsoon Rain Lofi',
        artist: 'Desi Chill Beats',
        album: 'Lofi Chai Shop',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        mood: 'chill',
        language: 'indian'
      },
      {
        spotifyId: 'fb_chill_ind_2',
        title: 'Evening Raga Ambient',
        artist: 'Deval',
        album: 'Varanasi Sunset',
        imageUrl: 'https://images.unsplash.com/photo-1473116763269-255ea7b29a16?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
        mood: 'chill',
        language: 'indian'
      },
      {
        spotifyId: 'fb_chill_ind_3',
        title: 'Himalayan Breeze',
        artist: 'Flute Meditation',
        album: 'Nirvana Vibes',
        imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
        mood: 'chill',
        language: 'indian'
      }
    ]
  },
  focused: {
    name: 'Focused',
    emoji: '🧠',
    color: 'linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)',
    accent: '#D76D77',
    spotifyQuery: 'deep focus study ambient lofi OR sitar ambient calm raga study',
    itunesQuery: 'focus study ambient lofi sitar meditation',
    spotifyParams: {
      target_energy: 0.25,
      target_valence: 0.4,
      target_instrumentalness: 0.8,
    },
    fallbackSongs: [
      {
        spotifyId: 'fb_focused_1',
        title: 'Study Engine',
        artist: 'Brain Waves',
        album: 'Binaural Flow',
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        mood: 'focused',
        language: 'english'
      },
      {
        spotifyId: 'fb_focused_2',
        title: 'Deep Mindscapes',
        artist: 'Cerebral',
        album: 'Flow State',
        imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
        mood: 'focused',
        language: 'english'
      },
      {
        spotifyId: 'fb_focused_3',
        title: 'Alpha Waves',
        artist: 'Focal Point',
        album: 'Pure Focus',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
        mood: 'focused',
        language: 'english'
      },
      {
        spotifyId: 'fb_focused_ind_1',
        title: 'Binaural Sitar Meditations',
        artist: 'Yogi Soundscapes',
        album: 'Focus Guru',
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
        mood: 'focused',
        language: 'indian'
      },
      {
        spotifyId: 'fb_focused_ind_2',
        title: 'Mindful Santoor Flow',
        artist: 'Santoor Meditations',
        album: 'Mind Space',
        imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        mood: 'focused',
        language: 'indian'
      },
      {
        spotifyId: 'fb_focused_ind_3',
        title: 'Deep Yoga Ambient',
        artist: 'Sanskrit Chants',
        album: 'Karma Flow',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        mood: 'focused',
        language: 'indian'
      }
    ]
  },
  romantic: {
    name: 'Romantic',
    emoji: '💖',
    color: 'linear-gradient(135deg, #e65c00 0%, #F9D423 100%)',
    accent: '#e65c00',
    spotifyQuery: 'romance slow ballad love OR bollywood slow romantic tracks',
    itunesQuery: 'love songs romance romantic bollywood',
    spotifyParams: {
      target_valence: 0.6,
      target_energy: 0.45,
      target_danceability: 0.5,
    },
    fallbackSongs: [
      {
        spotifyId: 'fb_romantic_1',
        title: 'Candlelight Serenade',
        artist: 'Velvet Strings',
        album: 'Night for Two',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
        mood: 'romantic',
        language: 'english'
      },
      {
        spotifyId: 'fb_romantic_2',
        title: 'Heartbeat Rhythm',
        artist: 'Sweet Harmony',
        album: 'Unspoken Words',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        mood: 'romantic',
        language: 'english'
      },
      {
        spotifyId: 'fb_romantic_3',
        title: 'Dancing in the Dark',
        artist: 'Midnight Waltz',
        album: 'Close Embraces',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&auto=format&fit=crop&q=60',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        mood: 'romantic',
        language: 'english'
      },
      {
        spotifyId: 'fb_romantic_ind_1',
        title: 'Pehla Nasha (Love Guitar)',
        artist: 'Acoustic India',
        album: 'Pehla Ishq',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        mood: 'romantic',
        language: 'indian'
      },
      {
        spotifyId: 'fb_romantic_ind_2',
        title: 'Glow of Taj Mahal',
        artist: 'Sitar Love',
        album: 'Eternal Romance',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        mood: 'romantic',
        language: 'indian'
      },
      {
        spotifyId: 'fb_romantic_ind_3',
        title: 'Chura Ke Dil Mera (Unplugged)',
        artist: 'Dev & Riya',
        album: 'Retro Unplugged',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        mood: 'romantic',
        language: 'indian'
      }
    ]
  }
};
