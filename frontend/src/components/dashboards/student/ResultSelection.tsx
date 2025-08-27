import React, { useState } from 'react';
import { Calendar, BookOpen, GraduationCap, ArrowRight, Download, Trophy } from 'lucide-react';

interface SelectionData {
  academicSession: string;
  term: string;
  class: string;
  resultType?: string; // 'yearly' or 'annually' for secondary classes
}

interface ResultSelectionProps {
  onSelectionComplete: (data: SelectionData) => void;
  studentName: string;
}

const ResultSelection: React.FC<ResultSelectionProps> = ({ onSelectionComplete, studentName }) => {
  const [selections, setSelections] = useState<SelectionData>({
    academicSession: '',
    term: '',
    class: '',
    resultType: ''
  });

  const [currentStep, setCurrentStep] = useState(1);

  // Mock data for selections
  const academicSessions = ['2023/2024', '2024/2025', '2025/2026'];
  const terms = ['1st Term', '2nd Term', '3rd Term'];
  const classes = [
    // Nursery Classes
    'Nursery 1', 'Nursery 2', 'Nursery 3',
    // Primary Classes
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    // Junior Secondary Classes
    'JSS 1', 'JSS 2', 'JSS 3',
    // Senior Secondary Classes
    'SSS 1', 'SSS 2', 'SSS 3'
  ];

  const handleSelection = (field: keyof SelectionData, value: string) => {
    setSelections(prev => ({ ...prev, [field]: value }));
  };

  const getNextStep = () => {
    const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
    const maxSteps = isSecondaryClass ? 4 : 3;
    
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onSelectionComplete(selections);
    }
  };

  const getPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
    
    switch (currentStep) {
      case 1: return selections.academicSession !== '';
      case 2: return selections.term !== '';
      case 3: return selections.class !== '';
      case 4: return isSecondaryClass ? selections.resultType !== '' : true;
      default: return false;
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Academic Session</h3>
              <p className="text-gray-600">Choose the academic year for your result</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {academicSessions.map((session) => (
                <button
                  key={session}
                  onClick={() => handleSelection('academicSession', session)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selections.academicSession === session
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-semibold">{session}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <BookOpen className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Term</h3>
              <p className="text-gray-600">Choose the term for your result</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {terms.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSelection('term', term)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selections.term === term
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-semibold">{term}</div>
                </button>
              ))}
            </div>
          </div>
        );
               case 3:
           return (
             <div className="space-y-6">
               <div className="text-center mb-8">
                 <GraduationCap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                 <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Class</h3>
                 <p className="text-gray-600">Choose your class level</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                 {classes.map((className) => (
                   <button
                     key={className}
                     onClick={() => handleSelection('class', className)}
                     className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                       selections.class === className
                         ? 'border-purple-500 bg-purple-50 text-purple-700'
                         : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                     }`}
                   >
                     <div className="text-lg font-semibold">{className}</div>
                   </button>
                 ))}
               </div>
             </div>
           );
         case 4:
           const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
           if (!isSecondaryClass) return null;
           
           // For senior secondary, show Termly and Annually options
           const isSeniorSecondary = selections.class.toLowerCase().includes('sss');
           
           return (
             <div className="space-y-6">
               <div className="text-center mb-8">
                 <Trophy className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                 <h3 className="text-2xl font-bold text-gray-800 mb-2">Select Result Type</h3>
                 <p className="text-gray-600">Choose the type of result you want to view</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button
                   onClick={() => handleSelection('resultType', isSeniorSecondary ? 'termly' : 'yearly')}
                   className={`p-8 rounded-xl border-2 transition-all duration-200 ${
                     selections.resultType === (isSeniorSecondary ? 'termly' : 'yearly')
                       ? 'border-orange-500 bg-orange-50 text-orange-700'
                       : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                   }`}
                 >
                   <div className="text-center">
                     <div className="text-2xl mb-2">📅</div>
                     <div className="text-xl font-semibold mb-2">{isSeniorSecondary ? 'Termly Result' : 'Yearly Result'}</div>
                     <div className="text-sm text-gray-600">{isSeniorSecondary ? 'Single term performance' : 'Complete academic year performance'}</div>
                   </div>
                 </button>
                 <button
                   onClick={() => handleSelection('resultType', 'annually')}
                   className={`p-8 rounded-xl border-2 transition-all duration-200 ${
                     selections.resultType === 'annually'
                       ? 'border-orange-500 bg-orange-50 text-orange-700'
                       : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                   }`}
                 >
                   <div className="text-center">
                     <div className="text-2xl mb-2">📊</div>
                     <div className="text-xl font-semibold mb-2">Annually Result</div>
                     <div className="text-sm text-gray-600">Annual comprehensive assessment</div>
                   </div>
                 </button>
               </div>
             </div>
           );
         default:
           return null;
    }
  };

  const getStepColor = (step: number) => {
    if (step < currentStep) return 'bg-green-500';
    if (step === currentStep) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Result Portal</h1>
        <p className="text-gray-600">Welcome, {studentName}</p>
      </div>

             {/* Progress Steps */}
       <div className="flex justify-center mb-8">
         <div className="flex items-center space-x-4">
           {(() => {
             const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
             const steps = isSecondaryClass ? [1, 2, 3, 4] : [1, 2, 3];
             
             return steps.map((step) => (
               <div key={step} className="flex items-center">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getStepColor(step)}`}>
                   {step}
                 </div>
                 {step < steps.length && (
                   <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                 )}
               </div>
             ));
           })()}
         </div>
       </div>

             {/* Step Labels */}
       <div className="flex justify-center mb-8">
         <div className="flex space-x-16">
           <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
             Academic Session
           </span>
           <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
             Term
           </span>
           <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
             Class
           </span>
           {(() => {
             const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
             return isSecondaryClass ? (
               <span className={`text-sm font-medium ${currentStep >= 4 ? 'text-orange-600' : 'text-gray-400'}`}>
                 Result Type
               </span>
             ) : null;
           })()}
         </div>
       </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {getStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={getPreviousStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
                     <button
             onClick={getNextStep}
             disabled={!canProceed()}
             className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
               canProceed()
                 ? 'bg-blue-600 text-white hover:bg-blue-700'
                 : 'bg-gray-200 text-gray-400 cursor-not-allowed'
             }`}
           >
             <span>{(() => {
               const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
               const maxSteps = isSecondaryClass ? 4 : 3;
               return currentStep === maxSteps ? 'View Result' : 'Next';
             })()}</span>
             {(() => {
               const isSecondaryClass = selections.class.toLowerCase().includes('jss') || selections.class.toLowerCase().includes('sss');
               const maxSteps = isSecondaryClass ? 4 : 3;
               return currentStep === maxSteps ? <Download className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />;
             })()}
           </button>
        </div>
      </div>

             {/* Selection Summary */}
       {(selections.academicSession || selections.term || selections.class || selections.resultType) && (
         <div className="mt-6 bg-blue-50 rounded-xl p-4">
           <h4 className="font-semibold text-blue-800 mb-2">Selection Summary:</h4>
           <div className="flex flex-wrap gap-4 text-sm">
             {selections.academicSession && (
               <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                 Session: {selections.academicSession}
               </span>
             )}
             {selections.term && (
               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                 Term: {selections.term}
               </span>
             )}
             {selections.class && (
               <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                 Class: {selections.class}
               </span>
             )}
             {selections.resultType && (
               <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                 Type: {selections.resultType.charAt(0).toUpperCase() + selections.resultType.slice(1)}
               </span>
             )}
           </div>
         </div>
       )}
    </div>
  );
};

export default ResultSelection;
