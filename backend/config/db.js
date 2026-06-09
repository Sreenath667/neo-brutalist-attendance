const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.SKIP_DB === 'true') {
    console.warn('SKIP_DB=true — skipping MongoDB connection for local testing.');
    return Promise.resolve(null);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Fail fast if server is unreachable
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_TIMEOUT_MS, 10) || 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Throw the error so caller can decide whether to continue without DB (useful for local testing)
    throw error;
  }
};

module.exports = connectDB;
