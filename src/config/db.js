import mongoose from "mongoose";
export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI não configurada.");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("MongoDB conectado.");
}
