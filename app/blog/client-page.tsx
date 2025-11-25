"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, User } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "10 Best Practices for URL Shortening in 2025",
    excerpt:
      "Discover the most effective strategies for creating memorable short links that drive engagement and build trust with your audience.",
    author: "Sarah Johnson",
    date: "2025-01-15",
    category: "Best Practices",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "How to Track and Analyze Short Link Performance",
    excerpt:
      "Learn how to leverage analytics data to optimize your marketing campaigns and understand user behavior through detailed link tracking.",
    author: "Michael Chen",
    date: "2025-01-10",
    category: "Analytics",
    readTime: "7 min read",
  },
  {
    id: 3,
    title: "Monetizing Your Content with Short Links",
    excerpt:
      "Explore proven strategies to turn your short links into revenue streams while maintaining a positive user experience.",
    author: "Emily Rodriguez",
    date: "2025-01-05",
    category: "Monetization",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Social Media Marketing with Branded Short Links",
    excerpt:
      "Maximize your social media ROI by using branded short links that build trust and increase click-through rates across all platforms.",
    author: "David Park",
    date: "2024-12-28",
    category: "Social Media",
    readTime: "4 min read",
  },
  {
    id: 5,
    title: "The Complete Guide to Link Analytics",
    excerpt:
      "Understanding metrics like CTR, conversion rates, and audience demographics to make data-driven marketing decisions.",
    author: "Lisa Thompson",
    date: "2024-12-20",
    category: "Analytics",
    readTime: "8 min read",
  },
  {
    id: 6,
    title: "Custom Domains vs Generic Short Links: Which is Better?",
    excerpt:
      "Compare the benefits of using custom branded domains versus generic short link services for your business needs.",
    author: "James Wilson",
    date: "2024-12-15",
    category: "Strategy",
    readTime: "5 min read",
  },
  {
    id: 7,
    title: "How Short Links Improve Marketing Click-Through Rates",
    excerpt:
      "Discover data-driven strategies and real-world examples of how shortened URLs can dramatically increase your marketing CTR by up to 250%.",
    author: "Marcus Thompson",
    date: "2024-12-10",
    category: "Marketing",
    readTime: "10 min read",
  },
  {
    id: 8,
    title: "Deep Guide — How Link Analytics Work (Full Breakdown)",
    excerpt:
      "A comprehensive technical breakdown of every metric in link analytics, from basic clicks to advanced attribution modeling.",
    author: "Dr. Rachel Kim",
    date: "2024-12-05",
    category: "Analytics",
    readTime: "12 min read",
  },
  {
    id: 9,
    title: "Why Branded Short Links Increase Trust & Conversions",
    excerpt:
      "Learn how branded domains build credibility and increase conversion rates by 34% compared to generic shorteners, backed by real data.",
    author: "Jennifer Martinez",
    date: "2024-11-28",
    category: "Branding",
    readTime: "8 min read",
  },
  {
    id: 10,
    title: "Case Study — How a Business Used Shortner Pro to Increase ROI",
    excerpt:
      "Real-world success story: How an e-commerce company increased their marketing ROI by 156% using strategic link management.",
    author: "Alex Foster",
    date: "2024-11-20",
    category: "Case Study",
    readTime: "9 min read",
  },
  {
    id: 11,
    title: "Beginner Guide — How to Use Shortner Pro (Step-by-Step)",
    excerpt:
      "Complete walkthrough for beginners: Create your first short link, track analytics, and master advanced features in under 15 minutes.",
    author: "Sarah Mitchell",
    date: "2024-11-15",
    category: "Tutorial",
    readTime: "15 min read",
  },
]

export default function ClientBlogPage() {
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
             <a href="/blog" className="text-white font-semibold">
              Blogs
            </a>
            <a href="/how-it-works" className="text-slate-300 hover:text-white transition">
              How it Works
            </a>
            <a href="/faq" className="text-slate-300 hover:text-white transition">
              FAQ
            </a>
            <a href="/contact" className="text-slate-300 hover:text-white transition">
              Contact
            </a>
          </div>
      
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Shortner Pro Blog</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Tips, strategies, and insights on URL shortening, link management, and digital marketing
          </p>
        </section>

        {/* Blog Posts Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="group">
              <Card className="bg-slate-800 border-slate-700 p-6 h-full flex flex-col hover:border-indigo-500 transition">
                <div className="flex-1">
                  <div className="text-xs text-indigo-400 font-semibold mb-3">{post.category}</div>
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition">
                    {post.title}
                  </h2>
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                </div>
                <div className="border-t border-slate-700 pt-4 mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-indigo-400 hover:text-indigo-300 p-0 h-auto"
                      onClick={() => (window.location.href = `/blog/${post.id}`)}
                    >
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            </article>
          ))}
        </section>

        {/* Newsletter CTA */}
        <section className="mt-20 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Get the latest tips, strategies, and insights delivered to your inbox. Join thousands of marketers who trust
            Shortner Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">Subscribe</Button>
          </div>
        </section>
      </main>
    </div>
  )
}
