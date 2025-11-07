"use client"

import { Button } from "@/components/ui/button"
import { Twitter, Facebook, Linkedin, LinkIcon } from "lucide-react"
import { useState } from "react"

interface SocialShareProps {
  url: string
  title: string
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400 mr-2">Share:</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(shareUrls.twitter, "_blank", "width=600,height=400")}
        className="text-slate-400 hover:text-blue-400"
        aria-label="Share on Twitter"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(shareUrls.facebook, "_blank", "width=600,height=400")}
        className="text-slate-400 hover:text-blue-600"
        aria-label="Share on Facebook"
      >
        <Facebook className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open(shareUrls.linkedin, "_blank", "width=600,height=400")}
        className="text-slate-400 hover:text-blue-700"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="text-slate-400 hover:text-green-500"
        aria-label="Copy link"
      >
        <LinkIcon className="w-4 h-4" />
      </Button>
      {copied && <span className="text-xs text-green-400">Copied!</span>}
    </div>
  )
}
