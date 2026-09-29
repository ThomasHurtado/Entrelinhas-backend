import Idea from "../models/Idea.js";
export async function listIdeas(req,res){ res.json(await Idea.find().sort({createdAt:-1})); }
export async function createIdea(req,res){
  const text = String(req.body.text || "").trim(); const author = String(req.body.author || "").trim();
  if (!text || !author) return res.status(400).json({message:"Texto e autor são obrigatórios."});
  res.status(201).json(await Idea.create({text,author}));
}
export async function updateIdeaStatus(req,res){
  const {status} = req.body;
  if (!["pending","accepted","rejected"].includes(status)) return res.status(400).json({message:"Status inválido."});
  const idea = await Idea.findByIdAndUpdate(req.params.id,{status},{new:true,runValidators:true});
  if (!idea) return res.status(404).json({message:"Ideia não encontrada."});
  res.json(idea);
}
export async function deleteIdea(req,res){
  const idea=await Idea.findByIdAndDelete(req.params.id); if(!idea) return res.status(404).json({message:"Ideia não encontrada."}); res.status(204).end();
}
