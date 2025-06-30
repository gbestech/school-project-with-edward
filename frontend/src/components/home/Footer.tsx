// components/Footer.tsx
import React from 'react';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Heart,
  ArrowUp,
  BookOpen,
  Users,
  Sparkles,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  Star
} from 'lucide-react';

interface FooterProps {
  isDashboard?: boolean;
}
import NewsLetter from './NewsLetter';
import Stat from './Stat';

const Footer: React.FC<FooterProps> = ({ isDashboard = false }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    platform: [
      { name: 'Courses', href: '#courses', icon: BookOpen },
      { name: 'Teachers', href: '#teachers', icon: Users },
      { name: 'Students', href: '#students', icon: GraduationCap },
      { name: 'Parents', href: '#parents', icon: Heart }
    ],
    resources: [
      { name: 'Help Center', href: '#help', icon: Shield },
      { name: 'Documentation', href: '#docs', icon: BookOpen },
      { name: 'API Reference', href: '#api', icon: Zap },
      { name: 'Tutorials', href: '#tutorials', icon: Star }
    ],
    company: [
      { name: 'About Us', href: '#about', icon: Globe },
      { name: 'Careers', href: '#careers', icon: TrendingUp },
      { name: 'Press Kit', href: '#press', icon: Sparkles },
      { name: 'Contact', href: '#contact', icon: Mail }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-500', name: 'Facebook', bgColor: 'hover:bg-blue-500/10' },
    { icon: Twitter, href: '#', color: 'hover:text-sky-500', name: 'Twitter', bgColor: 'hover:bg-sky-500/10' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-500', name: 'Instagram', bgColor: 'hover:bg-pink-500/10' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-600', name: 'LinkedIn', bgColor: 'hover:bg-blue-600/10' },
    { icon: Youtube, href: '#', color: 'hover:text-red-500', name: 'YouTube', bgColor: 'hover:bg-red-500/10' }
  ];

  // 
  if (isDashboard) {
    return (
      <footer className="bg-white/70 backdrop-blur-xl border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Brand */}
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-105">
                <GraduationCap className="text-white transition-transform duration-300 group-hover:rotate-12" size={20} />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  AI HUSTLE DAILY
                </span>
                <div className="text-xs text-gray-500 font-medium">Dashboard</div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                © {currentYear} AI Hustle Daily. All rights reserved.
              </p>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <span className="text-xs text-gray-500">Made with</span>
                <Heart className="text-red-500 fill-current animate-pulse" size={12} />
                <span className="text-xs text-gray-500">in Nigeria</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-transparent via-white/5 to-transparent rounded-full animate-spin slow-spin"></div>
      </div>

      {/* Newsletter Section */}
      <NewsLetter />
      {/* Stats */}
      <Stat/>

      {/* Main Footer Content */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-blue-500/40 group-hover:scale-110 group-hover:rotate-12">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    AI HUSTLE DAILY
                  </span>
                </div>
              </div>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering the next generation with cutting-edge AI education and innovative learning experiences. Join thousands of students transforming their future.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 group cursor-pointer">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                    <Mail size={16} />
                  </div>
                  <span>contact@aihustledaily.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 group cursor-pointer">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300">
                    <Phone size={16} />
                  </div>
                  <span>+234 (0) 123 456 7890</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 group cursor-pointer">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-300">
                    <MapPin size={16} />
                  </div>
                  <span>Lagos, Nigeria</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-400 ${social.color} ${social.bgColor} border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-lg group`}
                    aria-label={social.name}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).slice(0, 3).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-white font-semibold mb-6 capitalize relative">
                  {category}
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </h4>
                <ul className="space-y-4">
                  {links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="flex items-center space-x-3 text-gray-400 hover:text-white transition-all duration-300 group"
                      >
                        {'icon' in link && link.icon && (
                          <div className="w-6 h-6 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                            <link.icon size={14} />
                          </div>
                        )}
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
                {footerLinks.legal.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="hover:text-white transition-colors duration-300 hover:underline"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  © {currentYear} AI Hustle Daily. All rights reserved.
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Made with</span>
                  <Heart className="text-red-500 fill-current animate-pulse" size={12} />
                  <span className="text-xs text-gray-500">in Nigeria</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-110 flex items-center justify-center group z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="transition-transform duration-300 group-hover:-translate-y-1" size={20} />
      </button>

      <style>{`
        @keyframes slow-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .slow-spin {
          animation: slow-spin 20s linear infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;