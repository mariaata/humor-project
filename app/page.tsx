import { supabase } from "../src/lib/supabaseClient";

export default async function Page() {
  // Fetch images with nested captions
  const { data: images, error } = await supabase
    .from("images")
    .select(`
      id,
      url,
      captions (
        id,
        content
      )
    `);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
        <p className="text-red-400 text-lg">{error.message}</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
        <p className="text-gray-300 text-lg">No images found in the database.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-8">
      {/* Page Header */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
          Humor Image Gallery
        </h1>
        <p className="text-gray-300 text-lg max-w-xl mx-auto">
          Relax and scroll through a calm feed of images with their captions.
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-[2px] w-24 rounded-full bg-pink-400/60" />
        </div>
      </header>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {images.map((img: any) => (
          <div
            key={img.id}
            className="relative w-72 rounded-2xl shadow-lg bg-gray-800/80 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl"
          >
            {/* Image */}
            <img
              src={img.url}
              alt="Image"
              className="w-full h-56 object-cover rounded-t-2xl"
            />

            {/* Caption always visible */}
            <div className="p-4 bg-gray-900/70 backdrop-blur-sm flex-grow flex items-center">
              <p className="text-gray-100 text-sm font-medium">
                {img.captions && img.captions.length > 0
                  ? img.captions[0].content
                  : "No caption yet"}
              </p>
            </div>

            {/* Footer with subtle info */}
            <div className="p-3 flex justify-between items-center bg-gray-800/60 rounded-b-2xl text-gray-300 text-xs">
              <span>{img.captions?.length || 0} caption(s)</span>
              <button className="text-pink-400 hover:text-pink-500 font-medium transition-colors">
                Like
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
