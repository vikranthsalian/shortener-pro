import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner className="w-12 h-12 text-indigo-500 mx-auto" />
        <p className="text-slate-300 text-lg font-medium">Loading your dashboard...</p>
      </div>
    </div>
  )
}
