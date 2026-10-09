import type { Metadata } from "next"
import ClientBlogDetailPage from "./client-page"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return {
    title: `Blog Post - Shortner Pro`,
    description: "Read the latest insights on URL shortening and digital marketing.",
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ClientBlogDetailPage postSlug={slug} />
}
