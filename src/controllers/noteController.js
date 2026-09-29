import Note from "../models/Note.js";
export async function listNotes(req,res){ res.json(await Note.find().sort({date:1})); }
export async function saveNote(req,res){ const {date}=req.params; const text=req.body.text?.trim()||""; if(!text){ await Note.findOneAndDelete({date}); return res.status(204).end(); } const item=await Note.findOneAndUpdate({date},{text},{new:true,upsert:true,runValidators:true}); res.json(item); }
export async function deleteNote(req,res){ await Note.findOneAndDelete({date:req.params.date}); res.status(204).end(); }
