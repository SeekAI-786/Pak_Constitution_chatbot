'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { 
  Mail, 
  User, 
  MessageSquare, 
  Send,
  Github,
  Linkedin,
  CheckCircle,
  Loader2,
  Menu,
  X,
  MessageCircle,
  MapPin,
  Phone,
  Clock
} from 'lucide-react'

// TODO: Add your actual links here
const SOCIAL_LINKS = {
  github: "https://github.com/YOUR_GITHUB",
  linkedin: "https://linkedin.com/in/YOUR_LINKEDIN",
  echytech: "https://echytech.com"
}

const EMAIL_ENDPOINT = ""

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (!EMAIL_ENDPOINT) {
        console.log('Form data:', formData)
      }
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      setError('Failed to send message. Please try again.')
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-56 bg-green-700 text-white flex-shrink-0">
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

        <div className="flex-1 p-3">
          <p className="text-xs text-green-200 mb-2 uppercase tracking-wide">Navigation</p>
          <div className="space-y-1.5">
            <Link href="/" className="w-full flex items-center gap-2 text-left px-2.5 py-2 text-xs bg-green-600 hover:bg-green-500 rounded-lg transition-colors">
              <MessageCircle className="w-4 h-4" />
              Back to Chat
            </Link>
          </div>
        </div>

        <div className="p-3 border-t border-green-600">
          <div className="flex items-center gap-2 mb-2">
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-600 rounded-lg transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-600 rounded-lg transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <div className="p-1.5 bg-green-500 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <a href={SOCIAL_LINKS.echytech} target="_blank" rel="noopener noreferrer" className="text-xs text-green-200 hover:text-white block">
            by Echytech Solutions
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
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

        {sidebarOpen && (
          <div className="md:hidden bg-green-700 text-white px-3 py-2 border-t border-green-600 flex-shrink-0">
            <Link href="/" className="w-full flex items-center gap-2 text-left px-2.5 py-1.5 text-xs bg-green-600 hover:bg-green-500 rounded-lg mb-2">
              <MessageCircle className="w-4 h-4" />
              Back to Chat
            </Link>
            <div className="flex items-center gap-2 pt-2 border-t border-green-600">
              <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-600 rounded-lg">
                <Github className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-600 rounded-lg">
                <Linkedin className="w-4 h-4" />
              </a>
              <span className="text-xs text-green-200 ml-auto">by Echytech</span>
            </div>
          </div>
        )}

        {/* FULL WIDTH CONTACT CONTENT */}
        <main className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-8 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Get in Touch</h1>
              <p className="text-green-100 text-sm">Have questions about the Constitution AI Assistant? We'd love to hear from you.</p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="max-w-5xl mx-auto p-4 md:p-6">
            <div className="grid md:grid-cols-5 gap-6">
              
              {/* Contact Info Cards - Left Side */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">Email Us</h3>
                      <p className="text-xs text-gray-500 mt-0.5">We'll respond within 24 hours</p>
                      <a href="mailto:contact@echytech.com" className="text-green-600 text-xs font-medium hover:underline mt-1 block">
                        contact@echytech.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">Location</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Echytech Solutions</p>
                      <p className="text-xs text-gray-600 mt-1">Pakistan</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">Response Time</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Usually within 24 hours</p>
                      <p className="text-xs text-gray-600 mt-1">Mon - Fri, 9am - 6pm PKT</p>
                    </div>
                  </div>
                </div>

                {/* Social Links Card */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-800 text-sm mb-3">Follow Us</h3>
                  <div className="flex items-center gap-2">
                    <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                      <Github className="w-4 h-4 text-gray-600" />
                    </a>
                    <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors">
                      <Linkedin className="w-4 h-4 text-gray-600" />
                    </a>
                    <a href={SOCIAL_LINKS.echytech} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-green-600 hover:underline font-medium">
                      Visit Echytech →
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form - Right Side */}
              <div className="md:col-span-3">
                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm h-full">
                  <h2 className="font-semibold text-gray-800 text-lg mb-4">Send us a Message</h2>
                  
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Message Sent!</h3>
                      <p className="text-sm text-gray-500 mb-4">Thank you for reaching out. We'll get back to you soon.</p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                          {error}
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Your name"
                              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="your@email.com"
                              className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="How can we help you?"
                            rows={5}
                            className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
