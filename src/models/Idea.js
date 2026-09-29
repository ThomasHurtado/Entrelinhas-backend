import mongoose from "mongoose";
const schema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
}, { timestamps: true });
export default mongoose.model("Idea", schema);
