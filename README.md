# Pakistan Constitution AI Chatbot

An AI-powered chatbot that answers questions about the Constitution of Pakistan using RAG (Retrieval Augmented Generation) with Pinecone vector database and Google Gemini.

![Pakistan Constitution Bot](https://img.shields.io/badge/Pakistan-Constitution%20Bot-green)

## 🏗️ Project Structure

```
pak_constitution/
├── backend/           # FastAPI backend
│   ├── backend.py     # Main API server
│   ├── requirements.txt
│   └── .env.example   # Environment variables template
├── frontend/          # Next.js frontend
│   ├── app/
│   │   ├── page.tsx       # Main chat page
│   │   ├── contact/       # Contact page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── package.json
│   └── ...config files
└── README.md
```

## 🚀 Features

- **RAG-based Q&A**: Uses Pinecone for semantic search and Gemini for answer generation
- **ChatGPT-style UI**: Clean, modern interface with sidebar navigation
- **Responsive Design**: Works on desktop and mobile
- **Pakistan Theme**: Green color scheme inspired by Pakistan's flag

## 🛠️ Setup

### Backend (FastAPI)

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

5. Add your API keys to `.env`:
   ```
   PINECONE_API_KEY=your_pinecone_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

6. Run the server:
   ```bash
   uvicorn backend:app --reload
   ```

Backend will be available at `http://localhost:8000`

### Frontend (Next.js)

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:3000`

## 🌐 Deployment

### Backend on Railway

1. Push to GitHub
2. Connect Railway to your GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy!

### Frontend on Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
4. Deploy!

## 📝 API Endpoints

- `POST /ask` - Ask a question about the Constitution
  ```json
  {
    "question": "What are the fundamental rights?"
  }
  ```

- `GET /health` - Health check endpoint

## 🛡️ Tech Stack

- **Backend**: FastAPI, Pinecone, Google Gemini
- **Frontend**: Next.js 16, Tailwind CSS, TypeScript
- **Vector DB**: Pinecone (llama-text-embed-v2)
- **LLM**: Google Gemini 2.5 Flash

## 👨‍💻 Developed By

**Echytech Solutions**

---

Made with ❤️ for Pakistan
