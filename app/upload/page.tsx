import { createSupabaseServerClient } from "../../src/lib/supabase/server"
import ImageUpload from "../components/ImageUpload"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function UploadPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Please log in to upload images</p>
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md border-b border-gray-800/50 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white tracking-tight">Upload Image</h1>
          <Link
            href="/"
            className="px-4 py-2 text-gray-300 hover:text-white text-sm transition"
          >
            ← Back to Feed
          </Link>
        </div>
      </div>

      <div className="pt-24 px-4 pb-8">
        <ImageUpload />
      </div>
    </div>
  )
}