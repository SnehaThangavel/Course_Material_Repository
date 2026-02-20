const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn) {
    return cachedConn;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Disable buffering for serverless
    });
    cachedConn = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // In serverless, we let the caller handle the error or retry
    throw error;
  }
};

module.exports = connectDB;
