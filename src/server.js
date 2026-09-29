import "dotenv/config";
import app from "./app.js";
import {connectDatabase} from "./config/db.js";
const port=Number(process.env.PORT)||3001;
try { await connectDatabase(); app.listen(port,()=>console.log(`API Entrelinhas: http://localhost:${port}/api`)); }
catch(error){ console.error("Não foi possível iniciar o backend:",error.message); process.exit(1); }
