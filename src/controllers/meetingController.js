import Meeting from "../models/Meeting.js";
import Participant from "../models/Participant.js";
export async function deleteMeeting(req,res){
  const item=await Meeting.findByIdAndDelete(req.params.id);
  if(!item) return res.status(404).json({message:"Encontro não encontrado."});
  res.status(204).end();
}
export async function listMeetings(req,res){ const items=await Meeting.find().sort({date:1}); res.json(items); }
export async function createMeeting(req,res){ const {title,date,participantIds=[]}=req.body; if(!title?.trim()||!date||!participantIds.length) return res.status(400).json({message:"Título, data e participantes são obrigatórios."}); const valid=await Participant.find({_id:{$in:participantIds}}).select("_id"); if(!valid.length) return res.status(400).json({message:"Nenhum participante válido."}); const ids=valid.map(p=>p._id); const item=await Meeting.create({title:title.trim(),date,participants:ids,attendance:ids.map(id=>({participant:id,present:false}))}); res.status(201).json(item); }
export async function updateAttendance(req,res){ const {id,participantId}=req.params; const meeting=await Meeting.findById(id); if(!meeting) return res.status(404).json({message:"Encontro não encontrado."}); const row=meeting.attendance.find(a=>String(a.participant)===participantId); if(!row) return res.status(404).json({message:"Participante não pertence a este encontro."}); row.present=Boolean(req.body.present); await meeting.save(); res.json(meeting); }
