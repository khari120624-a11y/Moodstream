import dotenv from 'dotenv';
import path from 'path';

// Load from parent .env
dotenv.config();
dotenv.config({ path: '../.env' });

console.log('--- ENV DIAGNOSTIC ---');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID || 'UNDEFINED');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'DEFINED' : 'UNDEFINED');
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'UNDEFINED');
console.log('----------------------');
