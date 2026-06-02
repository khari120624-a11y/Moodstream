import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mood-music-streamer';
    // Mask password in logs if any
    const maskedConnStr = connStr.replace(/:([^@:]+)@/, ':****@');
    console.log(`Attempting connection to MongoDB at: ${maskedConnStr}`);
    
    const conn = await mongoose.connect(connStr);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // We don't crash the server, just log the error so mock-data mode is still available
  }
};

export default connectDB;
