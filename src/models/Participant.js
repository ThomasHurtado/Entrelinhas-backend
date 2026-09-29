import mongoose from "mongoose";
import {isValidBirthDate, INVALID_BIRTH_DATE} from "../utils/birthDate.js";
const schema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  email:{type:String,trim:true,default:"—"},
  birthDate:{type:String,default:null,validate:{validator:isValidBirthDate,message:INVALID_BIRTH_DATE}},
  joined:{type:Date,default:Date.now}
}, {timestamps:true});
export default mongoose.model("Participant", schema);
