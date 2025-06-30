
import { useState, useEffect } from 'react'

// Service data
const services = [
  {
    id: 1,
    title: 'Solar Expert',
    description: 'Professional solar panel installation and maintenance services',
    icon: '☀️',
    gradient: 'from-yellow-400 to-orange-500',
    bgGradient: 'from-yellow-400/10 to-orange-500/10'
  },
  {
    id: 2,
    title: 'AC Installer',
    description: 'Complete air conditioning system installation and repair',
    icon: '❄️',
    gradient: 'from-blue-400 to-cyan-500',
    bgGradient: 'from-blue-400/10 to-cyan-500/10'
  },
  {
    id: 3,
    title: 'House Wiring',
    description: 'Comprehensive electrical wiring for residential properties',
    icon: '⚡',
    gradient: 'from-purple-400 to-pink-500',
    bgGradient: 'from-purple-400/10 to-pink-500/10'
  },
  {
    id: 4,
    title: 'General Electricals',
    description: 'All types of electrical installations and maintenance',
    icon: '🔧',
    gradient: 'from-green-400 to-emerald-500',
    bgGradient: 'from-green-400/10 to-emerald-500/10'
  },
  {
    id: 5,
    title: 'Solar Battery Repair',
    description: 'Expert repair and maintenance of solar battery systems',
    icon: '🔋',
    gradient: 'from-red-400 to-rose-500',
    bgGradient: 'from-red-400/10 to-rose-500/10'
  },
  {
    id: 6,
    title: 'Power Switcher',
    description: 'Automatic power switching systems installation',
    icon: '🔄',
    gradient: 'from-indigo-400 to-blue-500',
    bgGradient: 'from-indigo-400/10 to-blue-500/10'
  }
]

// Background particles component
const BackgroundParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute size-2 bg-cyan-400/20 rounded-full animate-float-particles"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${5 + Math.random() * 5}s`
        }}
      />
    ))}
  </div>
)

// Service card component
type Service = {
  id: number
  title: string
  description: string
  icon: string
  gradient: string
  bgGradient: string
}

type ServiceCardProps = {
  service: Service
  index: number
  isActive: boolean
}

const ServiceCard = ({ service, index, isActive }: ServiceCardProps) => (
  <div 
    className={`
      relative group cursor-pointer transition-all duration-700 transform
      ${isActive ? 'scale-105 z-10' : 'scale-95 opacity-80'}
      hover:scale-110 hover:z-20
    `}
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {/* Card container */}
    <div className={`
      relative overflow-hidden rounded-3xl p-8 pt-12 h-80 w-72
      bg-gradient-to-br ${service.bgGradient}
      backdrop-blur-sm border border-white/10
      shadow-[0_8px_32px_rgb(0_0_0/0.3)]
      hover:shadow-[0_20px_60px_rgb(6_182_212/0.4)]
      transition-all duration-500
      group-hover:border-cyan-400/40
    `}>
      
      {/* Animated background gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 
        group-hover:opacity-20 transition-opacity duration-500
      `} />
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center h-full">
        
        {/* Icon with animation */}
        <div className="mb-6 relative">
          <div className={`
            text-6xl mb-4 transform transition-all duration-500
            group-hover:scale-125 group-hover:rotate-12
            drop-shadow-[0_0_20px_rgb(6_182_212/0.5)]
          `}>
            {service.icon}
          </div>
          
          {/* Rotating ring around icon */}
          <div className="absolute inset-0 size-20 mx-auto border-2 border-cyan-400/30 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Title */}
        <h3 className={`
          text-2xl font-bold mb-4 text-white
          bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent
          group-hover:text-white transition-all duration-300
        `}>
          {service.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          {service.description}
        </p>
        
        {/* Hover indicator */}
        <div className="mt-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-4 right-4 size-8 border-t-2 border-r-2 border-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  </div>
)

// Play/Pause Toggle Slider Component
type PlayPauseSliderProps = {
  isPlaying: boolean
  onToggle: () => void
}

const PlayPauseSlider = ({ isPlaying, onToggle }: PlayPauseSliderProps) => (
  <div className="flex items-center justify-center mt-8 mb-4">
    <div className="flex items-center space-x-4 px-6 py-3 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-full border border-cyan-400/30 shadow-[0_8px_32px_rgb(0_0_0/0.3)]">
      {/* Pause text - only visible when not playing */}
      {!isPlaying && (
        <span className="text-sm font-medium text-gray-400 transition-all duration-300">
          Pause
        </span>
      )}
      
      <button
        onClick={onToggle}
        className={`
          relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out
          ${isPlaying ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-gray-600'}
          hover:shadow-[0_0_20px_rgb(6_182_212/0.5)]
        `}
      >
        <div className={`
          absolute top-1 size-6 bg-white rounded-full shadow-lg
          transition-all duration-300 ease-in-out transform
          ${isPlaying ? 'translate-x-9' : 'translate-x-1'}
          flex items-center justify-center
        `}>
          {isPlaying ? (
            <svg className="size-3 text-cyan-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          ) : (
            <svg className="size-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          )}
        </div>
      </button>
      
      {/* Play text - only visible when playing */}
      {isPlaying && (
        <span className="text-sm font-medium text-gray-400 transition-all duration-300">
          Play
        </span>
      )}
    </div>
  </div>
)

const MultiCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Auto-advance carousel
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % services.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % services.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + services.length) % services.length)
  }

  const getVisibleServices = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % services.length
      visible.push({ ...services[index], isActive: i === 1 })
    }
    return visible
  }

  return (
    <section className="relative w-full bg-gradient-to-br from-gray-900 via-slate-800 to-black py-24 overflow-hidden">
      
      {/* Background Effects */}
      <BackgroundParticles />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(rgb(6_182_212/0.1)_1px,transparent_1px),linear-gradient(90deg,rgb(6_182_212/0.1)_1px,transparent_1px)] bg-[length:60px_60px] animate-grid-drift" />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="size-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 font-medium tracking-widest uppercase text-sm">Our Expertise</span>
            <div className="size-3 bg-cyan-400 rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent leading-tight">
            Main Services
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-8 animate-pulse-slow" />
          
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Ihemsadiele & Sons Ltd. delivers comprehensive electrical solutions including 
            solar installations, AC systems, house wiring, and maintenance services. 
            Your trusted partner for reliable power solutions.
          </p>
        </div>
        
        {/* Carousel Container */}
        <div className="relative w-full max-w-7xl mx-auto">
          
          {/* Services Display */}
          <div className="flex items-center justify-center space-x-8 mb-12">
            {getVisibleServices().map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                isActive={service.isActive}
              />
            ))}
          </div>
          
          {/* Enhanced Navigation Controls Container */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8 px-8 py-4 bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-lg rounded-2xl border border-cyan-400/20 shadow-[0_8px_32px_rgb(0_0_0/0.4)]">
              
              {/* Previous Button */}
              <button
                onClick={prevSlide}
                className="group relative p-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl border border-cyan-400/30 hover:border-cyan-400 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgb(6_182_212/0.4)]"
              >
                <svg className="size-5 text-cyan-400 transform group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-500/10 rounded-xl transition-all duration-300" />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex items-center space-x-2 px-4">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      size-2.5 rounded-full transition-all duration-300
                      ${index === currentIndex 
                        ? 'bg-cyan-400 scale-125 shadow-[0_0_8px_rgb(6_182_212/0.8)]' 
                        : 'bg-gray-500 hover:bg-gray-400 hover:scale-110'
                      }
                    `}
                  />
                ))}
              </div>
              
              {/* Next Button */}
              <button
                onClick={nextSlide}
                className="group relative p-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl border border-cyan-400/30 hover:border-cyan-400 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgb(6_182_212/0.4)]"
              >
                <svg className="size-5 text-cyan-400 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-500/10 rounded-xl transition-all duration-300" />
              </button>
            </div>
          </div>
          
          {/* Play/Pause Slider */}
          <PlayPauseSlider 
            isPlaying={isPlaying} 
            onToggle={() => setIsPlaying(!isPlaying)} 
          />
        </div>
      </div>
      
      {/* Custom CSS */}
      <style>{`
        @keyframes float-particles {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
        }
        
        @keyframes grid-drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        .animate-float-particles { animation: float-particles 6s ease-in-out infinite; }
        .animate-grid-drift { animation: grid-drift 30s linear infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </section>
  )
}

export default MultiCarousel