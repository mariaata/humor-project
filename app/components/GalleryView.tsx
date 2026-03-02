"use client"
import { useState, useMemo } from "react"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"

interface Caption {
  id: string
  content: string
}

interface Image {
  id: string
  url: string
  captions: Caption[]
}

interface GalleryViewProps {
  images: Image[]
  userId: string
}

export default function GalleryView({ images, userId }: GalleryViewProps) {
  const supabase = createSupabaseBrowserClient()

  // Flatten all captions
  const allCards = useMemo(() => {
    return images.flatMap(image =>
      image.captions
        .filter(caption => caption?.content?.trim())
        .map(caption => ({
          captionId: caption.id,
          content: caption.content,
          imageUrl: image.url,
          imageId: image.id
        }))
    ).sort(() => Math.random() - 0.5) // Shuffle
  }, [images])

  const [votes, setVotes] = useState<Record<string, number>>({})

  const handleVote = async (captionId: string, vote: number) => {
    // Toggle vote (click again to remove)
    const newVote = votes[captionId] === vote ? 0 : vote
    
    setVotes(prev => ({
      ...prev,
      [captionId]: newVote
    }))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) return

      if (newVote === 0) {
        // Remove vote
        await supabase
          .from("caption_votes")
          .delete()
          .eq("caption_id", captionId)
          .eq("profile_id", session.user.id)
      } else {
        // Check if vote exists
        const { data: existingVote } = await supabase
          .from("caption_votes")
          .select("id")
          .eq("caption_id", captionId)
          .eq("profile_id", session.user.id)
          .maybeSingle()

        if (existingVote) {
          // Update
          await supabase
            .from("caption_votes")
            .update({ 
              vote_value: newVote,
              modified_datetime_utc: new Date().toISOString()
            })
            .eq("id", existingVote.id)
        } else {
          // Insert
          await supabase
            .from("caption_votes")
            .insert({
              profile_id: session.user.id,
              caption_id: captionId,
              vote_value: newVote,
              created_datetime_utc: new Date().toISOString(),
              modified_datetime_utc: new Date().toISOString()
            })
        }
      }

      console.log("✅ Vote saved")
    } catch (error) {
      console.error("❌ Error saving vote:", error)
    }
  }

  const upvoted = Object.values(votes).filter(v => v === 1).length
  const downvoted = Object.values(votes).filter(v => v === -1).length

  return (
    <div className="max-w-7xl mx-auto">
      {/*  */}
      <div className="mb-8 flex gap-6 justify-center">
        <div className="text-center">
          
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400">{upvoted}</p>
          <p className="text-sm text-gray-400">Liked</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-400">{downvoted}</p>
          <p className="text-sm text-gray-400">Disliked</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCards.map((card) => {
          const userVote = votes[card.captionId] || 0

          return (
            <div
              key={card.captionId}
              className={`bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm border transition-all hover:scale-[1.02] ${
                userVote === 1 ? 'border-green-500 shadow-lg shadow-green-500/20' :
                userVote === -1 ? 'border-red-500 shadow-lg shadow-red-500/20' :
                'border-white/10'
              }`}
            >
              {/* Image */}
              <div className="relative aspect-video">
                <img
                  src={card.imageUrl}
                  alt="Meme"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Caption */}
              <div className="p-4">
                <p className="text-white text-sm leading-relaxed mb-4 line-clamp-3">
                  {card.content}
                </p>

                {/* Vote buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote(card.captionId, 1)}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      userVote === 1
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => handleVote(card.captionId, -1)}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      userVote === -1
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    👎
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}