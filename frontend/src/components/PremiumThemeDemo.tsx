import React from 'react';
import { useDesign } from '@/contexts/DesignContext';
import { Trophy, Star, Award, BookOpen, Users, Target } from 'lucide-react';

const PremiumThemeDemo: React.FC = () => {
  const { settings: designSettings } = useDesign();

  const isPremiumTheme = designSettings?.theme === 'premium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-blue-100 to-slate-200 bg-clip-text text-transparent">
              Premium Theme
            </span>
          </h1>
          <p className="text-xl text-slate-300">
            Red, Navy Blue & White - Ultra Premium Design
          </p>
        </div>

        {/* Theme Status */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Current Theme</h3>
              <p className="text-slate-300">
                {isPremiumTheme ? 'Premium Theme Active' : 'Standard Theme Active'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              isPremiumTheme 
                ? 'bg-gradient-to-r from-red-600 to-navy-800 text-white' 
                : 'bg-slate-700 text-slate-300'
            }`}>
              {designSettings?.theme || 'modern'}
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-6 border border-white/10">
            <div className="w-full h-20 bg-red-600 rounded-lg mb-4"></div>
            <h4 className="text-white font-semibold mb-2">Red Accent</h4>
            <p className="text-slate-300 text-sm">#dc2626 - Primary accent color</p>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-6 border border-white/10">
            <div className="w-full h-20 bg-navy-800 rounded-lg mb-4"></div>
            <h4 className="text-white font-semibold mb-2">Navy Blue</h4>
            <p className="text-slate-300 text-sm">#1e3a8a - Secondary color</p>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-6 border border-white/10">
            <div className="w-full h-20 bg-white rounded-lg mb-4"></div>
            <h4 className="text-white font-semibold mb-2">White</h4>
            <p className="text-slate-300 text-sm">#ffffff - Text and highlights</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              isPremiumTheme 
                ? 'bg-gradient-to-r from-red-600 to-navy-800' 
                : 'bg-blue-600'
            }`}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Premium Excellence</h4>
            <p className="text-slate-300 text-sm">
              Unmatched quality in educational delivery and outcomes
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              isPremiumTheme 
                ? 'bg-gradient-to-r from-red-600 to-navy-800' 
                : 'bg-blue-600'
            }`}>
              <Star className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Elite Standards</h4>
            <p className="text-slate-300 text-sm">
              Rigorous academic standards with proven success rates
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              isPremiumTheme 
                ? 'bg-gradient-to-r from-red-600 to-navy-800' 
                : 'bg-blue-600'
            }`}>
              <Award className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white font-semibold mb-2">Distinguished Recognition</h4>
            <p className="text-slate-300 text-sm">
              Nationally recognized for academic excellence
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
          <button 
            className="group relative text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            style={{
              background: isPremiumTheme 
                ? 'linear-gradient(135deg, #dc2626 0%, #1e3a8a 50%, #1e40af 100%)'
                : `linear-gradient(135deg, ${designSettings?.primary_color || '#3B82F6'} 0%, ${designSettings?.primary_color || '#3B82F6'}80 100%)`,
              boxShadow: isPremiumTheme
                ? '0 10px 15px -3px rgba(220, 38, 38, 0.3)'
                : `0 10px 15px -3px ${designSettings?.primary_color || '#3B82F6'}25`
            }}
          >
            <span className="relative z-10">Activate Premium Theme</span>
          </button>
          
          <button 
            className="group backdrop-blur-3xl text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-500 transform hover:scale-105 border-2 relative overflow-hidden"
            style={{
              background: isPremiumTheme 
                ? 'rgba(220, 38, 38, 0.1)'
                : 'rgba(255, 255, 255, 0.05)',
              borderColor: isPremiumTheme
                ? 'rgba(220, 38, 38, 0.3)'
                : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <span className="relative z-10">Learn More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumThemeDemo; 