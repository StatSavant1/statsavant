export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center h-[80vh] text-center px-6 bg-gray-950 text-white">
      <h2 className="text-4xl md:text-6xl font-bold mb-6">
        Your Edge Starts with the <span className="text-green-400">Stats.</span>
      </h2>
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
        Analyze player prop data, trends, and performance across every major sport.
      </p>
      <button className="mt-8 bg-green-400 text-gray-950 px-6 py-3 rounded-md font-semibold hover:bg-green-300 transition">
        Explore Now
      </button>
    </section>
  );
}
