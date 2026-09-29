import mongoose from "mongoose";
const schema = new mongoose.Schema({
  key: { type: String, default: "main", unique: true },
  balance: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
export default mongoose.model("ClubFinance", schema);
