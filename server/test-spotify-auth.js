import dotenv from 'dotenv';
import path from 'path';

// Load from parent .env
dotenv.config({ path: '../.env' });

async function testSpotifyAuth() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('Testing Spotify Authentication...');
  console.log('Client ID:', clientId);
  console.log('Client Secret:', clientSecret ? 'XXXX-FOUND-XXXX' : 'MISSING');

  if (!clientId || !clientSecret) {
    console.error('ERROR: Client ID or Client Secret is missing from env variables!');
    return;
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const status = response.status;
    const data = await response.json();
    
    if (status === 200) {
      console.log('SUCCESS! Authenticated with Spotify API.');
      console.log('Access Token (first 25 chars):', data.access_token.substring(0, 25) + '...');
      console.log('Expires in:', data.expires_in, 'seconds');
    } else {
      console.error('FAILED! Status:', status);
      console.error('Details:', data);
    }
  } catch (error) {
    console.error('FAILED! Message:', error.message);
  }
}

testSpotifyAuth();
