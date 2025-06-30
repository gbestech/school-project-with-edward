import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  BookOpen,
  Users,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Fingerprint,
  Globe
} from 'lucide-react';

// Types
type UserRole = 'student' | 'teacher' | 'parent';

interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

interface LoginModalProps {
  setIsLoginOpen: (val: boolean) => void;
  setIsSignupOpen: (val: boolean) => void;
  userType: UserRole;
  setUserType: (role: UserRole) => void;
  loginForm: LoginCredentials;
  setLoginForm: React.Dispatch<React.SetStateAction<LoginCredentials>>;
  handleLogin: (e: React.MouseEvent<HTMLButtonElement>) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  handleInputChange: (field: keyof LoginCredentials, value: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  setIsLoginOpen,
  setIsSignupOpen,
  userType,
  setUserType,
  loginForm,
  setLoginForm,
  handleLogin,
  showPassword,
  setShowPassword,
  handleInputChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: role selection, 2: credentials
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking for interactive effects
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(loginForm.email));
  }, [loginForm.email]);

  // Password validation
  useEffect(() => {
    setPasswordValid(loginForm.password.length >= 6);
  }, [loginForm.password]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsLoading(true);
    
    // Simulate API call with realistic timing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    handleLogin(e);
    setIsLoading(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student': return BookOpen;
      case 'teacher': return User;
      case 'parent': return Users;
      default: return User;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'student': return 'from-blue-500 to-cyan-500';
      case 'teacher': return 'from-green-500 to-emerald-500';
      case 'parent': return 'from-purple-500 to-violet-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'student': return 'Access courses, assignments, and track your progress';
      case 'teacher': return 'Manage classes, create content, and monitor student progress';
      case 'parent': return 'Monitor your child\'s progress and communicate with teachers';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div 
        className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-lg relative shadow-2xl border border-white/20 overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Interactive Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`
          }}
        />

        {/* Floating Orbs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Close Button */}
        <button 
          onClick={() => setIsLoginOpen(false)}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-all duration-300 p-2 hover:bg-gray-100/50 rounded-full z-10 hover:scale-110"
        >
          <X size={20} />
        </button>
        
        {/* Header */}
        <div className="text-center pt-12 pb-8 px-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50"></div>
            <Shield className="text-white relative z-10" size={32} />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-lg">Continue your learning journey with us</p>
        </div>

        <div className="px-8 pb-8">
          {step === 1 ? (
            // Step 1: Role Selection
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select Your Role</h3>
                <p className="text-gray-500">Choose how you'll be using our platform</p>
              </div>

              <div className="space-y-4">
                {(['student', 'teacher', 'parent'] as UserRole[]).map((type) => {
                  const Icon = getRoleIcon(type);
                  const isSelected = userType === type;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setUserType(type);
                        setLoginForm(prev => ({ ...prev, role: type }));
                      }}
                      className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] text-left relative overflow-hidden group ${
                        isSelected 
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg shadow-blue-500/20' 
                          : 'border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white/80'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isSelected 
                            ? `bg-gradient-to-r ${getRoleColor(type)} shadow-lg` 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <Icon className={isSelected ? 'text-white' : 'text-gray-600'} size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-lg font-semibold capitalize mb-2 ${
                            isSelected ? 'text-gray-800' : 'text-gray-700'
                          }`}>
                            {type}
                          </h4>
                          <p className={`text-sm ${
                            isSelected ? 'text-gray-600' : 'text-gray-500'
                          }`}>
                            {getRoleDescription(type)}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex items-center justify-center">
                            <CheckCircle className="text-green-500" size={24} />
                          </div>
                        )}
                      </div>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!userType}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none relative overflow-hidden group mt-8"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>Continue</span>
                  <ArrowRight size={20} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>
            </div>
          ) : (
            // Step 2: Credentials
            <div className="space-y-6">
              {/* Role Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor(userType)} rounded-xl flex items-center justify-center`}>
                    {React.createElement(getRoleIcon(userType), { className: 'text-white', size: 18 })}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Signing in as</p>
                    <p className="font-semibold text-gray-800 capitalize">{userType}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 backdrop-blur-sm text-lg"
                    placeholder="john@example.com"
                  />
                  {loginForm.email && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {emailValid ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <AlertCircle className="text-red-500" size={18} />
                      )}
                    </div>
                  )}
                </div>
                {loginForm.email && !emailValid && (
                  <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                    <AlertCircle size={12} />
                    <span>Please enter a valid email address</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-12 pr-20 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 backdrop-blur-sm text-lg"
                    placeholder="Enter your password"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {loginForm.password && (
                      <div>
                        {passwordValid ? (
                          <CheckCircle className="text-green-500" size={18} />
                        ) : (
                          <AlertCircle className="text-red-500" size={18} />
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {loginForm.password && !passwordValid && (
                  <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                    <AlertCircle size={12} />
                    <span>Password must be at least 6 characters</span>
                  </p>
                )}
              </div>

              {/* Security Features */}
              <div className="bg-blue-50/50 rounded-2xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Fingerprint className="text-blue-600" size={20} />
                  <span className="text-sm font-semibold text-blue-800">Secure Login</span>
                </div>
                <p className="text-xs text-blue-600">Protected by advanced encryption and security protocols</p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading || !emailValid || !passwordValid}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
              >
                {showSuccess ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="text-white" size={20} />
                    <span>Success! Redirecting...</span>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <span>Sign In Securely</span>
                      <Shield size={18} />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </>
                )}
              </button>

              {/* Alternative Options */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Globe className="text-gray-600" size={18} />
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Sparkles className="text-gray-600" size={18} />
                    <span className="text-sm font-medium text-gray-700">SSO</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500">
              New to our platform?{' '}
              <button 
                onClick={() => { setIsLoginOpen(false); setIsSignupOpen(true); }}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
              >
                Create Account
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;