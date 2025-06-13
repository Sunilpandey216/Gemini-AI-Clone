const typingForm = document.querySelector(".typing-form");
const ChatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemebtn = document.querySelector("#theme-toggle-button");
const deletechatbtn = document.querySelector("#delete-chat-button");
const speakerToggle = document.querySelector("#toggle-speaker");

let isSpeakerOn = true;

const API_KEY = "AIzaSyCSGOFNBD9dCwwNXETgN2G7nhBhXeK3PXE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Toggle Light/Dark Mode
toggleThemebtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  toggleThemebtn.textContent = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

// Toggle Speaker
speakerToggle.addEventListener("click", () => {
  isSpeakerOn = !isSpeakerOn;
  speakerToggle.textContent = isSpeakerOn ? "volume_up" : "volume_off";
});

// Clear chat
deletechatbtn.addEventListener("click", () => {
  ChatContainer.innerHTML = "";
});

// Handle user form input
typingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("input");
  const prompt = input.value.trim();
  if (!prompt) return;

  addMessage("user", prompt);
  input.value = "";

  const placeholder = addMessage("bot", "", true);
  const reply = await getGeminiResponse(prompt);
  placeholder.classList.remove("typing");

  await typeLineByLine(placeholder, reply);
  speakText(reply);
});

// Handle suggestion clicks
suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", async () => {
    const prompt = suggestion.querySelector(".text").textContent;
    addMessage("user", prompt);

    const placeholder = addMessage("bot", "", true);
    const reply = await getGeminiResponse(prompt);
    placeholder.classList.remove("typing");

    await typeLineByLine(placeholder, reply);
    speakText(reply);
  });
});

// Send prompt to Gemini API
async function getGeminiResponse(prompt) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
  } catch (err) {
    console.error(err);
    return "❌ Error: Failed to connect to Gemini API.";
  }
}

// Add message to chat
function addMessage(sender, text, isPlaceholder = false) {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "user-message" : "bot-message";
  msg.textContent = text;
  if (isPlaceholder) msg.classList.add("typing");
  ChatContainer.appendChild(msg);
  ChatContainer.scrollTop = ChatContainer.scrollHeight;
  return msg;
}

// 🔊 Speak full text (TTS)
function speakText(text) {
  if (!isSpeakerOn || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US"; // or "hi-IN" for Hindi
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}

// 🧠 Line-by-line typing effect
async function typeLineByLine(element, text) {
  const lines = text.split("\n").filter(line => line.trim() !== "");
  element.innerHTML = "";

  for (const line of lines) {
    const lineEl = document.createElement("div");
    element.appendChild(lineEl);
    await typeText(lineEl, line);
  }

  ChatContainer.scrollTop = ChatContainer.scrollHeight;
}

// ⌨️ Typing animation for single line
function typeText(el, text) {
  return new Promise((resolve) => {
    let index = 0;
    const speed = 15; // typing speed

    const interval = setInterval(() => {
      if (index < text.length) {
        el.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}
