import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Target, 
  Globe,
  ArrowDown,
  Play,
  Star
} from 'lucide-react';


interface HeroSectionProps {
  setIsLoginOpen: (open: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ setIsLoginOpen }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { 
      icon: Zap, 
      title: 'AI-Powered Intelligence', 
      desc: 'Advanced algorithms that adapt to your learning style in real-time', 
      color: 'from-yellow-400 via-orange-400 to-red-500',
      delay: '0ms'
    },
    { 
      icon: Target, 
      title: 'Precision Personalization', 
      desc: 'Curated content paths designed specifically for your goals', 
      color: 'from-emerald-400 via-teal-400 to-blue-500',
      delay: '200ms'
    },
    { 
      icon: Globe, 
      title: 'Global Excellence', 
      desc: 'World-class education accessible from anywhere, anytime', 
      color: 'from-purple-400 via-pink-400 to-rose-500',
      delay: '400ms'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background with Mouse Tracking */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(59, 130, 246, 0.15), 
              rgba(147, 51, 234, 0.1), 
              transparent 50%)`
          }}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen pt-24">
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto w-full text-center">
            
            {/* Premium Badge */}
            <div className={`inline-flex items-center space-x-3 bg-white/5 backdrop-blur-2xl rounded-full px-8 py-4 mb-12 border border-white/10 shadow-2xl shadow-blue-500/10 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="relative">
                <Sparkles className="text-yellow-400 animate-pulse" size={24} />
                <div className="absolute inset-0 text-yellow-400 animate-ping opacity-30">
                  <Sparkles size={24} />
                </div>
              </div>
              <span className="text-white font-semibold text-lg tracking-wide">Next Generation Learning Platform</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
            
            {/* Hero Title */}
            <div className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
                <span className="block bg-gradient-to-r from-white via-blue-100 to-slate-200 bg-clip-text text-transparent">
                  Education
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent relative">
                  Reimagined
                  <div className="absolute -right-4 top-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-80 animate-bounce"></div>
                </span>
              </h1>
            </div>
            
            {/* Subtitle */}
            <div className={`transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <p className="text-xl sm:text-2xl text-slate-300/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
                Experience the future of learning with our revolutionary AI-powered platform that 
                <span className="text-blue-300 font-medium"> adapts, evolves, and excels </span>
                with every student's unique journey.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-8 justify-center items-center mb-20 transition-all duration-1000 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 overflow-hidden min-w-[280px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="absolute inset-0 rounded-3xl border-1 border-white/20 group-hover:border-white/50 transition-colors duration-500"></div>
                
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <span>Begin Your Journey</span>
                  <div className="transform group-hover:translate-x-1 transition-transform duration-300">
                    <ChevronRight size={24} />
                  </div>
                </span>
              </button>
              
              <button className="group bg-white/5 backdrop-blur-2xl text-from-blue-500 px-12 py-5 rounded-3xl font-semibold text-xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105 border-2 border-white/10 hover:border-white/30 min-w-[280px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                  <span>Watch Experience</span>
                </span>
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className={`transition-all duration-1000 delay-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="flex flex-col items-center space-y-4 animate-bounce">
                <span className="text-slate-400 text-sm font-medium tracking-wide uppercase">Discover More</span>
                <ArrowDown className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Premium Feature Cards */}
          <div className={`max-w-7xl mx-auto w-full mt-32 transition-all duration-1000 delay-900 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 hover:bg-white/10 transition-all duration-700 transform hover:scale-105 hover:-translate-y-4 shadow-2xl hover:shadow-blue-500/20"
                  style={{ animationDelay: feature.delay }}
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
                  
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="text-white" size={36} />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-300/80 text-lg leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {feature.desc}
                  </p>

                  {/* Floating Elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-ping"></div>
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Complete App Component


export default HeroSection;