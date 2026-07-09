import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/local-store';
  let retries = 3;

  while (retries > 0) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected');
      return;
    } catch (error) {
      retries -= 1;
      console.error(`MongoDB connection failed (${3 - retries}/3):`, error.message);
      if (retries === 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

export default connectDB;
