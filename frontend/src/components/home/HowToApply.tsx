import React from 'react';
import { 
  GraduationCap, 
  FileText, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Star,
  Award,
  BookOpen,
  Heart
} from 'lucide-react';

const HowToApply: React.FC = () => {
  const steps = [
    {
      icon: FileText,
      title: "Complete Application Form",
      description: "Fill out our comprehensive online application form with all required student and parent information.",
      details: [
        "Student's personal information",
        "Parent/Guardian contact details",
        "Previous school records",
        "Medical information"
      ]
    },
    {
      icon: Calendar,
      title: "Schedule Assessment",
      description: "Book an academic assessment and interview to evaluate the student's current level and potential.",
      details: [
        "Academic assessment test",
        "Student interview",
        "Parent consultation",
        "Learning style evaluation"
      ]
    },
    {
      icon: Users,
      title: "Family Interview",
      description: "Meet with our admissions team to discuss educational goals and ensure the best fit for your child.",
      details: [
        "Family values discussion",
        "Educational objectives",
        "School policies review",
        "Expectations alignment"
      ]
    },
    {
      icon: CheckCircle,
      title: "Admission Decision",
      description: "Receive your admission decision within 5-7 business days after completing all requirements.",
      details: [
        "Comprehensive review",
        "Academic placement",
        "Financial aid consideration",
        "Welcome package"
      ]
    }
  ];

  const requirements = [
    {
      category: "Academic Requirements",
      items: [
        "Previous school transcripts",
        "Academic recommendation letter",
        "Standardized test scores (if available)",
        "Current grade level completion"
      ]
    },
    {
      category: "Personal Documents",
      items: [
        "Birth certificate",
        "Immunization records",
        "Recent passport photographs",
        "Parent/Guardian ID"
      ]
    },
    {
      category: "Additional Information",
      items: [
        "Medical history form",
        "Emergency contact details",
        "Transportation preferences",
        "Special needs documentation (if applicable)"
      ]
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: "Excellence in Education",
      description: "Comprehensive curriculum designed to nurture academic excellence and personal growth."
    },
    {
      icon: Award,
      title: "Qualified Teachers",
      description: "Experienced educators committed to inspiring and guiding students to reach their full potential."
    },
    {
      icon: BookOpen,
      title: "Modern Facilities",
      description: "State-of-the-art classrooms, laboratories, and learning spaces equipped with the latest technology."
    },
    {
      icon: Heart,
      title: "Holistic Development",
      description: "Focus on character building, leadership skills, and social responsibility alongside academic achievement."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              How to Apply
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join our community of learners and discover the path to academic excellence and personal growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Start Application
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Application Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple 4-Step Application Process
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our streamlined application process ensures a smooth and efficient enrollment experience for your family
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 mx-auto">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Requirements Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Application Requirements
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ensure you have all necessary documents ready to expedite your application process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {requirements.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  {category.category}
                </h3>
                <ul className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our School?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the unique advantages that make our institution the perfect choice for your child's education
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl mb-6 mx-auto w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Application Timeline
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Important dates and deadlines for the upcoming academic year
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <Clock className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Application Opens</h3>
              <p className="text-blue-100">September 1st</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <Calendar className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Early Decision</h3>
              <p className="text-blue-100">November 15th</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <FileText className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Regular Deadline</h3>
              <p className="text-blue-100">January 31st</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <GraduationCap className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">School Year Starts</h3>
              <p className="text-blue-100">August 15th</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our admissions team is here to guide you through every step of the application process
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="flex items-center justify-center gap-3 text-white">
              <Mail className="w-6 h-6 text-blue-400" />
              <span>admissions@school.com</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white">
              <Phone className="w-6 h-6 text-blue-400" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white">
              <MapPin className="w-6 h-6 text-blue-400" />
              <span>123 Education Street, City</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              Apply Now
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Schedule a Visit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToApply;





