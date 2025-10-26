---

## 📦 multilingual-chatbot

A multilingual AI chatbot with voice input, text-to-speech, and persistent chat history — supporting English, Hindi, and Marathi. Built with React and Node.js, this project enables spoken and typed conversations with a cinematic, professional UI.

---

## 🚀 Features

- 🎙️ Voice input via browser (Web Speech API)  
- 🧠 AI chatbot replies using OpenRouter API  
- 🔊 Text-to-speech with stop control  
- 💾 Persistent chat history via localStorage  
- 🌐 Language selector (English, Hindi, Marathi)  
- 📋 Chat utilities: Clear, Share, Copy, Download  

---

## 🛠️ Tech Stack

- **Frontend**: React, Bootstrap, Web Speech API, SpeechSynthesis  
- **Backend**: Node.js, Express  
- **AI API**: OpenRouter (GPT-based models)

---

## 📁 Project Structure

```
multilingual-chatbot/
├── backend/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── ChatBot.js
│   │   └── ChatBot.css
│   └── public/
├── package.json
└── README.md
```

---

## 🧑‍💻 How to Run Locally

### 🔹 1. Clone the Repo
```bash
git clone https://github.com/RahilJamadar/multilingual-chatbot.git
cd multilingual-chatbot
```

### 🔹 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 🔹 3. Set API Key

In `server.js`, replace:
```js
const OPENROUTER_API_KEY = "your-openrouter-key";
```

Get your key from [https://openrouter.ai](https://openrouter.ai)

---

### 🔹 4. Start Backend
```bash
cd backend
node server.js
```

### 🔹 5. Start Frontend
```bash
cd ../frontend
npm start
```

App runs at: [http://localhost:3000](http://localhost:3000)  
Backend runs at: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Deployment Tips

- Host frontend on GitHub Pages, Vercel, or Netlify  
- Host backend on Render, Railway, or Fly.io  
- Use HTTPS endpoints in production

---

## 📄 License

MIT — feel free to fork, remix, and build on it.

---