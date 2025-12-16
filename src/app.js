import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { processUpdate } from "./bot.js";
import { testDBConnection } from "./db.js";

const app = express();
app.use(express.json());

await testDBConnection();

app.post("/webhook", processUpdate);
app.get("/", (req, res) => res.send("Finance Bot with Supabase is running"));

app.listen(process.env.PORT || 3000, () => console.log("Server running..."));
