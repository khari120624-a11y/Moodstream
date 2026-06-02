import mongoose from 'mongoose';
import User from '../models/User.js';
import Playlist from '../models/Playlist.js';

// In-memory local stores for offline fallback
const mockUsers = [];
const mockPlaylists = [];

// Check if mongoose is connected
const isConnected = () => mongoose.connection.readyState === 1;

/**
 * User Model Constructor & Static Functions
 */
export function dbUser(data) {
  this._id = 'mock_usr_' + Math.random().toString(36).substr(2, 9);
  this.id = this._id;
  this.isVerified = false;
  this.otpCode = '';
  this.otpExpires = null;
  this.resetOtpCode = '';
  this.resetOtpExpires = null;
  
  // Copy input fields
  if (data) {
    Object.assign(this, data);
  }

  this.save = async function () {
    const idx = mockUsers.findIndex((u) => u._id === this._id);
    if (idx !== -1) {
      mockUsers[idx] = this;
    } else {
      mockUsers.push(this);
    }
    return this;
  };
}

dbUser.findOne = async (query) => {
  if (isConnected()) {
    try {
      return await User.findOne(query);
    } catch (err) {
      console.error('Mongoose findOne error, using mock:', err.message);
    }
  }

  const key = Object.keys(query)[0];
  const val = query[key];
  const user = mockUsers.find((u) => u[key] === val) || null;

  if (user && !user.save) {
    user.save = async function () {
      const idx = mockUsers.findIndex((u) => u._id === this._id);
      if (idx !== -1) mockUsers[idx] = this;
      return this;
    };
  }
  return user;
};

dbUser.findById = async (id) => {
  if (isConnected()) {
    try {
      return await User.findById(id);
    } catch (err) {
      console.error('Mongoose findById error, using mock:', err.message);
    }
  }

  const user = mockUsers.find((u) => u._id === id || u.id === id) || null;
  if (user && !user.save) {
    user.save = async function () {
      const idx = mockUsers.findIndex((u) => u._id === this._id);
      if (idx !== -1) mockUsers[idx] = this;
      return this;
    };
  }
  return user;
};

dbUser.create = async (userData) => {
  if (isConnected()) {
    try {
      return await User.create(userData);
    } catch (err) {
      console.error('Mongoose create error, using mock:', err.message);
    }
  }

  const usr = new dbUser(userData);
  await usr.save();
  return usr;
};

/**
 * Playlist Model Constructor & Static Functions
 */
export function dbPlaylist(data) {
  this._id = 'mock_pl_' + Math.random().toString(36).substr(2, 9);
  this.id = this._id;
  this.tracks = [];

  if (data) {
    Object.assign(this, data);
  }

  this.save = async function () {
    const idx = mockPlaylists.findIndex((p) => p.user === this.user);
    if (idx !== -1) {
      mockPlaylists[idx] = this;
    } else {
      mockPlaylists.push(this);
    }
    return this;
  };
}

dbPlaylist.findOne = async (query) => {
  if (isConnected()) {
    try {
      return await Playlist.findOne(query);
    } catch (err) {
      console.error('Mongoose findOne error, using mock:', err.message);
    }
  }

  const playlist = mockPlaylists.find((p) => p.user === query.user) || null;
  if (playlist && !playlist.save) {
    playlist.save = async function () {
      const idx = mockPlaylists.findIndex((p) => p.user === this.user);
      if (idx !== -1) mockPlaylists[idx] = this;
      return this;
    };
  }
  return playlist;
};

dbPlaylist.create = async (playlistData) => {
  if (isConnected()) {
    try {
      return await Playlist.create(playlistData);
    } catch (err) {
      console.error('Mongoose create error, using mock:', err.message);
    }
  }

  const pl = new dbPlaylist(playlistData);
  await pl.save();
  return pl;
};
