import { createSupabaseServerClient } from "../src/lib/supabase/server"
import LoginButton from "./components/LoginButton"
import SignOutButton from "./components/SignOutButton"
import MainContent from "./components/MainContent"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Page() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
              <span className="text-5xl">😂</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Humor Feed</h1>
            <p className="text-gray-400 text-lg">Vote on the funniest captions</p>
          </div>
          <LoginButton />
        </div>
      </div>
    )
  }

  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, captions!inner(id, content)")
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false})
    .limit(50)

  if (error) {
    console.error("Database error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-red-400 text-lg">Error fetching images: {error.message}</p>
      </div>
    )
  }

  const imagesWithCaptions = images?.filter(img => 
    img.captions && 
    Array.isArray(img.captions) && 
    img.captions.length > 0 &&
    img.captions.some((caption: any) => caption.content && caption.content.trim() !== '')
  ) || []

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 bg-black/80 backdrop-blur-2xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">😂</span>
              </div>
              <h1 className="text-lg font-semibold text-white">Humor Feed</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/upload"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-medium"
              >
                Upload
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {imagesWithCaptions.length > 0 ? (
          <MainContent images={imagesWithCaptions} userId={session.user.id} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">📸</span>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No captions yet</h2>
            <p className="text-gray-400 mb-8">Upload an image to get started</p>
            <Link
              href="/upload"
              className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:scale-105 transition-transform"
            >
              Upload Image
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}