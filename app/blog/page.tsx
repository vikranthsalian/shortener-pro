import type { Metadata } from "next"
import ClientBlogPage from "./client-page"

export const metadata: Metadata = {
  title: "Blog - Shortner Pro | URL Shortening Tips & Best Practices",
  description:
    "Learn URL shortening best practices, link management strategies, digital marketing tips, and analytics insights from the Shortner Pro blog.",
  keywords: [
    "URL shortener blog",
    "link management tips",
    "digital marketing",
    "analytics best practices",
    "social media marketing",
  ],
  openGraph: {
    title: "Shortner Pro Blog - URL Shortening & Marketing Tips",
    description: "Expert insights on URL shortening, link management, and digital marketing strategies.",
  },
}

export default function BlogPage() {
  return <ClientBlogPage />
}
