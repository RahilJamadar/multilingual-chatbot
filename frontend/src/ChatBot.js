import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import "./ChatBot.css";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("English");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const synthRef = useRef(window.speechSynthesis);

  const languages = ["English", "Hindi", "Marathi"].map(lang => ({ label: lang, value: lang }));
  const langCodeMap = { English: "en-US", Hindi: "hi-IN", Marathi: "mr-IN" };
  const getLangCode = (lang) => langCodeMap[lang] || "en-US";

  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = async () => {
    const langCode = getLangCode(language);

    if (["en-US", "hi-IN", "mr-IN"].includes(langCode)) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = langCode;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setListening(true);
      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        addMessage("user", spokenText);
        sendToBackend(spokenText);
      };
      recognition.onerror = (e) => console.error("Speech error:", e);
      recognition.onend = () => setListening(false);

      recognition.start();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "voice.wav");
          formData.append("language", language);

          const TRANSCRIBE_URL =
            window.location.hostname === "localhost"
              ? "http://localhost:5000/api/transcribe"
              : "https://your-deployed-url/api/transcribe";

          try {
            const res = await fetch(TRANSCRIBE_URL, { method: "POST", body: formData });
            const data = await res.json();
            addMessage("user", data.text);
            sendToBackend(data.text);
          } catch (err) {
            console.error("Transcription error:", err);
            addMessage("bot", "⚠️ Error: Unable to transcribe audio.");
          } finally {
            setListening(false);
          }
        };

        mediaRecorder.start();
        setListening(true);
        setTimeout(() => mediaRecorder.stop(), 5000);
      } catch (err) {
        console.error("Microphone error:", err);
        alert("Microphone access denied or not supported.");
      }
    }
  };

  const sendToBackend = async (text) => {
    const BACKEND_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:5000/api/chatbot"
        : "https://your-deployed-url/api/chatbot";

    setTyping(true);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, language }),
      });
      const data = await res.json();
      addMessage("bot", data.reply);
      speakReply(data.reply);
    } catch (err) {
      console.error("Backend error:", err);
      addMessage("bot", "⚠️ Error: Unable to fetch reply.");
    } finally {
      setTyping(false);
    }
  };

  const speakReply = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode(language);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setSpeaking(false);
  };

  const addMessage = (sender, text) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages((prev) => [...prev, { sender, text, timestamp }]);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  const shareChat = () => {
    const transcript = messages.map(m => `${m.sender === "user" ? "You" : "Bot"}: ${m.text}`).join("\n");
    if (navigator.share) {
      navigator.share({ title: "My Chat with AI", text: transcript });
    } else {
      alert("Sharing not supported on this device.");
    }
  };

  const copyChat = () => {
    const transcript = messages.map(m => `${m.sender === "user" ? "You" : "Bot"}: ${m.text}`).join("\n");
    navigator.clipboard.writeText(transcript);
    alert("Chat copied to clipboard!");
  };

  const downloadChat = () => {
    const transcript = messages.map(m => `${m.sender === "user" ? "You" : "Bot"}: ${m.text}`).join("\n");
    const blob = new Blob([transcript], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "chat-transcript.txt";
    link.click();
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      addMessage("user", inputText);
      sendToBackend(inputText);
      setInputText("");
      inputRef.current?.focus();
    }
  };

  return (
    <div className="container py-4 chatbot-dark">
      <h2 className="text-center mb-4 text-light">🤖 Multilingual AI Chatbot</h2>

      <div className="mb-3">
        <label className="form-label text-light">🌐 Language:</label>
        <Select
          options={languages}
          value={languages.find(l => l.value === language)}
          onChange={(e) => setLanguage(e.value)}
          placeholder="Choose language..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
        <button className={`btn btn-${listening ? "danger" : "primary"} btn-lg`} onClick={startListening}>
          {listening ? "🎤 Listening..." : "🎙️ Start Talking"}
        </button>
        <button className="btn btn-outline-warning" onClick={stopSpeaking} disabled={!speaking}>🔇 Stop Speaking</button>
        <button className="btn btn-outline-light" onClick={clearChat}>🧹 Clear Chat</button>
        <button className="btn btn-outline-info" onClick={shareChat}>🔗 Share Chat</button>
        <button className="btn btn-outline-success" onClick={copyChat}>📋 Copy Chat</button>
        <button className="btn btn-outline-secondary" onClick={downloadChat}>💾 Download Chat</button>
      </div>

      <div className="chat-box border rounded p-3 mb-3 bg-dark-subtle" style={{ maxHeight: "55vh", overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`d-flex mb-2 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}>
            <div className={`whatsapp-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
              <div className="bubble-text">{msg.text}</div>
              <div className="bubble-time">{msg.timestamp}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="d-flex justify-content-start mb-2">
            <div className="whatsapp-bubble bot-bubble">
              <div className="bubble-text">Typing...</div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleTextSubmit} className="d-flex mt-3">
        <input
          ref={inputRef}
          type="text"
          className="form-control me-2"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="btn btn-success">Send</button>
      </form>
    </div>
  );
};

export default ChatBot;