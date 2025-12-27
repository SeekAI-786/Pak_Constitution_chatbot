'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { 
  Send, 
  Bot,
  User,
  Loader2,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Menu,
  X
} from 'lucide-react'

// =====================================================
// TYPES
// =====================================================
interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface ApiResponse {
  question: string
  answer: string
  citations: any[]
  num_sources: number
}

// =====================================================
// CONSTANTS
// =====================================================
const SUGGESTED_QUESTIONS = [
  "What are the fundamental rights?",
  "What does Article 25 state?",
  "Who can amend the Constitution?"
]

// TODO: Add your actual links here
const SOCIAL_LINKS = {
  github: "https://github.com/YOUR_GITHUB",
  linkedin: "https://linkedin.com/in/YOUR_LINKEDIN",
  echytech: "https://echytech.com"
}

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const handleSend = async (question?: string) => {
    const messageText = question || input.trim()
    if (!messageText || loading) return

    // Mark as started to hide welcome screen
    if (!hasStarted) setHasStarted(true)

    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageText })
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data: ApiResponse = await res.json()

      const botMessage: Message = {
        id: generateId(),
        type: 'bot',
        content: data.answer,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: generateId(),
        type: 'bot',
        content: "I'm sorry, I couldn't connect to the server. Please try again later.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* =====================================================
          SIDEBAR (Desktop)
          ===================================================== */}
      <aside className="hidden md:flex flex-col w-56 bg-green-700 text-white flex-shrink-0">
        {/* Logo & Title */}
        <div className="p-3 border-b border-green-600">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
              PK
            </div>
            <div>
              <h1 className="font-semibold text-sm leading-tight">Constitution of Pakistan</h1>
              <p className="text-xs text-green-200">AI Assistant</p>
            </div>
          </Link>
        </div>

        {/* Quick Questions */}
        <div className="flex-1 p-3 overflow-y-auto">
          <p className="text-xs text-green-200 mb-2 uppercase tracking-wide">Quick Questions</p>
          <div className="space-y-1.5">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSend(question)}
                disabled={loading}
                className="w-full text-left px-2.5 py-2 text-xs bg-green-600 hover:bg-green-500 rounded-lg transition-colors disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Links */}
        <div className="p-3 border-t border-green-600">
          <div className="flex items-center gap-2 mb-3">
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs transition-colors">
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs transition-colors">
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn
            </a>
          </div>
          <Link href="/contact" className="w-full flex items-center justify-center gap-1.5 py-2 bg-white text-green-700 hover:bg-green-50 rounded-lg text-xs font-medium transition-colors">
            <Mail className="w-3.5 h-3.5" />
            Contact Us
          </Link>
          <a href={SOCIAL_LINKS.echytech} target="_blank" rel="noopener noreferrer" className="block text-xs text-green-200 hover:text-white text-center mt-3">
            by Echytech Solutions
          </a>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT AREA
          ===================================================== */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-green-700 text-white px-3 py-2 flex items-center justify-between flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
              PK
            </div>
            <span className="font-semibold text-sm">Constitution AI</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-green-600 rounded-lg">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Menu */}
        {sidebarOpen && (
          <div className="md:hidden bg-green-700 text-white px-3 py-2 border-t border-green-600 flex-shrink-0">
            <p className="text-xs text-green-200 mb-2">Quick Questions:</p>
            <div className="space-y-1.5 mb-3">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => { handleSend(question); setSidebarOpen(false); }}
                  disabled={loading}
                  className="w-full text-left px-2.5 py-1.5 text-xs bg-green-600 hover:bg-green-500 rounded-lg"
                >
                  {question}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-green-600">
              <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-600 rounded-lg">
                <Github className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-600 rounded-lg">
                <Linkedin className="w-4 h-4" />
              </a>
              <Link href="/contact" className="ml-auto px-3 py-1 bg-white text-green-700 rounded-lg text-xs font-medium" onClick={() => setSidebarOpen(false)}>
                Contact Us
              </Link>
            </div>
          </div>
        )}

        {/* =====================================================
            MAIN CHAT AREA
            ===================================================== */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          
          {/* Chat Messages or Welcome Screen */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto"
          >
            {!hasStarted ? (
              /* =====================================================
                 WELCOME SCREEN - Centered
                 ===================================================== */
              <div className="h-full flex flex-col items-center justify-center p-4">
                {/* Logo */}
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">
                  Pakistan Constitution Bot
                </h1>
                
                {/* Subtitle */}
                <p className="text-gray-500 text-sm mb-8">
                  Developed by{' '}
                  <a 
                    href={SOCIAL_LINKS.echytech} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline font-medium"
                  >
                    Echytech Solutions
                  </a>
                </p>

                {/* Suggested Questions - Only on mobile or smaller screens */}
                <div className="w-full max-w-md md:hidden">
                  <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wide">
                    Try asking
                  </p>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(question)}
                        disabled={loading}
                        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl text-sm text-gray-700 hover:text-green-700 transition-all disabled:opacity-50"
                      >
                        <MessageCircle className="w-4 h-4 inline mr-2 text-green-600" />
                        {question}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desktop hint */}
                <p className="hidden md:block text-xs text-gray-400 mt-4">
                  Select a question from the sidebar or type your own below
                </p>
              </div>
            ) : (
              /* =====================================================
                 CHAT MESSAGES
                 ===================================================== */
              <>
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`py-4 px-4 md:px-8 ${message.type === 'bot' ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="max-w-3xl mx-auto flex gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'bot' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {message.type === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {message.type === 'bot' ? 'Constitution Bot' : 'You'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="py-4 px-4 md:px-8 bg-gray-50">
                  <div className="max-w-3xl mx-auto flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1 py-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* =====================================================
            INPUT AREA
            ===================================================== */}
        <div className="border-t border-gray-200 bg-white p-3">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the Constitution of Pakistan..."
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm py-1"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-all disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      </div>
    </div>
  )
}
