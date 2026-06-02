import mongoose from 'mongoose';

const connectDB = () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mood-music-streamer';

  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
};

export default connectDB;
