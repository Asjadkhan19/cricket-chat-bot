# Deployment Manual - CricketGPT

This manual provides instructions for deploying CricketGPT publicly. The application is split into a **FastAPI backend** (deployed on Render) and a **Next.js frontend** (deployed on Vercel).

---

## 🚀 Part 1: Deploying the Backend on Render

1. Create a free account at [Render](https://render.com/).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository containing the CricketGPT code.
4. Render will automatically parse the `render.yaml` configuration at the root of the project.
5. In the Render Dashboard under **Environment Variables**, configure:
   * `GROQ_API_KEY`: Your production Groq API Key.
   * `ALLOWED_ORIGINS`: Commas-separated list of allowed origins (e.g. `https://your-app.vercel.app`).
   * `ENVIRONMENT`: `production`
6. Click **Deploy**. Render will install the dependencies, start the FastAPI server, and give you a public URL (e.g., `https://cricket-gpt-backend.onrender.com`).

---

## 🎨 Part 2: Deploying the Frontend on Vercel

1. Create a free account at [Vercel](https://vercel.com/).
2. Click **Add New** and choose **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** option to: `cricket-chat-bot` (the subfolder containing your Next.js code).
5. In the **Environment Variables** section, add:
   * `NEXT_PUBLIC_API_URL`: Your deployed backend Render URL (e.g., `https://cricket-gpt-backend.onrender.com`).
6. Click **Deploy**. Vercel will optimize and compile the Next.js bundle and provide your public URL.

---

## 🔐 Environment Variables Summary

| Scope | Variable | Purpose | Example / Value |
| :--- | :--- | :--- | :--- |
| **Backend** | `GROQ_API_KEY` | Authenticates with the Groq inference service | `gsk_...` |
| **Backend** | `ALLOWED_ORIGINS` | Comma-separated CORS whitelist | `https://your-app.vercel.app` |
| **Backend** | `ENVIRONMENT` | Runtime mode selector | `production` |
| **Frontend** | `NEXT_PUBLIC_API_URL` | Endpoint of the FastAPI backend | `https://cricket-gpt-backend.onrender.com` |
