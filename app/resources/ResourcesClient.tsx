"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, FileText, Video, BookOpen } from "lucide-react"

const resources = [
  {
    title: "Complete Guide to URL Shortening",
    description: "A comprehensive 50-page guide covering everything from basics to advanced strategies.",
    type: "PDF Guide",
    icon: FileText,
    size: "2.5 MB",
  },
  {
    title: "Link Analytics Dashboard Template",
    description: "Free Google Sheets template to track and analyze your link performance metrics.",
    type: "Template",
    icon: FileText,
    size: "150 KB",
  },
  {
    title: "Social Media Marketing Checklist",
    description: "Step-by-step checklist for optimizing short links across all social platforms.",
    type: "Checklist",
    icon: BookOpen,
    size: "500 KB",
  },
  {
    title: "Video Tutorial: Getting Started",
    description: "15-minute video tutorial showing how to create and track your first short link.",
    type: "Video",
    icon: Video,
    size: "45 MB",
  },
]

export default function ResourcesClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
              SP
            </div>
            <h1 className="text-white font-bold text-2xl">Shortner Pro</h1>
          </a>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => (window.location.href = "/")}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => (window.location.href = "/blog")}
            >
              Blog
            </Button>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Free Resources</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Download guides, templates, and tools to help you master URL shortening and link management
          </p>
        </section>

        {/* Resources Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {resources.map((resource, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 p-8 hover:border-indigo-500 transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <resource.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">{resource.title}</h3>
                    <span className="text-xs text-slate-500">{resource.size}</span>
                  </div>
                  <p className="text-slate-300 text-sm mb-4">{resource.description}</p>
                  <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <span className="text-xs text-indigo-400">{resource.type}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Additional Resources */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">External Resources</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <a
              href="https://developers.google.com/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-indigo-500 transition"
            >
              <div>
                <h4 className="text-white font-semibold mb-1">Google Analytics Developer Guide</h4>
                <p className="text-slate-400 text-sm">Learn how to track and analyze web traffic effectively</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </a>
            <a
              href="https://moz.com/learn/seo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-indigo-500 transition"
            >
              <div>
                <h4 className="text-white font-semibold mb-1">SEO Learning Center by Moz</h4>
                <p className="text-slate-400 text-sm">Comprehensive SEO guides and best practices</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </a>
            <a
              href="https://www.socialmediaexaminer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg hover:border-indigo-500 transition"
            >
              <div>
                <h4 className="text-white font-semibold mb-1">Social Media Examiner</h4>
                <p className="text-slate-400 text-sm">Latest social media marketing strategies and tips</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-400" />
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}
