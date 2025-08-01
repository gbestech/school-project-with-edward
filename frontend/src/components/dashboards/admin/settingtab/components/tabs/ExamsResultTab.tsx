import React, { useState } from 'react';
import { FileText, Settings, Eye, Plus, Trash2, Edit3, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import ToggleSwitch from '@/components/dashboards/admin/settingtab/components/ToggleSwitch';

// Types
interface MarkingScheme {
  id: number;
  name: string;
  grades: string[];
  ranges: string[];
}

interface GradingRule {
  id: number;
  subject: string;
  rule: string;
  minPass: number;
}

interface SubjectRemark {
  subject: string;
  excellent: string;
  good: string;
  fair: string;
  poor: string;
}

interface Template {
  id: string;
  name: string;
  preview: string;
}

interface EditMarkingSchemeProps {
  scheme: MarkingScheme;
  onSave: (updatedScheme: Partial<MarkingScheme>) => void;
  onCancel: () => void;
}

interface EditGradingRuleProps {
  rule: GradingRule;
  onSave: (updatedRule: Partial<GradingRule>) => void;
  onCancel: () => void;
}

const ExamsResultTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('marking');
  const [onlineSubmission, setOnlineSubmission] = useState<boolean>(true);
  const [autoGrading, setAutoGrading] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [editingScheme, setEditingScheme] = useState<number | null>(null);
  const [editingRule, setEditingRule] = useState<number | null>(null);

  const [markingSchemes, setMarkingSchemes] = useState<MarkingScheme[]>([
    { id: 1, name: 'Primary School Scheme', grades: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'], ranges: ['90-100', '80-89', '75-79', '70-74', '65-69', '60-64', '50-59', '0-49'] },
    { id: 2, name: 'Secondary School Scheme', grades: ['A1', 'A2', 'B3', 'B4', 'C5', 'C6', 'D7', 'E8', 'F9'], ranges: ['75-100', '70-74', '65-69', '60-64', '55-59', '50-54', '45-49', '40-44', '0-39'] }
  ]);

  const [gradingRules, setGradingRules] = useState<GradingRule[]>([
    { id: 1, subject: 'Mathematics', rule: 'Average of 3 tests + Final exam (60%)', minPass: 50 },
    { id: 2, subject: 'English', rule: 'Continuous assessment (40%) + Final exam (60%)', minPass: 45 },
    { id: 3, subject: 'Science', rule: 'Practical (30%) + Theory (70%)', minPass: 50 }
  ]);

  const [subjectRemarks, setSubjectRemarks] = useState<SubjectRemark[]>([
    { subject: 'Mathematics', excellent: 'Outstanding mathematical thinking', good: 'Good problem-solving skills', fair: 'Needs more practice', poor: 'Requires additional support' },
    { subject: 'English', excellent: 'Excellent communication skills', good: 'Good language proficiency', fair: 'Developing language skills', poor: 'Needs language support' }
  ]);

  const templates: Template[] = [
    { id: 'classic', name: 'Classic Template', preview: 'Traditional layout with school logo and detailed grades' },
    { id: 'modern', name: 'Modern Template', preview: 'Clean, contemporary design with visual grade indicators' },
    { id: 'detailed', name: 'Detailed Template', preview: 'Comprehensive layout with subject remarks and progress charts' }
  ];

  const handleAddMarkingScheme = (): void => {
    const newScheme: MarkingScheme = {
      id: Date.now(),
      name: 'New Marking Scheme',
      grades: ['A', 'B', 'C', 'D', 'F'],
      ranges: ['80-100', '70-79', '60-69', '50-59', '0-49']
    };
    setMarkingSchemes([...markingSchemes, newScheme]);
    setEditingScheme(newScheme.id);
  };

  const handleDeleteMarkingScheme = (id: number): void => {
    setMarkingSchemes(markingSchemes.filter(scheme => scheme.id !== id));
  };

  const handleSaveScheme = (id: number, updatedScheme: Partial<MarkingScheme>): void => {
    setMarkingSchemes(markingSchemes.map(scheme => 
      scheme.id === id ? { ...scheme, ...updatedScheme } : scheme
    ));
    setEditingScheme(null);
  };

  const handleAddGradingRule = (): void => {
    const newRule: GradingRule = {
      id: Date.now(),
      subject: 'New Subject',
      rule: 'Define grading rule',
      minPass: 50
    };
    setGradingRules([...gradingRules, newRule]);
    setEditingRule(newRule.id);
  };

  const handleNumberInput = (value: string, min: number, max: number): number => {
    const num = parseInt(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  };

  const sections = [
    { id: 'marking', label: 'Marking Schemes', icon: Settings },
    { id: 'templates', label: 'Report Templates', icon: FileText },
    { id: 'remarks', label: 'Subject Remarks', icon: Edit3 },
    { id: 'rules', label: 'Grading Rules', icon: CheckCircle }
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
      <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        Exams & Results
      </h3>

      {/* Toggle Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ToggleSwitch
          id="online-submission"
          checked={onlineSubmission}
          onChange={(checked) => setOnlineSubmission(checked)}
          label="Online Result Submission"
          description="Allow teachers to submit results online"
        />
        <ToggleSwitch
          id="auto-grading"
          checked={autoGrading}
          onChange={(checked) => setAutoGrading(checked)}
          label="Auto-Grade Generation"
          description="Automatically generate grades based on rules"
        />
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
        {sections.map(section => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeSection === section.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label={`Switch to ${section.label} section`}
            >
              <IconComponent className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Marking Schemes Section */}
      {activeSection === 'marking' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-slate-900">Marking Scheme Configuration</h4>
            <button
              onClick={handleAddMarkingScheme}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Add new marking scheme"
            >
              <Plus className="w-4 h-4" />
              Add Scheme
            </button>
          </div>

          <div className="grid gap-4">
            {markingSchemes.map(scheme => (
              <div key={scheme.id} className="border border-slate-200 rounded-xl p-6">
                {editingScheme === scheme.id ? (
                  <EditMarkingScheme
                    scheme={scheme}
                    onSave={(updatedScheme) => handleSaveScheme(scheme.id, updatedScheme)}
                    onCancel={() => setEditingScheme(null)}
                  />
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="font-semibold text-slate-900">{scheme.name}</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingScheme(scheme.id)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label={`Edit ${scheme.name}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMarkingScheme(scheme.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Delete ${scheme.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {scheme.grades.map((grade, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg p-3 text-center">
                          <div className="font-semibold text-slate-900">{grade}</div>
                          <div className="text-sm text-slate-600">{scheme.ranges[index]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Templates Section */}
      {activeSection === 'templates' && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-slate-900">Report Card Template Selection</h4>
          
          <div className="grid gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTemplate(template.id);
                  }
                }}
                aria-label={`Select ${template.name} template`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold text-slate-900 mb-2">{template.name}</h5>
                    <p className="text-slate-600">{template.preview}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle preview functionality
                      }}
                      aria-label={`Preview ${template.name} template`}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    {selectedTemplate === template.id && (
                      <div className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Remarks Section */}
      {activeSection === 'remarks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-slate-900">Subject-Based Remarks</h4>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Handle adding new subject
                const newSubject: SubjectRemark = {
                  subject: 'New Subject',
                  excellent: '',
                  good: '',
                  fair: '',
                  poor: ''
                };
                setSubjectRemarks([...subjectRemarks, newSubject]);
              }}
              aria-label="Add new subject for remarks"
            >
              <Plus className="w-4 h-4" />
              Add Subject
            </button>
          </div>

          <div className="space-y-4">
            {subjectRemarks.map((remark, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-6">
                <h5 className="font-semibold text-slate-900 mb-4">{remark.subject}</h5>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Excellent Performance</label>
                      <textarea
                        defaultValue={remark.excellent}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        aria-label={`Excellent performance remark for ${remark.subject}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Good Performance</label>
                      <textarea
                        defaultValue={remark.good}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        aria-label={`Good performance remark for ${remark.subject}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fair Performance</label>
                      <textarea
                        defaultValue={remark.fair}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        aria-label={`Fair performance remark for ${remark.subject}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Poor Performance</label>
                      <textarea
                        defaultValue={remark.poor}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        aria-label={`Poor performance remark for ${remark.subject}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grading Rules Section */}
      {activeSection === 'rules' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-slate-900">Auto-Grade Generation Rules</h4>
            <button
              onClick={handleAddGradingRule}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Add new grading rule"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>

          <div className="space-y-4">
            {gradingRules.map(rule => (
              <div key={rule.id} className="border border-slate-200 rounded-xl p-6">
                {editingRule === rule.id ? (
                  <EditGradingRule
                    rule={rule}
                    onSave={(updatedRule) => {
                      setGradingRules(gradingRules.map(r => r.id === rule.id ? { ...r, ...updatedRule } : r));
                      setEditingRule(null);
                    }}
                    onCancel={() => setEditingRule(null)}
                  />
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold text-slate-900 mb-2">{rule.subject}</h5>
                      <p className="text-slate-600 mb-2">{rule.rule}</p>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-slate-600">Minimum passing score: {rule.minPass}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRule(rule.id)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label={`Edit grading rule for ${rule.subject}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setGradingRules(gradingRules.filter(r => r.id !== rule.id))}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Delete grading rule for ${rule.subject}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Marking Scheme Component
const EditMarkingScheme: React.FC<EditMarkingSchemeProps> = ({ scheme, onSave, onCancel }) => {
  const [name, setName] = useState<string>(scheme.name);
  const [grades, setGrades] = useState<string[]>([...scheme.grades]);
  const [ranges, setRanges] = useState<string[]>([...scheme.ranges]);

  const handleAddGrade = (): void => {
    setGrades([...grades, 'New']);
    setRanges([...ranges, '0-0']);
  };

  const handleRemoveGrade = (index: number): void => {
    setGrades(grades.filter((_, i) => i !== index));
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const handleSave = (): void => {
    if (name.trim()) {
      onSave({ name: name.trim(), grades, ranges });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Scheme Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Scheme name"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-slate-700">Grades & Ranges</label>
          <button
            onClick={handleAddGrade}
            className="text-sm text-blue-600 hover:text-blue-700"
            aria-label="Add new grade"
          >
            + Add Grade
          </button>
        </div>
        <div className="space-y-2">
          {grades.map((grade, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                type="text"
                value={grade}
                onChange={(e) => {
                  const newGrades = [...grades];
                  newGrades[index] = e.target.value;
                  setGrades(newGrades);
                }}
                className="w-20 p-2 border border-slate-300 rounded-lg text-center"
                placeholder="Grade"
                aria-label={`Grade ${index + 1}`}
              />
              <input
                type="text"
                value={ranges[index]}
                onChange={(e) => {
                  const newRanges = [...ranges];
                  newRanges[index] = e.target.value;
                  setRanges(newRanges);
                }}
                className="flex-1 p-2 border border-slate-300 rounded-lg"
                placeholder="0-100"
                aria-label={`Range for grade ${index + 1}`}
              />
              {grades.length > 1 && (
                <button
                  onClick={() => handleRemoveGrade(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label={`Remove grade ${index + 1}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={!name.trim()}
          aria-label="Save marking scheme"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          aria-label="Cancel editing"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Edit Grading Rule Component
const EditGradingRule: React.FC<EditGradingRuleProps> = ({ rule, onSave, onCancel }) => {
  const [subject, setSubject] = useState<string>(rule.subject);
  const [ruleText, setRuleText] = useState<string>(rule.rule);
  const [minPass, setMinPass] = useState<number>(rule.minPass);

  const handleSave = (): void => {
    if (subject.trim() && ruleText.trim()) {
      onSave({ subject: subject.trim(), rule: ruleText.trim(), minPass });
    }
  };

  const handleNumberInput = (value: string, min: number, max: number): number => {
    const num = parseInt(value);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Subject name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Grading Rule</label>
        <textarea
          value={ruleText}
          onChange={(e) => setRuleText(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          aria-label="Grading rule description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Passing Score (%)</label>
        <input
          type="number"
          value={minPass}
          onChange={(e) => setMinPass(handleNumberInput(e.target.value, 0, 100))}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min="0"
          max="100"
          aria-label="Minimum passing score percentage"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={!subject.trim() || !ruleText.trim()}
          aria-label="Save grading rule"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          aria-label="Cancel editing"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExamsResultTab;