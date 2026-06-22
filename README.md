# 🏏 Cricket Chat Bot
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.12-yellow?logo=python)
![License](https://img.shields.io/badge/License-MIT-orange)

> An AI-powered Cricket Chat Bot that delivers intelligent cricket conversations, player insights, team information, and real-time web-enhanced responses using Groq LLM, FastAPI, and Next.js.

---

# 🌐 Live Demo

### 🚀 Live Website

Frontend: https://cricket-chat-bot-three.vercel.app/

Backend API: https://cricket-chat-bot-backend.onrender.com

GitHub Repository: https://github.com/Asjadkhan19/cricket-chat-bot


# 📌 Project Overview

Cricket Chat Bot is a full-stack AI web application designed for cricket enthusiasts. It combines the power of Large Language Models (LLMs) with real-time cricket search capabilities to provide accurate, engaging, and context-aware answers about cricket.

Unlike a traditional chatbot, this project maintains conversation history, performs intelligent web searches when required, and presents a modern, responsive user interface for an enhanced user experience.

---

# ❤️ Built With

- Next.js
- React
- TypeScript
- FastAPI
- Python
- Groq LLM
- Render
- Vercel

---

# 💡 Why I Built This

This project was developed to explore modern AI application development using Large Language Models while creating a practical solution for cricket enthusiasts. It demonstrates full-stack development, AI integration, API design, deployment, and responsive user interface development in a production-ready application.




# 🚀 Project Status

✅ Backend Successfully Deployed on Render

✅ Frontend Successfully Deployed on Vercel

✅ Production Ready

✅ Responsive UI

✅ AI Powered using Groq LLM

-----

# ✨ Features

* 🤖 AI-powered cricket conversations using Groq LLM
* 🌐 Real-time web search for up-to-date cricket information
* 💬 Persistent chat sessions with conversation memory
* 🏏 Player Explorer with searchable player database
* 🌍 Team Explorer with international cricket teams
* 📊 Intelligent response cards for structured information
* ⚡ Fast API responses using FastAPI
* 🎨 Modern responsive UI built with Next.js and React
* 🌙 Dark-themed cricket-inspired interface
* 🔄 Typing indicators and smooth animations
* 📱 Mobile-friendly responsive design
* 🔒 Secure environment variable management
* 🚀 Production-ready deployment configuration

---

# 🛠 Tech Stack

## Frontend

* Next.js 15
* React
* TypeScript
* CSS
* Responsive Design

## Backend

* FastAPI
* Python
* Uvicorn

## AI & APIs

* Groq LLM API
* DuckDuckGo Search
* BeautifulSoup
* Requests

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# 📂 Project Structure

```text
cricket-chat-bot/
│
├── backend/
│   ├── app/
│   ├── services/
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── README.md
├── DEPLOYMENT.md
└── render.yaml
```

---

# 🏗 Architecture

```text
                User
                  │
                  ▼
         Next.js Frontend
                  │
                  ▼
           FastAPI Backend
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
 Groq LLM API          Web Search Engine
      │                       │
      └───────────┬───────────┘
                  ▼
           AI Response Engine
                  │
                  ▼
               Frontend
```

---

# 📸 Screenshots

## Landing Page




---

## Chat Interface





---

## Player Explorer




---

## Team Explorer




---

# ⚙ Installation

## Clone the repository

```bash
git clone https://github.com/Asjadkhan19/cricket-chat-bot.git
```

```bash
cd cricket-chat-bot
```

---

# Backend Setup

```bash
cd backend
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn app.main:app --reload
```

Backend runs at
http://127.0.0.1:8000/

```
https://cricket-chat-bot-backend.onrender.com
```

---

# Frontend Setup

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run frontend

```bash
npm run dev
```

Frontend runs at

```
http://localhost:3000/
```

---

# 🔑 Environment Variables

## Backend (.env)

```env
GROQ_API_KEY=your_groq_api_key
HOST=0.0.0.0
ALLOWED_ORIGINS=https://cricket-chat-bot-three.vercel.app
```

---

## Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://cricket-chat-bot-backend.onrender.com
```

---

# 🚀 Deployment

## Backend

Deploy on **Render**

Build Command

```text
pip install -r backend/requirements.txt
```

Start Command

```text
uvicorn backend.app.main:app --host $HOST --port $PORT
```

Health Check

```text
/health
```

---

## Frontend

Deploy on **Vercel**

Root Directory

```text
frontend
```

Environment Variable

```env
NEXT_PUBLIC_API_URL=https://cricket-chat-bot-backend.onrender.com
```

Live Website

https://cricket-chat-bot-three.vercel.app/
---

# 📡 API Endpoints

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| GET    | /                 | Root API           |
| GET    | /health           | Health Check       |
| POST   | /api/chat         | Chat Endpoint      |
| POST   | /api/clear-memory | Clear Conversation |

---

# 🎯 Future Improvements

* Voice interaction
* Live cricket scores
* Match prediction using AI
* Player comparison dashboard
* User authentication
* Favourite chats
* Multi-language support
* Streaming AI responses
* Statistics dashboard
* Dark/Light themes

---

# 📈 Project Highlights

* Modular FastAPI backend
* Next.js 15 frontend
* TypeScript support
* AI-powered responses
* Responsive design
* Production-ready deployment
* Clean folder structure
* Environment variable support
* Lint and build verified
* GitHub-ready documentation

---

# 📊 Repository Status

- ✅ Production Ready
- ✅ Fully Responsive
- ✅ AI Powered
- ✅ TypeScript Enabled
- ✅ Environment Variables Configured
- ✅ Cloud Deployed
- ✅ Clean Project Structure

---

# 🧠 Skills Demonstrated

- Full Stack Development
- AI Integration
- REST API Development
- FastAPI
- Next.js
- TypeScript
- Python
- Prompt Engineering
- Deployment
- Git & GitHub
- Responsive UI Design


# 👨‍💻 Author

**Asjad Khan**

Computer Science Engineering Student

GitHub:
https://github.com/Asjadkhan19

LinkedIn:
https://www.linkedin.com/in/asjad-khan-54069a397/

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

Made with ❤️ by **Asjad Khan**

---