const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook Verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Receive Messages
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
          reply = "وعليكم السلام ورحمة الله وبركاته 🌹";
        } else if (text.includes("الخدمات")) {
          reply =
            "📋 خدماتنا:\n\n1- برمجة المواقع\n2- برمجة التطبيقات\n3- بوتات واتساب\n4- حلول الذكاء الاصطناعي";
        }
      }

      await axios.post(
        `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: reply,
          },
        },
        {
          headers: {
            Authorization: Bearer ${WHATSAPP_TOKEN},
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

// Home
app.get("/", (req, res) => {
  res.send("✅ Code Plus WhatsApp Bot is Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
