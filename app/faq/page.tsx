"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "What is Shortner Pro?",
    answer:
      "Shortner Pro is a powerful URL shortening service that allows you to create short, memorable links with advanced analytics and monetization features. Track every click, understand your audience, and earn money from your content.",
  },
  {
    question: "Do I need to sign up to create short links?",
    answer:
      "No! You can create short links without signing up. However, links created without an account will expire in 7 days. Sign in to create permanent links and access advanced features like custom expiration dates and detailed analytics.",
  },
  {
    question: "How does link monetization work?",
    answer:
      "When users click your short link, they see a brief advertisement before being redirected to the destination. You earn $0.50 per 1,000 ad impressions (CPM). Your earnings are tracked in real-time on your dashboard.",
  },
  {
    question: "What analytics are available?",
    answer:
      "Shortner Pro provides comprehensive analytics including total clicks, impressions, CTR, geographic data (country and city), device information (desktop, mobile, tablet), browser and operating system stats, and hourly/daily/monthly traffic patterns.",
  },
  {
    question: "Can I set an expiration date for my links?",
    answer:
      "Yes! Logged-in users can choose between three expiration options: 7 days, 1 month, or never expire. Links created without login automatically expire in 7 days. Expired links are automatically deleted from the database.",
  },
  {
    question: "Is there a limit to how many links I can create?",
    answer:
      "Currently, there are no limits on the number of short links you can create. Create as many as you need for your campaigns, content, and marketing efforts.",
  },
  {
    question: "How secure are my links?",
    answer:
      "All links are protected with SSL encryption and stored securely in our database. We use enterprise-grade security measures and maintain 99.9% uptime to ensure your links are always accessible.",
  },
  {
    question: "Can I track individual link performance?",
    answer:
      "Each short link has its own dedicated analytics page showing detailed performance metrics, click history, geographic distribution, device breakdown, and earnings information.",
  },
  {
    question: "What happens to expired links?",
    answer:
      "Expired links are automatically deactivated and removed from the database. Users who click expired links will see a message indicating the link is no longer available.",
  },
  {
    question: "How do I get paid for my earnings?",
    answer:
      "Payment features are coming soon! You will be able to withdraw your earnings once they reach a minimum threshold. We are working on integrating multiple payment methods for your convenience.",
  },
  {
    question: "Can I customize the short code in my URLs?",
    answer:
      "Currently, short codes are automatically generated to ensure uniqueness and security. Custom short codes and branded domains are planned features for future releases.",
  },
  {
    question: "Is Shortner Pro free?",
    answer:
      "Yes! Shortner Pro is free to use with unlimited short link creation. We plan to introduce premium features in the future, but the core functionality will always remain free.",
  },
]

function FAQAccordion({ faq }: { faq: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="bg-slate-800 border-slate-700 p-6 hover:border-indigo-500 transition">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 text-left"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
        )}
      </button>
      {isOpen && <p className="text-slate-300 mt-4 leading-relaxed">{faq.answer}</p>}
    </Card>
  )
}

export default function FAQPage() {
  const router = useRouter()

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
               <a href="/blog" className="text-slate-300 hover:text-white transition">
              Blogs
            </a>
            <a href="/how-it-works" className="text-slate-300 hover:text-white transition">
              How it Works
            </a>
            <a href="/faq" className="text-white font-semibold">
              FAQ
            </a>
            <a href="/contact" className="text-slate-300 hover:text-white transition">
              Contact
            </a>
          </div>
    
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about Shortner Pro. Can't find what you're looking for? Contact our support
            team.
          </p>
        </section>

        {/* FAQ List */}
        <section className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <FAQAccordion key={index} faq={faq} />
          ))}
        </section>

        {/* CTA Section 
        <section className="text-center bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-slate-300 mb-8">
            Our support team is here to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/contact")} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Contact Support
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800"
            >
              Get Started
            </Button>
          </div>
        </section>*/}
      </main>
    </div>
  )
}
