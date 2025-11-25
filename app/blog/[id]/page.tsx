import type { Metadata } from "next"
import ClientBlogDetailPage from "./client-page"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Blog Post - Shortner Pro`,
    description: "Read the latest insights on URL shortening and digital marketing.",
  }
}

export default function BlogDetailPage({ params }: { params: { id: string } }) {
  return <ClientBlogDetailPage postId={params.id} />
}
