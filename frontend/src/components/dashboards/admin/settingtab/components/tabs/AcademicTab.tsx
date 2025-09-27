import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 

  School, 
  Calendar, 
  
  Save,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Shield,
  Target,
  TrendingUp
} from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';
import StreamConfigurationManager from '@/components/admin/StreamConfigurationManager';

const AcademicTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState('stream-config');
  const [academicSettings, setAcademicSettings] = useState({
    // Academic Year Settings
    academicYearStart: 'September',
    academicYearEnd: 'July',
    termsPerYear: 3,
    weeksPerTerm: 13,
    
    // Class Settings
    maxClassSize: 30,
    allowClassOverflow: false,
    enableStreaming: true,
    enableSubjectElectives: true,
    
    // Grading Settings
    gradingSystem: 'percentage', // percentage, letter, gpa
    passPercentage: 40,
    enableGradeCurving: false,
    enableGradeWeighting: true,
    
    // Attendance Settings
    requireAttendance: true,
    minimumAttendancePercentage: 75,
    enableAttendanceTracking: true,
    allowLateArrival: true,
    
    // Curriculum Settings
    enableCrossCuttingSubjects: true,
    enableSubjectPrerequisites: true,
    allowSubjectChanges: true,
    enableCreditSystem: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const updateAcademicSetting = (field: string, value: any) => {
    setAcademicSettings(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    { 
      id: 'stream-config', 
      label: 'Stream Configuration', 
      icon: BookOpen, 
      description: 'Configure academic streams and subject assignments',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      id: 'academic-settings', 
      label: 'Academic Year', 
      icon: Calendar, 
      description: 'Set academic calendar and term structure',
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      id: 'class-settings', 
      label: 'Class Management', 
      icon: School, 
      description: 'Configure class sizes and streaming options',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'grading-settings', 
      label: 'Grading System', 
      icon: GraduationCap, 
      description: 'Set up grading scales and assessment rules',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'attendance-settings', 
      label: 'Attendance', 
      icon: Users, 
      description: 'Configure attendance tracking and policies',
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'curriculum-settings', 
      label: 'Curriculum', 
      icon: BookOpen, 
      description: 'Manage subject prerequisites and credit system',
      color: 'from-indigo-500 to-purple-600'
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'stream-config':
        return <StreamConfigurationManager />;
      
      case 'academic-settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Academic Year Settings
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Info className="w-4 h-4" />
                  <span>Configure your academic calendar structure</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Academic Year Start
                  </label>
                  <select
                    value={academicSettings.academicYearStart}
                    onChange={(e) => updateAcademicSetting('academicYearStart', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white hover:border-slate-400"
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                  <p className="text-xs text-slate-500">Month when the academic year begins</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Academic Year End
                  </label>
                  <select
                    value={academicSettings.academicYearEnd}
                    onChange={(e) => updateAcademicSetting('academicYearEnd', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white hover:border-slate-400"
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                  <p className="text-xs text-slate-500">Month when the academic year concludes</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Terms Per Year
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={academicSettings.termsPerYear}
                    onChange={(e) => updateAcademicSetting('termsPerYear', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white hover:border-slate-400"
                  />
                  <p className="text-xs text-slate-500">Number of terms in the academic year</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Weeks Per Term
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="20"
                    value={academicSettings.weeksPerTerm}
                    onChange={(e) => updateAcademicSetting('weeksPerTerm', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white hover:border-slate-400"
                  />
                  <p className="text-xs text-slate-500">Number of weeks in each term</p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-medium text-emerald-800">Academic Year Summary</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-emerald-600 font-medium">Duration</p>
                    <p className="text-emerald-800">{academicSettings.academicYearStart} - {academicSettings.academicYearEnd}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-medium">Total Terms</p>
                    <p className="text-emerald-800">{academicSettings.termsPerYear}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-medium">Weeks per Term</p>
                    <p className="text-emerald-800">{academicSettings.weeksPerTerm}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-medium">Total Weeks</p>
                    <p className="text-emerald-800">{academicSettings.termsPerYear * academicSettings.weeksPerTerm}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'class-settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <School className="w-4 h-4 text-white" />
                  </div>
                  Class Management Settings
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Zap className="w-4 h-4" />
                  <span>Optimize class organization and capacity</span>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Maximum Class Size
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={academicSettings.maxClassSize}
                        onChange={(e) => updateAcademicSetting('maxClassSize', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white hover:border-slate-400"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                        students
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Recommended: 20-35 students per class</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-lg font-medium text-slate-800 mb-4">Class Management Features</h4>
                    <div className="space-y-4">
                      <ToggleSwitch
                        id="allow-class-overflow"
                        checked={academicSettings.allowClassOverflow}
                        onChange={(checked) => updateAcademicSetting('allowClassOverflow', checked)}
                        label="Allow Class Overflow"
                        description="Allow classes to exceed maximum size when necessary"
                      />
                      
                      <ToggleSwitch
                        id="enable-streaming"
                        checked={academicSettings.enableStreaming}
                        onChange={(checked) => updateAcademicSetting('enableStreaming', checked)}
                        label="Enable Stream-based Classes"
                        description="Organize classes by academic streams (Science, Arts, Commercial, Technical)"
                      />
                      
                      <ToggleSwitch
                        id="enable-subject-electives"
                        checked={academicSettings.enableSubjectElectives}
                        onChange={(checked) => updateAcademicSetting('enableSubjectElectives', checked)}
                        label="Enable Subject Electives"
                        description="Allow students to choose optional subjects within their stream"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'grading-settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  Grading System Settings
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Configure assessment and grading policies</span>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Grading System
                    </label>
                    <select
                      value={academicSettings.gradingSystem}
                      onChange={(e) => updateAcademicSetting('gradingSystem', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-slate-400"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="letter">Letter Grades (A-F)</option>
                      <option value="gpa">GPA (4.0 Scale)</option>
                    </select>
                    <p className="text-xs text-slate-500">Choose your preferred grading scale</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Pass Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={academicSettings.passPercentage}
                        onChange={(e) => updateAcademicSetting('passPercentage', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white hover:border-slate-400"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                        %
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Minimum score required to pass</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="text-lg font-medium text-slate-800 mb-4">Advanced Grading Features</h4>
                  <div className="space-y-4">
                    <ToggleSwitch
                      id="enable-grade-curving"
                      checked={academicSettings.enableGradeCurving}
                      onChange={(checked) => updateAcademicSetting('enableGradeCurving', checked)}
                      label="Enable Grade Curving"
                      description="Automatically adjust grades based on class performance distribution"
                    />
                    
                    <ToggleSwitch
                      id="enable-grade-weighting"
                      checked={academicSettings.enableGradeWeighting}
                      onChange={(checked) => updateAcademicSetting('enableGradeWeighting', checked)}
                      label="Enable Grade Weighting"
                      description="Apply different weights to different types of assessments"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'attendance-settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Attendance Management Settings
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Shield className="w-4 h-4" />
                  <span>Set attendance policies and tracking rules</span>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Minimum Attendance Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={academicSettings.minimumAttendancePercentage}
                        onChange={(e) => updateAcademicSetting('minimumAttendancePercentage', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white hover:border-slate-400"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                        %
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Required attendance for promotion</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="text-lg font-medium text-slate-800 mb-4">Attendance Policies</h4>
                  <div className="space-y-4">
                    <ToggleSwitch
                      id="require-attendance"
                      checked={academicSettings.requireAttendance}
                      onChange={(checked) => updateAcademicSetting('requireAttendance', checked)}
                      label="Require Attendance Tracking"
                      description="Make attendance tracking mandatory for all classes"
                    />
                    
                    <ToggleSwitch
                      id="enable-attendance-tracking"
                      checked={academicSettings.enableAttendanceTracking}
                      onChange={(checked) => updateAcademicSetting('enableAttendanceTracking', checked)}
                      label="Enable Attendance Tracking"
                      description="Allow teachers to mark student attendance"
                    />
                    
                    <ToggleSwitch
                      id="allow-late-arrival"
                      checked={academicSettings.allowLateArrival}
                      onChange={(checked) => updateAcademicSetting('allowLateArrival', checked)}
                      label="Allow Late Arrival"
                      description="Permit students to arrive late to classes"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'curriculum-settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  Curriculum Management Settings
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Target className="w-4 h-4" />
                  <span>Configure curriculum structure and requirements</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <h4 className="font-medium text-indigo-800 mb-3">Cross-Cutting Subjects</h4>
                    <p className="text-sm text-indigo-700 mb-4">Subjects that are compulsory across all streams (e.g., Mathematics, English)</p>
                    <ToggleSwitch
                      id="enable-cross-cutting-subjects"
                      checked={academicSettings.enableCrossCuttingSubjects}
                      onChange={(checked) => updateAcademicSetting('enableCrossCuttingSubjects', checked)}
                      label="Enable Cross-Cutting Subjects"
                      description=""
                    />
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <h4 className="font-medium text-purple-800 mb-3">Subject Prerequisites</h4>
                    <p className="text-sm text-purple-700 mb-4">Require students to complete certain subjects before taking advanced ones</p>
                    <ToggleSwitch
                      id="enable-subject-prerequisites"
                      checked={academicSettings.enableSubjectPrerequisites}
                      onChange={(checked) => updateAcademicSetting('enableSubjectPrerequisites', checked)}
                      label="Enable Subject Prerequisites"
                      description=""
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <ToggleSwitch
                    id="allow-subject-changes"
                    checked={academicSettings.allowSubjectChanges}
                    onChange={(checked) => updateAcademicSetting('allowSubjectChanges', checked)}
                    label="Allow Subject Changes"
                    description="Permit students to change their subject selections during the academic year"
                  />
                  
                  <ToggleSwitch
                    id="enable-credit-system"
                    checked={academicSettings.enableCreditSystem}
                    onChange={(checked) => updateAcademicSetting('enableCreditSystem', checked)}
                    label="Enable Credit System"
                    description="Use credit-based system for subject completion and graduation requirements"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <StreamConfigurationManager />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Academic Settings</h2>
              <p className="text-slate-600 mt-1">Configure your school's academic structure and policies</p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isSaving
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            saveStatus === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {saveStatus === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {saveStatus === 'success' ? 'Settings saved successfully!' : 'Error saving settings. Please try again.'}
            </span>
          </div>
        )}
        
        {/* Section Navigation */}
        <div className="flex flex-wrap gap-3 mt-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`group flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-white/20'
                  : `bg-gradient-to-br ${section.color} text-white group-hover:scale-110`
              }`}>
                <section.icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-medium">{section.label}</div>
                <div className={`text-xs ${
                  activeSection === section.id ? 'text-white/80' : 'text-slate-500'
                }`}>
                  {section.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="min-h-[600px]">
        {renderSection()}
      </div>
    </div>
  );
};

export default AcademicTab;
