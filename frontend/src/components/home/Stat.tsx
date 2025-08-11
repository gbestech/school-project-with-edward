import React, { useState, useEffect } from 'react'
import { Users, BookOpen, GraduationCap, Award, Star, Quote } from 'lucide-react';

const stats = [
  { icon: Users, value: '50K+', label: 'Active Students', gradient: 'from-blue-500 to-cyan-500' },
  { icon: BookOpen, value: '500+', label: 'Courses', gradient: 'from-purple-500 to-pink-500' },
  { icon: GraduationCap, value: '200+', label: 'Expert Teachers', gradient: 'from-green-500 to-emerald-500' },
  { icon: Award, value: '98%', label: 'Success Rate', gradient: 'from-orange-500 to-red-500' }
];

const reviews = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    avatar: "SC",
    rating: 5,
    text: "The AI courses here completely transformed my career trajectory. The hands-on projects were incredible.",
    source: "Google Reviews"
  },
  {
    name: "Marcus Johnson",
    role: "Data Scientist at Microsoft",
    avatar: "MJ",
    rating: 5,
    text: "Best investment I've made in my professional development. The instructors are world-class.",
    source: "Trustpilot"
  },
  {
    name: "Elena Rodriguez",
    role: "Product Manager at Meta",
    avatar: "ER",
    rating: 5,
    text: "Practical, engaging, and results-driven. I landed my dream job within 3 months of completion.",
    source: "Course Report"
  },
  {
    name: "David Kim",
    role: "ML Engineer at Tesla",
    avatar: "DK",
    rating: 5,
    text: "The curriculum is cutting-edge and the community support is unmatched. Highly recommend!",
    source: "LinkedIn"
  }
];

const Stat = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Trusted by Thousands Worldwide
          </h2>
          <p className="text-lg mb-12 text-slate-600 dark:text-slate-400">
            Join a community of learners who've transformed their careers
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`relative mb-6`}>
                  <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${stat.gradient} rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}>
                    <stat.icon className="text-white" size={28} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 mx-auto w-20 h-20"></div>
                </div>
                <div className="text-4xl md:text-5xl font-black mb-2 transition-all duration-300 text-slate-900 dark:text-slate-100">
                  {stat.value}
                </div>
                <p className="font-semibold text-lg text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="rounded-3xl p-8 md:p-12 shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 rounded-full px-6 py-2 mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <Star className="text-yellow-500 fill-current" size={16} />
              <span className="font-semibold text-sm text-amber-800 dark:text-amber-200">4.9/5 AVERAGE RATING</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              What Our Students Say
            </h3>
          </div>

          {/* Featured Review */}
          <div className="max-w-4xl mx-auto">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              <div className="rounded-2xl p-8 md:p-10 shadow-lg relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Quote className="absolute top-6 left-6 text-blue-500 dark:text-blue-400" size={32} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl font-medium text-center mb-8 leading-relaxed text-slate-600 dark:text-slate-400">
                    "{reviews[currentReview].text}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {reviews[currentReview].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                        {reviews[currentReview].name}
                      </div>
                      <div className="font-medium text-slate-600 dark:text-slate-400">
                        {reviews[currentReview].role}
                      </div>
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        via {reviews[currentReview].source}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Navigation Dots */}
            <div className="flex justify-center space-x-3 mt-8">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentReview === index 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Review Sources */}
          <div className="mt-12 text-center">
            <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">Featured on trusted platforms</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="px-6 py-3 rounded-lg shadow-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                Google Reviews
              </div>
              <div className="px-6 py-3 rounded-lg shadow-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                Trustpilot
              </div>
              <div className="px-6 py-3 rounded-lg shadow-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                Course Report
              </div>
              <div className="px-6 py-3 rounded-lg shadow-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                LinkedIn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stat