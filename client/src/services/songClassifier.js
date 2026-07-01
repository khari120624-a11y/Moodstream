/**
 * Dynamically classifies a track into Hollywood, Bollywood, Kollywood, or Tollywood
 * @param {Object} song - The song object containing title, artist, album, language
 * @returns {string} - 'hollywood' | 'bollywood' | 'kollywood' | 'tollywood'
 */

// List of Indian keywords to match titles, artists, or albums
const INDIAN_KEYWORDS = [
  'arijit', 'rahman', 'anirudh', 'shreya', 'neha', 'badshah', 'diljit',
  'karthik', 'sid sriram', 's. p. b', 'spb', 'harris jayaraj', 'yuvan',
  'shankar raja', 'ilaiyaraaja', 'pritam', 'vishal', 'shekhar', 'amit trivedi',
  'sukhwinder', 'sonu nigam', 'alka', 'udit narayan', 'kumar sanu', 'sunidhi',
  'jubin', 'nautiyal', 'tanishk', 'dhvani', 'raftaar', 'divine', 'emiway',
  'seedhe maut', 'kr$na', 'mc stan', 'armaan malik', 'amal malik', 'sachet',
  'parampara', 'jasleen royal', 'darshan raval', 'tony kakkar', 'nehakakkar',
  'raftaar', 'yoyo', 'honey singh', 'raftaar', 'karan aujla', 'shubh', 'ap dhillon',
  'sidhu moosewala', 'diljit dosanjh', 'hukum', 'naatu', 'rrr', 'pushpa', 'salaar',
  'animal', 'jawan', 'pathaan', 'dunki', 'kalki', 'kabir singh', 'shershaah',
  'luka chuppi', 'simmba', 'kedarnath', 'ae dil hai mushkil', 'yeh jawaani',
  '3 idiots', 'dangal', 'sultan', 'bajrangi', 'pk', 'chennai express',
  'des', 'dhol', 'punjab', 'raga', 'sitar', 'desi', 'dil', 'tum hi ho', 'chaleya',
  'heeriye', 'mi amor', 'baller', 'brown munde', 'excuses', 'we rollin', 'so high',
  'levels', 'the last ride', 'dil da dimag', 'gaddi red challenger', 'goats',
  'pagol', 'she move it like', 'proper patola', 'lahore', 'high rated gabru',
  'tamil', 'telugu', 'hindi', 'kannada', 'malayalam', 'bhojpuri', 'bengali',
  'marathi', 'gujarati', 'punjabi', 'bollywood', 'kollywood', 'tollywood',
  'sandalwood', 'mollywood', 'chola', 'devara', 'sher', 'peene', 'tauba', 'sajni',
  'o maahi', 've kamleya', 'tum se', 'sajda', 'mitwa', 'sajde', 'khairiyat'
];

/**
 * Determines if a track is Indian based on metadata and fallback properties
 * @param {Object} song 
 * @returns {boolean}
 */
export const isIndianTrack = (song) => {
  if (!song) return false;

  const title = (song.title || '').toLowerCase();
  const artist = (song.artist || '').toLowerCase();
  const album = (song.album || '').toLowerCase();

  const hasIndianKeywords = INDIAN_KEYWORDS.some(keyword => 
    title.includes(keyword) || artist.includes(keyword) || album.includes(keyword)
  );

  if (hasIndianKeywords) return true;

  // Fallback to explicit language property from DB/API
  if (song.language === 'indian') return true;
  if (song.language === 'english') return false;

  // Default fallback
  return false;
};

export const categorizeTrack = (song) => {
  if (!song) return 'other';

  const isInd = isIndianTrack(song);
  if (!isInd) {
    return 'hollywood';
  }

  const title = (song.title || '').toLowerCase();
  const artist = (song.artist || '').toLowerCase();
  const album = (song.album || '').toLowerCase();

  // Kollywood (Tamil) keywords and artists
  const kollywoodKeywords = [
    'tamil', 'kollywood', 'hukum', 'jailer', 'arabic kuthu', 'beast', 
    'vaseegara', 'munbe vaa', 'anirudh', 'ar rahman', 'a. r. rahman', 
    'a.r. rahman', 'yuvan', 'shankar raja', 'ilaiyaraaja', 'harris jayaraj', 
    'spb', 's. p. b', 'karthik', 'hariharan', 'chinmayi', 'shweta mohan', 
    'sid sriram', 'vijay', 'ajith', 'raayan', 'ghibran', 'santhosh narayanan', 
    'g.v. prakash', 'imman', 'leo', 'varisu', 'kabali', 'master', 'minnale',
    'sillunu', 'chola', 'devara'
  ];

  // Tollywood (Telugu) keywords and artists
  const tollywoodKeywords = [
    'telugu', 'tollywood', 'naatu naatu', 'rrr', 'keeravani', 
    'devi sri prasad', 'dsp', 'thaman', 'sid sriram', 'sreeleela', 
    'samayama', 'hi nanna', 'inkem', 'geetha govindam', 'adiga adiga', 
    'ninnu kori', 'salaar', 'pushpa', 'puspha', 'baahubali', 
    'ala vaikunthapurramuloo', 'kalki', 'dheemthana', 'anurag kulkarni', 
    'ram miriyala', 'mangal', 'geetha madhuri', 'arya'
  ];

  // Check Tollywood first for specific song titles/artists
  const matchesTollywood = tollywoodKeywords.some(keyword => 
    title.includes(keyword) || artist.includes(keyword) || album.includes(keyword)
  );

  if (matchesTollywood) {
    return 'tollywood';
  }

  // Check Kollywood
  const matchesKollywood = kollywoodKeywords.some(keyword => 
    title.includes(keyword) || artist.includes(keyword) || album.includes(keyword)
  );

  if (matchesKollywood) {
    return 'kollywood';
  }

  // Default to Bollywood for Indian songs
  return 'bollywood';
};
