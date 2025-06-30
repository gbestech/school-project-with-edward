import { useState } from 'react'

const NewsLetter = () => {
  const [email, setEmail] = useState('')
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="bg-white">
      <div className="relative overflow-hidden">
        {/* Subtle background patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            {/* Premium badge */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-8 py-3 mb-8 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-white tracking-wide">STAY UPDATED</span>
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
            </div>

            {/* Main heading with enhanced typography */}
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Join Our Learning
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Revolution
              </span>
            </h2>

            {/* Subtitle with better spacing */}
            <p className="text-gray-600 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
              Get exclusive access to cutting-edge courses, AI insights, and transformative learning opportunities delivered directly to your inbox.
            </p>
          </div>

          {/* Enhanced form section */}
          <div className="max-w-lg mx-auto">
            <div 
              className="relative group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Form container with premium styling */}
              <div className="relative bg-white rounded-3xl p-3 shadow-2xl shadow-gray-200/50 border border-gray-100 hover:shadow-3xl hover:shadow-blue-500/10 transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-6 py-4 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-lg font-medium"
                    />
                    {/* Input underline effect */}
                    <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300"></div>
                  </div>
                  
                  {/* Premium button */}
                  <button className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 ${isHovered ? 'animate-pulse' : ''}`}>
                    <span className="flex items-center space-x-2">
                      <span>Subscribe</span>
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              {/* Floating elements for premium feel */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}></div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>100% secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Unsubscribe anytime</span>
              </div>
            </div>
          </div>

          {/* Social proof section */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm mb-4">Join 50,000+ learners already transforming their careers</p>
            <div className="flex justify-center items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                +50K
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsLetter