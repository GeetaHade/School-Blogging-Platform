# ThinkShare - This is a full-stack blogging platform with an integrated **AI Chatbot** that suggests activities based on:

- 🌦️ Current weather conditions (via OpenWeatherMap)
- 📍 Your geolocation (via browser Geolocation API)
- 📰 Real-time local events (via SerpAPI)
- 🧠 OpenAI responses tailored to the above context

Built using **React.js**, **Node.js**, **Express**, **Elasticsearch**, and **OpenAI APIs**.

---

## 🚀 Live Features

✅ Blog functionality:  
- Create posts  
- View all posts  
- JWT-based login/logout  
- Delete posts  

✅ Chatbot functionality:  
- Asks for geolocation access  
- Fetches live weather and events  
- Uses OpenAI to suggest activities  
- Chat-style UI with send/receive messages  

---

## 🧰 Tech Stack

### 💻 Frontend
- React.js
- React Router
- Material UI (MUI)
- Axios

### 🔧 Backend
- Node.js
- Express.js
- Elasticsearch (as blog database)
- JWT for Authentication
- OpenAI GPT-3.5
- OpenWeatherMap API
- SerpAPI (for real-time events/news)

---

---

## 🔐 API Keys Required

Sign up and get your API keys from the following:

- 🌦️ [OpenWeatherMap](https://openweathermap.org/api)
- 📰 [SerpAPI](https://serpapi.com/)
- 🧠 [OpenAI](https://platform.openai.com/)
- Optional: [ipapi](https://ipapi.co/) if you want IP-based fallback for location

---

## 🧪 Setup Instructions

### 1️⃣ Clone the Project

```bash
git clone https://github.com/yourusername/weather-chatbot-blog.git
cd weather-chatbot-blog
commands:
npm i
npm install
start elastic search

start backend 
node server.js

start frontend
nvm use 16
npm start

