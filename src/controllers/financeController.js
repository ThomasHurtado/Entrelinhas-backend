import ClubFinance from "../models/ClubFinance.js";
export async function getFinance(req,res){
  const finance = await ClubFinance.findOneAndUpdate({key:"main"}, {$setOnInsert:{balance:0}}, {new:true,upsert:true});
  res.json(finance);
}
export async function updateFinance(req,res){
  const balance = Number(req.body.balance);
  if (!Number.isFinite(balance) || balance < 0) return res.status(400).json({message:"Informe um saldo válido."});
  const finance = await ClubFinance.findOneAndUpdate({key:"main"}, {balance}, {new:true,upsert:true,runValidators:true});
  res.json(finance);
}
