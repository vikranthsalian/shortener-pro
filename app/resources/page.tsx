import type { Metadata } from "next"
import ResourcesClient from "./ResourcesClient"

export const metadata: Metadata = {
  title: "Resources - Free URL Shortener Tools & Guides | Shortner Pro",
  description:
    "Access free resources, guides, templates, and tools for URL shortening, link management, and digital marketing. Download our comprehensive guides today.",
  keywords: [
    "URL shortener resources",
    "free marketing tools",
    "link management guide",
    "digital marketing templates",
    "analytics guides",
  ],
}

export default function ResourcesPage() {
  return <ResourcesClient />
}
