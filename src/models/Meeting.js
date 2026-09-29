import mongoose from "mongoose";
const attendanceSchema = new mongoose.Schema({ participant:{type:mongoose.Schema.Types.ObjectId,ref:"Participant",required:true}, present:{type:Boolean,default:false} }, {_id:false});
const schema = new mongoose.Schema({ title:{type:String,required:true,trim:true}, date:{type:String,required:true,match:/^\d{4}-\d{2}-\d{2}$/}, participants:[{type:mongoose.Schema.Types.ObjectId,ref:"Participant"}], attendance:[attendanceSchema] }, {timestamps:true});
export default mongoose.model("Meeting", schema);
