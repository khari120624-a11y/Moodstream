import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        mood: {
          type: String,
          default: 'chill',
        },
        lastActive: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentTrack: {
      spotifyId: String,
      title: String,
      artist: String,
      album: String,
      imageUrl: String,
      previewUrl: String,
      mood: String,
      language: String,
      playVideo: Boolean,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
