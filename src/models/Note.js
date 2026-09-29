import mongoose from "mongoose";
const schema = new mongoose.Schema({ date:{type:String,required:true,unique:true,match:/^\d{4}-\d{2}-\d{2}$/}, text:{type:String,trim:true,default:""} }, {timestamps:true});
export default mongoose.model("Note", schema);
