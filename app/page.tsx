import { supabase } from "../src/lib/supabaseClient";

export default async function Page() {
  const { data: images, error } = await supabase
    .from("images")
    .select("*");

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <p className="text-red-500 text-lg">Error fetching images: {error.message}</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <p className="text-gray-400 text-lg">No images found in the database.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8">
      {/* Page Header */}
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
          Supabase Image Gallery
        </h1>
        <p className="text-gray-400 text-lg">
          Explore images fetched in real-time from the Supabase database.
        </p>
      </header>

      {/* Images Grid - Masonry feel using flex */}
      <div className="flex flex-wrap justify-center gap-6">
        {images.map((img: any) => (
          <div
            key={img.id}
            className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden transform transition duration-300 hover:scale-105 hover:rotate-1 hover:shadow-2xl flex flex-col w-72"
          >
            {/* Image */}
            <div className="relative w-full h-56">
              <img
                src={img.url}
                alt={img.description || "Image"}
                className="w-full h-full object-cover"
              />
              {img.description && (
                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 backdrop-blur-sm text-white p-2 text-sm">
                  {img.description}
                </div>
              )}
            </div>

            {/* Footer / future actions */}
            <div className="p-4 flex justify-between items-center">
              {/* Placeholder for future buttons */}
              {/* <button className="text-blue-400 hover:underline">Like</button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
