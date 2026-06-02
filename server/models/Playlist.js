import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: [true, 'Song title is required'],
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
  },
  album: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  previewUrl: {
    type: String,
    default: '',
  },
  mood: {
    type: String,
    default: '',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const playlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One saved playlist per user
    },
    tracks: [trackSchema],
  },
  {
    timestamps: true,
  }
);

const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;
