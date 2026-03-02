"use client"
import { useState, useEffect, useMemo } from "react"
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

interface VotingCardProps {
  images: Image[]
  userId: string
}

export default function VotingCard({ images, userId }: VotingCardProps) {
  // Flatten and shuffle all captions randomly
  const allCaptions = useMemo(() => {
    const flattened = images.flatMap(image =>
      image.captions
        .filter(caption => caption?.content?.trim())
        .map(caption => ({
          captionId: caption.id,
          content: caption.content,
          imageUrl: image.url,
          imageId: image.id
        }))
    )
    
    // Shuffle array randomly
    return flattened.sort(() => Math.random() - 0.5)
  }, [images])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userVote, setUserVote] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [voteHistory, setVoteHistory] = useState<Array<{index: number, vote: number | null}>>([])

  const currentCard = allCaptions[currentIndex]
  const nextCard = allCaptions[currentIndex + 1]

  // Preload next image
  useEffect(() => {
    if (nextCard?.imageUrl) {
      const img = new Image()
      img.src = nextCard.imageUrl
    }
  }, [nextCard])

  // Reset vote when card changes
  useEffect(() => {
    setUserVote(null)
  }, [currentIndex])

  const handleVote = async (vote: number) => {
    if (!currentCard) return

    setUserVote(vote)
    
    try {
      // Get Supabase client
      const supabase = createSupabaseBrowserClient()
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        alert("You must be logged in to vote")
        return
      }

      // Check if vote already exists
      const { data: existingVote } = await supabase
        .from("caption_votes")
        .select("id, vote_value")
        .eq("caption_id", currentCard.captionId)
        .eq("profile_id", session.user.id)
        .maybeSingle()

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from("caption_votes")
          .update({ 
            vote_value: vote,
            modified_datetime_utc: new Date().toISOString()
          })
          .eq("id", existingVote.id)

        if (error) throw error
      } else {
        // Insert new vote
        const { error } = await supabase
          .from("caption_votes")
          .insert({
            profile_id: session.user.id,
            caption_id: currentCard.captionId,
            vote_value: vote,
            created_datetime_utc: new Date().toISOString(),
            modified_datetime_utc: new Date().toISOString()
          })

        if (error) throw error
      }

      console.log("✅ Vote saved to database")
      
    } catch (error: any) {
      console.error("❌ Error saving vote:", error)
      alert(`Failed to save vote: ${error.message}`)
      return
    }
    
    // Save to history
    setVoteHistory(prev => [...prev, { index: currentIndex, vote }])
    
    // Auto-advance after voting
    setTimeout(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsTransitioning(false)
      }, 250)
    }, 400)
  }

  const handleBack = () => {
    if (voteHistory.length === 0) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      // Remove last vote from history
      const newHistory = [...voteHistory]
      newHistory.pop()
      setVoteHistory(newHistory)
      
      // Go back one card
      setCurrentIndex(currentIndex - 1)
      setIsTransitioning(false)
    }, 250)
  }

  if (allCaptions.length === 0) {
    return (
      <div className="text-center text-white py-20">
        <p className="text-gray-400">No images with captions available</p>
      </div>
    )
  }

  if (!currentCard || currentIndex >= allCaptions.length) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <p className="text-xl text-white mb-1">All done!</p>
        <p className="text-gray-400 text-sm">You've reviewed all captions</p>
      </div>
    )
  }

  const canGoBack = currentIndex > 0 && voteHistory.length > 0

  return (
    <div className={`max-w-2xl mx-auto transition-all duration-250 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className="bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10 shadow-2xl mb-4">
        <div className="relative">
          <img
            src={currentCard.imageUrl}
            alt="Meme"
            className="w-full max-h-[50vh] object-contain bg-black"
          />
        </div>

        <div className="p-5">
          <p className="text-white text-lg text-center leading-relaxed font-light">
            {currentCard.content}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-3">
        <button
          onClick={() => handleVote(-1)}
          disabled={userVote !== null}
          className={`group relative w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 ${
            userVote === -1
              ? 'bg-red-500 shadow-lg shadow-red-500/30 scale-110'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <span className="text-2xl">👎</span>
        </button>

        <button
          onClick={() => handleVote(1)}
          disabled={userVote !== null}
          className={`group relative w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 ${
            userVote === 1
              ? 'bg-green-500 shadow-lg shadow-green-500/30 scale-110'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <span className="text-2xl">👍</span>
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={handleBack}
          disabled={!canGoBack}
          className={`px-6 py-2 text-sm rounded-full font-medium transition-all ${
            !canGoBack
              ? 'bg-white/5 text-gray-600 cursor-not-allowed'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}