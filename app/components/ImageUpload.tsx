"use client"
import { useState } from "react"
import { createSupabaseBrowserClient } from "../../src/lib/supabase/client"

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [captions, setCaptions] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, WebP, GIF, or HEIC image.')
      return
    }

    setFile(selectedFile)
    setError(null)
    setCaptions([])
    setImageId(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const token = session.access_token

      console.log('Step 1: Generating presigned URL...')
      const presignedResponse = await fetch('https://api.almostcrackd.ai/pipeline/generate-presigned-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: file.type
        })
      })

      if (!presignedResponse.ok) {
        const errorText = await presignedResponse.text()
        throw new Error(`Failed to generate presigned URL: ${errorText}`)
      }

      const { presignedUrl, cdnUrl } = await presignedResponse.json()
      console.log('Presigned URL generated:', cdnUrl)

      console.log('Step 2: Uploading image...')
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }
      console.log('Image uploaded successfully')

      console.log('Step 3: Registering image...')
      const registerResponse = await fetch('https://api.almostcrackd.ai/pipeline/upload-image-from-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: cdnUrl,
          isCommonUse: false
        })
      })

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text()
        throw new Error(`Failed to register image: ${errorText}`)
      }

      const { imageId } = await registerResponse.json()
      setImageId(imageId)
      console.log('Image registered with ID:', imageId)

      console.log('Step 4: Generating captions...')
      const captionsResponse = await fetch('https://api.almostcrackd.ai/pipeline/generate-captions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: imageId
        })
      })

      if (!captionsResponse.ok) {
        const errorText = await captionsResponse.text()
        throw new Error(`Failed to generate captions: ${errorText}`)
      }

      const captionData = await captionsResponse.json()
      setCaptions(captionData)
      console.log('Captions generated:', captionData)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'An error occurred during upload')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Upload Image</h2>

        {/* File Input */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-300">
            Choose an image
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="mb-6">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-96 object-contain rounded-lg bg-black"
            />
          </div>
        )}

        {/* Possible error check */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition"
        >
          {isUploading ? 'Processing...' : 'Upload & Generate Captions'}
        </button>

        {/* Loading State */}
        {isUploading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-gray-400 mt-2 text-sm">
              Uploading and generating captions... This may take a minute.
            </p>
          </div>
        )}

        {/* To Display Captions */}
        {captions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Generated Captions:</h3>
            <div className="space-y-3">
              {captions.map((caption: any, index: number) => (
                <div
                  key={caption.id || index}
                  className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                >
                  <p className="text-white">{caption.content || caption.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* If Success */}
        {imageId && captions.length > 0 && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <p className="text-green-400 text-sm">
              ✅ Image uploaded successfully! Generated {captions.length} captions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}