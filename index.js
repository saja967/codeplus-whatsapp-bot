const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook Verified");
        return res.status(200).send(challenge);
    }

    res.sendStatus(403);
});
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (
      body.object &&
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const from = message.from;

      let reply = "👋 أهلاً بك في Code Plus.\n\nكيف يمكنني مساعدتك؟";

      if (message.type === "text") {
        const text = message.text.body.toLowerCase();

        if (text.includes("السلام") || text.includes("مرحبا")) {
          reply = "وعليكم السلام 👋\nأهلاً بك في Code Plus.";
        } else if (text.includes("الخدمات")) {
          reply =
            "📋 خدماتنا:\n\n1- برمجة مواقع\n2- برمجة تطبيقات\n3- بوتات واتساب\n4- الذكاء الاصطناعي";
        }
      }

      await axios.post(
       `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages,`
        {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: reply,
          },
        },
        {
          headers: {
            Authorization: Bearer ${ACCESS_TOKEN},
            "Content-Type": "application/json",
          },
        }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.sendStatus(500);
  }
});
app.get("/", (req, res) => {
  res.send("✅ Code Plus WhatsApp Bot is Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
