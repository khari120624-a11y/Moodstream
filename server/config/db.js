import mongoose from 'mongoose';

const connectDB = () => {
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mood-music-streamer';

  // Mask password in logs if any
  const maskedConnStr = mongoURI.replace(/:([^@:]+)@/, ':****@');
  console.log(`Attempting connection to MongoDB at: ${maskedConnStr}`);

  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
};

export default connectDB;
