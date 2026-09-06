const mongoose = require('mongoose');

let connectionPromise;

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  if (process.env.NODE_ENV !== 'production') {
    return 'mongodb://localhost:27017/business_management';
  }
  throw new Error('MONGODB_URI is not configured');
}

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(getMongoUri()).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
  return mongoose.connection;
}

module.exports = { connectDatabase };
