const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENROUTER_API_KEY = "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";

const upload = multer({ dest: "uploads/" });

// 🔹 Chatbot route
app.post("/api/chatbot", async (req, res) => {
  const { query, language = "English" } = req.body;
  const prompt = `You are a multilingual AI chatbot. Reply in ${language}. Keep answers short, friendly, and conversational. User said: ${query}`;

  try {
    const response = await require("axios").post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    console.error("❌ Chatbot error:", err.message);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

// 🔹 Transcription route
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  const langMap = {
    Hindi: "hi", Marathi: "mr", Tamil: "ta", Telugu: "te", Gujarati: "gu",
    Bengali: "bn", Punjabi: "pa", Malayalam: "ml", Urdu: "ur", Kannada: "kn",
    Konkani: "kok", Assamese: "as", Odia: "or", Sanskrit: "sa"
  };

  const lang = langMap[req.body.language] || "hi";
  const audioPath = req.file.path;

  exec(`python transcribe.py ${lang} ctc ${audioPath}`, (err, stdout, stderr) => {
    fs.unlinkSync(audioPath);
    if (err) {
      console.error("🛑 Transcription error:", stderr);
      return res.status(500).json({ error: "Transcription failed" });
    }
    res.json({ text: stdout.trim() });
  });
});

// 🔹 Homepage
app.get("/", (req, res) => {
  res.send("✅ Multilingual Chatbot API is running.");
});

app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));