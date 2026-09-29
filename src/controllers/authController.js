import bcrypt from "bcryptjs";
import User from "../models/User.js";
export async function login(req,res){ const {email,password}=req.body; if(!email||!password) return res.status(400).json({message:"E-mail e senha são obrigatórios."}); const user=await User.findOne({email:email.toLowerCase()}); if(!user||!(await bcrypt.compare(password,user.passwordHash))) return res.status(401).json({message:"E-mail ou senha incorretos."}); res.json({user:{id:user._id,email:user.email}}); }
