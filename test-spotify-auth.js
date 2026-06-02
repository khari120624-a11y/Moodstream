import axios from 'axios';
import dotenv from 'dotenv';

// Load from parent or local .env
dotenv.config();
dotenv.config({ path: '../.env' });

async function testSpotifyAuth() {
  const clientId = process.env.SPOTIFY_CLIENT_ID || '248be8a3997f4055a70de70d31b89de9';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || 'e29919cc82304d6984827899458a7696';

  console.log('Testing Spotify Authentication...');
  console.log('Client ID:', clientId);
  console.log('Client Secret:', clientSecret ? 'XXXX-FOUND-XXXX' : 'MISSING');

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('SUCCESS! Authenticated with Spotify API.');
    console.log('Access Token (first 25 chars):', response.data.access_token.substring(0, 25) + '...');
    console.log('Expires in:', response.data.expires_in, 'seconds');
  } catch (error) {
    console.error('FAILED! Spotify Auth Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Details:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testSpotifyAuth();
