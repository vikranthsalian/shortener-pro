"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Endpoint {
  method: "GET" | "POST" | "DELETE" | "PUT"
  path: string
  description: string
  category: string
  requestBody?: {
    type: string
    properties: Record<string, { type: string; required: boolean; description: string }>
  }
  parameters?: {
    name: string
    in: "path" | "query" | "header"
    required: boolean
    type: string
    description: string
  }[]
  responses: {
    status: number
    description: string
    example: any
  }[]
}

const endpoints: Endpoint[] = [
  {
    method: "POST",
    path: "/api/auth/register",
    description: "Register a new user account",
    category: "Authentication",
    requestBody: {
      type: "application/json",
      properties: {
        email: { type: "string", required: true, description: "User email address" },
        password: { type: "string", required: true, description: "User password (min 6 characters)" },
        name: { type: "string", required: false, description: "User full name" },
      },
    },
    responses: [
      {
        status: 201,
        description: "User successfully registered",
        example: {
          message: "Registration successful",
          user: {
            id: "user123",
            email: "user@example.com",
            name: "John Doe",
          },
        },
      },
      {
        status: 400,
        description: "Invalid input or user already exists",
        example: { error: "User already exists" },
      },
    ],
  },
  {
    method: "POST",
    path: "/api/auth/login",
    description: "Authenticate user and get session",
    category: "Authentication",
    requestBody: {
      type: "application/json",
      properties: {
        email: { type: "string", required: true, description: "User email address" },
        password: { type: "string", required: true, description: "User password" },
      },
    },
    responses: [
      {
        status: 200,
        description: "Login successful",
        example: {
          message: "Login successful",
          user: {
            id: "user123",
            email: "user@example.com",
            name: "John Doe",
          },
        },
      },
      {
        status: 401,
        description: "Invalid credentials",
        example: { error: "Invalid email or password" },
      },
    ],
  },
  {
    method: "POST",
    path: "/api/auth/google",
    description: "Authenticate with Google OAuth",
    category: "Authentication",
    requestBody: {
      type: "application/json",
      properties: {
        credential: { type: "string", required: true, description: "Google OAuth credential token" },
      },
    },
    responses: [
      {
        status: 200,
        description: "Google authentication successful",
        example: {
          message: "Login successful",
          user: {
            id: "user123",
            email: "user@example.com",
            name: "John Doe",
            image: "https://...",
          },
        },
      },
    ],
  },
  {
    method: "POST",
    path: "/api/shorten",
    description: "Create a new short URL",
    category: "URL Management",
    requestBody: {
      type: "application/json",
      properties: {
        originalUrl: { type: "string", required: true, description: "Original URL to shorten" },
        title: { type: "string", required: false, description: "Custom title for the link" },
        description: { type: "string", required: false, description: "Description of the link" },
        userId: { type: "string", required: false, description: "User ID (for authenticated users)" },
        expiry: {
          type: "string",
          required: false,
          description: 'Expiry option: "7days", "1month", or "never" (default: never expire)',
        },
      },
    },
    responses: [
      {
        status: 200,
        description: "Short URL created successfully",
        example: {
          id: "url123",
          shortCode: "abc123",
          originalUrl: "https://example.com",
          shortUrl: "https://shortner-pro.vercel.app/s/abc123",
          createdAt: "2024-01-01T00:00:00Z",
          expiryDate: null,
        },
      },
      {
        status: 400,
        description: "Invalid URL",
        example: { error: "Invalid URL provided" },
      },
      {
        status: 429,
        description: "Rate limit exceeded",
        example: { error: "Rate limit exceeded. Maximum 10 links per minute." },
      },
    ],
  },
  {
    method: "GET",
    path: "/api/redirect/{shortCode}",
    description: "Redirect to original URL by short code",
    category: "URL Management",
    parameters: [
      {
        name: "shortCode",
        in: "path",
        required: true,
        type: "string",
        description: "The short code of the URL",
      },
    ],
    responses: [
      {
        status: 307,
        description: "Temporary redirect to original URL",
        example: { location: "https://example.com" },
      },
      {
        status: 404,
        description: "Short URL not found",
        example: { error: "Short URL not found" },
      },
      {
        status: 410,
        description: "Link has expired",
        example: { error: "This link has expired" },
      },
    ],
  },
  {
    method: "GET",
    path: "/api/user/links",
    description: "Get all links for authenticated user",
    category: "URL Management",
    parameters: [
      {
        name: "userId",
        in: "query",
        required: true,
        type: "string",
        description: "User ID to fetch links for",
      },
    ],
    responses: [
      {
        status: 200,
        description: "List of user links",
        example: {
          links: [
            {
              id: "url123",
              short_code: "abc123",
              original_url: "https://example.com",
              title: "Example Site",
              created_at: "2024-01-01T00:00:00Z",
              total_clicks: 150,
              total_impressions: 500,
              expiry_date: null,
            },
          ],
        },
      },
    ],
  },
  {
    method: "DELETE",
    path: "/api/user/links/{linkId}",
    description: "Delete a specific link",
    category: "URL Management",
    parameters: [
      {
        name: "linkId",
        in: "path",
        required: true,
        type: "string",
        description: "The ID of the link to delete",
      },
      {
        name: "userId",
        in: "query",
        required: true,
        type: "string",
        description: "User ID for authorization",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Link deleted successfully",
        example: { message: "Link deleted successfully" },
      },
      {
        status: 403,
        description: "Unauthorized",
        example: { error: "Unauthorized" },
      },
      {
        status: 404,
        description: "Link not found",
        example: { error: "Link not found" },
      },
    ],
  },
  {
    method: "GET",
    path: "/api/analytics/{shortCode}",
    description: "Get analytics for a specific short URL",
    category: "Analytics",
    parameters: [
      {
        name: "shortCode",
        in: "path",
        required: true,
        type: "string",
        description: "The short code to get analytics for",
      },
      {
        name: "userId",
        in: "query",
        required: false,
        type: "string",
        description: "User ID for authorization check",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Analytics data",
        example: {
          analytics: {
            id: "url123",
            short_code: "abc123",
            original_url: "https://example.com",
            title: "Example",
            total_clicks: 150,
            total_impressions: 500,
            ctr: "30.00",
            expiry_date: null,
          },
          dailyStats: [
            {
              date: "2024-01-01",
              clicks: 15,
              impressions: 50,
              ctr: 30.0,
            },
          ],
        },
      },
      {
        status: 404,
        description: "Short URL not found",
        example: { error: "Short URL not found" },
      },
    ],
  },
  {
    method: "GET",
    path: "/api/analytics/detailed/{shortCode}",
    description: "Get detailed analytics including device, location, and hourly data",
    category: "Analytics",
    parameters: [
      {
        name: "shortCode",
        in: "path",
        required: true,
        type: "string",
        description: "The short code to get detailed analytics for",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Detailed analytics data",
        example: {
          hourlyStats: [{ hour: 0, clicks: 10, impressions: 30 }],
          deviceStats: [{ device_type: "mobile", count: 50 }],
          browserStats: [{ browser_name: "Chrome", count: 40 }],
          osStats: [{ os_name: "Windows", count: 35 }],
          locationStats: [{ country: "US", city: "New York", count: 25 }],
        },
      },
    ],
  },
  {
    method: "POST",
    path: "/api/impression/{shortCode}",
    description: "Track an ad impression for a short URL",
    category: "Tracking",
    parameters: [
      {
        name: "shortCode",
        in: "path",
        required: true,
        type: "string",
        description: "The short code to track impression for",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Impression tracked",
        example: { success: true },
      },
    ],
  },
  {
    method: "POST",
    path: "/api/admin/cleanup",
    description: "Delete expired links from database (admin only)",
    category: "Admin",
    responses: [
      {
        status: 200,
        description: "Cleanup completed",
        example: { message: "Deleted 5 expired links" },
      },
    ],
  },
  {
    method: "GET",
    path: "/api/migrate",
    description: "Run database migrations",
    category: "System",
    responses: [
      {
        status: 200,
        description: "Migrations completed",
        example: { message: "Database migrations completed successfully" },
      },
    ],
  },
]

function MethodBadge({ method }: { method: string }) {
  const colors = {
    GET: "bg-blue-500",
    POST: "bg-green-500",
    PUT: "bg-yellow-500",
    DELETE: "bg-red-500",
  }
  return <Badge className={`${colors[method as keyof typeof colors]} text-white font-mono text-xs`}>{method}</Badge>
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MethodBadge method={endpoint.method} />
            <code className="text-sm font-mono">{endpoint.path}</code>
          </div>
          {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
        <CardDescription>{endpoint.description}</CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Parameters */}
          {endpoint.parameters && endpoint.parameters.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Parameters</h4>
              <div className="space-y-2">
                {endpoint.parameters.map((param, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono">{param.name}</code>
                      <Badge variant="outline" className="text-xs">
                        {param.in}
                      </Badge>
                      {param.required && (
                        <Badge variant="destructive" className="text-xs">
                          required
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{param.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          {endpoint.requestBody && (
            <div>
              <h4 className="font-semibold mb-2">Request Body</h4>
              <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Content-Type: {endpoint.requestBody.type}</p>
                {Object.entries(endpoint.requestBody.properties).map(([key, value]) => (
                  <div key={key} className="border-l-2 border-primary pl-3">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono">{key}</code>
                      {value.required && (
                        <Badge variant="destructive" className="text-xs">
                          required
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{value.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responses */}
          <div>
            <h4 className="font-semibold mb-2">Responses</h4>
            <Tabs defaultValue={endpoint.responses[0].status.toString()}>
              <TabsList>
                {endpoint.responses.map((response) => (
                  <TabsTrigger key={response.status} value={response.status.toString()}>
                    {response.status}
                  </TabsTrigger>
                ))}
              </TabsList>
              {endpoint.responses.map((response) => (
                <TabsContent key={response.status} value={response.status.toString()} className="space-y-2">
                  <p className="text-sm text-muted-foreground">{response.description}</p>
                  <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-green-400">
                      <code>{JSON.stringify(response.example, null, 2)}</code>
                    </pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function ApiDocsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = ["all", ...Array.from(new Set(endpoints.map((e) => e.category)))]
  const filteredEndpoints =
    selectedCategory === "all" ? endpoints : endpoints.filter((e) => e.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              SP
            </div>
            <span className="text-xl font-bold text-white">Shortner Pro</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">API Documentation</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Complete reference for Shortner Pro REST API endpoints
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Base URL */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block bg-slate-950 text-green-400 p-4 rounded-lg">https://shortner-pro.vercel.app</code>
            </CardContent>
          </Card>

          {/* Authentication Section */}
          <Card className="mb-8 border-yellow-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🔐 Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-white">Using API Tokens</h4>
                <p className="text-sm text-white/70 mb-3">
                  To use the API, you need to create an API token from your dashboard. Include it in your requests using
                  the Authorization header:
                </p>
                <code className="block bg-slate-950 text-green-400 p-4 rounded-lg text-sm">
                  Authorization: Bearer sp_your_api_token_here
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-white">Getting Your API Token</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-white/70">
                  <li>Navigate to your Dashboard</li>
                  <li>Click on "API Tokens" button</li>
                  <li>Create a new token with a descriptive name</li>
                  <li>Copy the generated token (it starts with "sp_")</li>
                  <li>Use it in your API requests</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-white">Example Request with cURL</h4>
                <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400">
                    <code>{`curl -X POST https://shortner-pro.vercel.app/api/shorten \\
  -H "Authorization: Bearer sp_your_api_token_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "originalUrl": "https://example.com",
    "title": "My Link",
    "expiry": "never"
  }'`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-white">Example Request with JavaScript</h4>
                <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400">
                    <code>{`const response = await fetch('https://shortner-pro.vercel.app/api/shorten', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sp_your_api_token_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    originalUrl: 'https://example.com',
    title: 'My Link',
    expiry: 'never'
  })
});

const data = await response.json();
console.log(data.shortUrl);`}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  <strong>⚠️ Important:</strong> Keep your API tokens secure. Never share them publicly or commit them to
                  version control. Each token has rate limits based on your account configuration.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Endpoints */}
          <div>
            {filteredEndpoints.map((endpoint, idx) => (
              <EndpointCard key={idx} endpoint={endpoint} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
