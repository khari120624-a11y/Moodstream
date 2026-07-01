/**
 * Dynamically classifies a track into Hollywood, Bollywood, Kollywood, or Tollywood
 * @param {Object} song - The song object containing title, artist, album, language
 * @returns {string} - 'hollywood' | 'bollywood' | 'kollywood' | 'tollywood'
 */
export const categorizeTrack = (song) => {
  if (!song) return 'other';

  // If language is English, it falls under Hollywood
  if (song.language === 'english') {
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
    'sillunu'
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
