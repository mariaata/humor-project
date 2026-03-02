"use client"
import { useState } from "react"
import VotingCard from "./VotingCard"
import GalleryView from "./GalleryView"

interface MainContentProps {
  images: any[]
  userId: string
}

export default function MainContent({ images, userId }: MainContentProps) {
  const [viewMode, setViewMode] = useState<'swipe' | 'gallery'>('swipe')

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode('swipe')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition ${
              viewMode === 'swipe'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Swipe Mode
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition ${
              viewMode === 'gallery'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Gallery View
          </button>
        </div>
      </div>

      {viewMode === 'swipe' ? (
        <VotingCard images={images} userId={userId} />
      ) : (
        <GalleryView images={images} userId={userId} />
      )}
    </>
  )
}