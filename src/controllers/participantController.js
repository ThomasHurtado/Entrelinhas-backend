import Participant from "../models/Participant.js";
import Meeting from "../models/Meeting.js";
import {isValidBirthDate, INVALID_BIRTH_DATE} from "../utils/birthDate.js";
export async function updateParticipant(req,res){
  const body=req.body??{};
  const updates={};
  if(Object.hasOwn(body,"name")){
    if(typeof body.name!=="string"||!body.name.trim()) return res.status(400).json({message:"Nome é obrigatório."});
    updates.name=body.name.trim();
  }
  if(Object.hasOwn(body,"birthDate")){
    if(!isValidBirthDate(body.birthDate)) return res.status(400).json({message:INVALID_BIRTH_DATE});
    updates.birthDate=body.birthDate;
  }
  if(!Object.keys(updates).length) return res.status(400).json({message:"Informe nome ou data de nascimento."});
  const item=await Participant.findByIdAndUpdate(req.params.id,updates,{new:true,runValidators:true});
  if(!item) return res.status(404).json({message:"Participante não encontrado."});
  res.json(item);
}
export async function listParticipants(req,res){ const items=await Participant.find().sort({name:1}); res.json(items); }
export async function createParticipant(req,res){
  const {name,email,birthDate=null}=req.body??{};
  if(typeof name!=="string"||!name.trim()) return res.status(400).json({message:"Nome é obrigatório."});
  if(!isValidBirthDate(birthDate)) return res.status(400).json({message:INVALID_BIRTH_DATE});
  const item=await Participant.create({name:name.trim(),email:email?.trim()||"—",birthDate});
  res.status(201).json(item);
}
export async function deleteParticipant(req,res){ const item=await Participant.findByIdAndDelete(req.params.id); if(!item) return res.status(404).json({message:"Participante não encontrado."}); await Meeting.updateMany({},{$pull:{participants:item._id,attendance:{participant:item._id}}}); res.status(204).end(); }
