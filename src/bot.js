import axios from "axios";
import { log, error } from "./utils/logger.js";
import { handleMessage } from "./router.js";

export async function processUpdate(req, res) {
    try {
        const update = req.body;

        if (!update.message) return res.sendStatus(200);

        const chatId = update.message.chat.id;
        const text = update.message.text;

        log("Incoming:", text);

        const reply = await handleMessage(chatId, text);

        await axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
            {
                chat_id: chatId,
                text: reply,
            }
        );

        res.sendStatus(200);
    } catch (err) {
        error(err);
        res.sendStatus(500);
    }
}
