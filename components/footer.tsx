import { Facebook, Twitter, Linkedin, Instagram, Github, Mail } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                SP
              </div>
              <h3 className="text-white font-bold text-xl">Shortner Pro</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Create professional short links with advanced analytics and monetization
            </p>
            {/* Social Media Links */}
            <div className="flex gap-3">
              <a
                href="https://twitter.com/shortnerpro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="w-4 h-4 text-slate-300" />
              </a>
              <a
                href="https://facebook.com/shortnerpro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4 text-slate-300" />
              </a>
              <a
                href="https://linkedin.com/company/shortnerpro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-slate-300" />
              </a>
              <a
                href="https://instagram.com/shortnerpro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4 text-slate-300" />
              </a>
              <a
                href="https://github.com/shortnerpro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition"
                aria-label="Follow us on GitHub"
              >
                <Github className="w-4 h-4 text-slate-300" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-slate-400 hover:text-white text-sm transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-slate-400 hover:text-white text-sm transition">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-white text-sm transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-white text-sm transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white text-sm transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-slate-400 hover:text-white text-sm transition">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">© {currentYear} Shortner Pro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:support@shortnerpro.com"
              className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition"
            >
              <Mail className="w-4 h-4" />
              support@shortnerpro.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
