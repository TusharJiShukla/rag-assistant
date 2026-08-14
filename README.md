# RAG Assistant 🤖

A **Retrieval-Augmented Generation (RAG)** web application built with **Next.js** and the **Google Gemini API**. Upload any document (PDF or TXT) and have a multi-turn conversation with an AI that answers strictly based on the content of your document.

![RAG Assistant Demo](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js) ![Gemini API](https://img.shields.io/badge/Gemini-API-blue?style=for-the-badge&logo=google) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)

---

## ✨ Features

- 📄 **Document Upload** — Upload any PDF or TXT file to ground the AI on your data
- 💬 **Multi-turn Chat** — Ask unlimited follow-up questions in a ChatGPT-style interface
- 🛡️ **Guardrails** — The AI is strictly constrained to only answer from the uploaded document. It explicitly refuses out-of-context questions
- 🔄 **Context Memory** — Full conversation history is sent with each request for coherent multi-turn answers
- 📁 **File Switching** — Upload a new file at any time to reset and start a fresh conversation
- ⚡ **Lightweight Model** — Uses `gemini-flash-lite-latest` for high rate limits and fast responses

---

## 🏗️ Architecture

```
User → Next.js Frontend (React)
         ↓
       Next.js Server Actions (app/actions.js)
         ↓
       Google Gemini File Search Store API
         ↓  (stores document as searchable vector index)
       Gemini Flash Lite Model
         ↓  (retrieves relevant chunks + generates answer)
       Response → Frontend Chat UI
```

This is a **serverless RAG pipeline** — no external vector database required. Gemini's native File Grounding API handles document vectorization and retrieval internally, keeping the architecture clean and cost-effective.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API Key (free at [aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/TusharJiShukla/rag-assistant.git
cd rag-assistant

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env.local file in the root
echo 'GOOGLE_API_KEY="your_gemini_api_key_here"' > .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 How It Works (RAG Explained)

1. **Ingest:** When you upload a document, the backend calls `ai.fileSearchStores.uploadToFileSearchStore()`. Gemini internally chunks and vectorizes the document.
2. **Query:** When you ask a question, the full chat history is sent to the backend as structured `user`/`model` message pairs.
3. **Retrieve:** The `$fileSearch` tool queries the document's vector store for the most semantically relevant chunks based on your question.
4. **Generate:** The retrieved chunks are fed to the Gemini model along with a strict `systemInstruction` guardrail. The model generates an answer grounded *only* in the document.

---

## 📁 Project Structure

```
rag-assistant/
├── app/
│   ├── actions.js      # Server Actions — Gemini API integration & guardrails
│   ├── page.js         # Frontend — ChatGPT-style chat UI
│   ├── layout.js       # Root layout with metadata
│   └── globals.css     # Global styles
├── .env.local          # API keys (not committed)
├── next.config.js      # Next.js configuration
└── package.json
```

---

## 🛡️ Guardrails Implementation

The AI is restricted using a `systemInstruction` injected at the model config level:

```js
systemInstruction: "You are a specialized document QA assistant. You must ONLY answer questions based on the provided document. Do NOT use outside knowledge. If the answer is not in the document, explicitly state 'I cannot answer this based on the provided document.'"
```

This means asking *"Who is the Prime Minister of India?"* will result in a graceful refusal rather than a hallucinated answer.

---

## 🤝 Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | Full-stack framework (App Router + Server Actions) |
| **React 19** | Frontend UI with hooks |
| **Google Gemini API** | Document grounding, retrieval, and text generation |
| **react-markdown** | Rendering formatted AI responses |
| **Tailwind CSS 4** | Utility-first styling |

---

## 📜 License

MIT License — feel free to use and modify.
