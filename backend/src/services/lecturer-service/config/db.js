import mongoose from "mongoose";

export const dbConnection = async () => {
  const mongoUri = process.env.MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`lecturer db connected ${conn.connection.host}`);
  } catch (err) {
    console.log(`lecturer db connection error ${err.message}`);
    process.exit(1);
  }
};
