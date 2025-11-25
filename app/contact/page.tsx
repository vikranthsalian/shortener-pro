"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSubmitted(true)
    setLoading(false)
    setFormData({ name: "", email: "", subject: "", message: "" })

    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              SP
            </div>
            <h1 className="text-white font-bold text-2xl">Shortner Pro</h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="/features" className="text-slate-300 hover:text-white transition">
              Features
            </a>
            <a href="/how-it-works" className="text-slate-300 hover:text-white transition">
              How it Works
            </a>
            <a href="/faq" className="text-slate-300 hover:text-white transition">
              FAQ
            </a>
            <a href="/contact" className="text-white font-semibold">
              Contact
            </a>
          </div>
      
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Get in Touch</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Have questions, feedback, or need support? We'd love to hear from you. Send us a message and we'll respond
            as soon as possible.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <Card className="bg-slate-800 border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

            {submitted ? (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-300">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-200 mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-200 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your question or feedback..."
                    required
                    rows={6}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <Mail className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
              <p className="text-slate-300 mb-4">
                For general inquiries and support, email us and we'll respond within 24 hours.
              </p>
              <a href="mailto:support@shortner-pro.com" className="text-indigo-400 hover:text-indigo-300">
                support@shortner-pro.com
              </a>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <MessageSquare className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Quick Questions?</h3>
              <p className="text-slate-300 mb-4">Check out our FAQ page for answers to common questions.</p>
              <Button
                onClick={() => router.push("/faq")}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                View FAQ
              </Button>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Business Inquiries</h3>
              <p className="text-slate-300 mb-4">
                Interested in partnerships, enterprise solutions, or custom integrations? Let's talk.
              </p>
              <a href="mailto:business@shortner-pro.com" className="text-indigo-400 hover:text-indigo-300">
                business@shortner-pro.com
              </a>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
