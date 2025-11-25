import type { Metadata } from "next"
import ClientBlogDetailPage from "./client-page"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return {
    title: `Blog Post - Shortner Pro`,
    description: "Read the latest insights on URL shortening and digital marketing.",
  }
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <ClientBlogDetailPage postSlug={params.slug} />
}
