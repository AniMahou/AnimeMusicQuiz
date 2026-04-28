import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      
      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Hero Content */}
        <div className="text-center">
          {/* Badge */}
          <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <span className="text-orange-400 text-sm font-medium">🎌 Anime Music Quiz</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Test Your Anime
            </span>
            <br />
            <span className="text-white">Music Knowledge</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Play with friends, guess OP/ED songs, and prove who knows the most anime soundtracks!
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-lg transition transform hover:scale-105 shadow-lg">
              🎮 Create Lobby
            </button>
            <button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg transition border border-white/20">
              🔑 Join Lobby
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-orange-500/50 transition">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-white mb-2">Thousands of Songs</h3>
            <p className="text-gray-400">From classic OPs to modern EDs, test your knowledge across all eras</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-orange-500/50 transition">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">Play with Friends</h3>
            <p className="text-gray-400">Create or join lobbies, compete in real-time, and climb the leaderboard</p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-orange-500/50 transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">MAL Integration</h3>
            <p className="text-gray-400">Connect your MyAnimeList account for personalized quizzes</p>
          </div>
          
        </div>
      </main>
    </>
  );
}