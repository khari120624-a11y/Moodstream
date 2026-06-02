async function testSongs() {
  try {
    console.log('Fetching happy mood songs from http://localhost:5000/api/music/mood/happy...');
    const res = await fetch('http://localhost:5000/api/music/mood/happy');
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data length:', data.length);
    console.log('First song sample:', data[0]);
  } catch (error) {
    console.error('Error fetching songs:', error.message);
  }
}
testSongs();
