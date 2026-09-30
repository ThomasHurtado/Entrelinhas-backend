import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {type: String, default: ""},
  text: {type: String, default: ""}
}, {timestamps: true});

export default mongoose.model("NotebookPage", schema);
