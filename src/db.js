import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function testDBConnection() {
    try {
        console.log("Checking Supabase connection...");

        // Perform a harmless query
        const { error } = await supabase
        .from("transactions")
        .select("*")
        .limit(1);

        if (error) {
        console.error("❌ Supabase connection failed:", error.message);
        } else {
        console.log("✅ Supabase connection OK");
        }
    } catch (err) {
        console.error("❌ Unexpected DB Error:", err.message);
    }
}