import { createSupabaseServerClient } from "../src/lib/supabase/server"
import LoginButton from "./components/LoginButton"
import SignOutButton from "./components/SignOutButton"
import VotingCard from "./components/VotingCard"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Page() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <h1 className="text-4xl text-white mb-6">Humor Feed</h1>
        <LoginButton />
      </div>
    )
  }

  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, captions!inner(id, content)") // Added !inner to require captions
    .eq("is_public", true)
    .order("created_datetime_utc", { ascending: false })
    .limit(50) // Increased limit to get more images with captions

  if (error) {
    console.error("Database error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-red-500 text-lg">Error fetching images: {error.message}</p>
      </div>
    )
  }

  // Filter to only show images that have at least one caption
  const imagesWithCaptions = images?.filter(img => 
    img.captions && 
    Array.isArray(img.captions) && 
    img.captions.length > 0 &&
    img.captions.some((caption: any) => caption.content && caption.content.trim() !== '')
  ) || []

  console.log(`Found ${imagesWithCaptions.length} images with captions`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md border-b border-gray-800/50 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Humor Feed</h1>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/upload"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              + Upload
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Main content with top padding for fixed nav */}
      <div className="pt-20 px-4 pb-8">
        {imagesWithCaptions.length > 0 ? (
          <VotingCard images={imagesWithCaptions} userId={session.user.id} />
        ) : (
          <div className="text-center text-white py-20">
            <p className="text-xl mb-2">No captions available yet</p>
            <p className="text-gray-400 mb-6">Upload an image to get started!</p>
            <Link
              href="/upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Upload Image
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}