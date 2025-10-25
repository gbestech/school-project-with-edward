// components/ExamFormModal.tsx
import React, { useState, useEffect } from "react";
import { ObjectiveQuestion, TheoryQuestion, PracticalQuestion, CustomSection } from "@/types/types";
import RichTextEditor from "./RichTextEditor";
import { ExamCreateData, Exam } from '@/services/ExamService';
import QuestionSectionObjectives from "./QuestionSectionObjectives";
import QuestionSectionTheory from "./QuestionSectionTheory";
import QuestionSectionPractical from "./QuestionSectionPractical";
import QuestionSectionCustom from "./QuestionSectionCustom"

interface ExamFormModalProps {
  open: boolean;
  exam?: Exam | null;
  onClose: () => void;
  onSubmit: (examData: ExamCreateData) => void;
}

const getInitialState = (exam?: Exam | null): ExamCreateData => ({
  title: exam?.title || "",
  description: exam?.description || "",
  subject: exam?.subject || 0,
  grade_level: exam?.grade_level || 0,
  exam_type: exam?.exam_type || "",
  difficulty_level: exam?.difficulty_level || "",
  exam_date: exam?.exam_date || "",
  start_time: exam?.start_time || "",
  end_time: exam?.end_time || "",
  duration_minutes: exam?.duration_minutes || 0,
  total_marks: exam?.total_marks || 0,
  pass_marks: exam?.pass_marks || 0,
  venue: exam?.venue || "",
  max_students: exam?.max_students || 0,
  instructions: exam?.instructions || "",
  materials_allowed: exam?.materials_allowed || "",
  materials_provided: exam?.materials_provided || "",
  status: exam?.status || "draft",
  is_practical: exam?.is_practical || false,
  requires_computer: exam?.requires_computer || false,
  is_online: exam?.is_online || false,
  objective_questions: exam?.objective_questions || [],
  theory_questions: exam?.theory_questions || [],
  practical_questions: exam?.practical_questions || [],
  custom_sections: exam?.custom_sections || [],
  objective_instructions: exam?.objective_instructions || "",
  theory_instructions: exam?.theory_instructions || "",
  practical_instructions: exam?.practical_instructions || "",
});

const ExamFormModal: React.FC<ExamFormModalProps> = ({ open, exam, onClose, onSubmit }) => {
  const [form, setForm] = useState<ExamCreateData>(getInitialState(exam));
  const [activeTab, setActiveTab] = useState<"general" | "objectives" | "theory" | "practical" | "custom">("general");

  useEffect(() => {
    if (open) {
      setForm(getInitialState(exam));
      setActiveTab("general"); // Reset to general tab when opening
    }
  }, [open, exam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setForm({ ...form, [name]: value === '' ? 0 : Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleObjectivesChange = (questions: ObjectiveQuestion[]) =>
    setForm((prev) => ({ ...prev, objective_questions: questions }));

  const handleTheoryChange = (questions: TheoryQuestion[]) =>
    setForm((prev) => ({ ...prev, theory_questions: questions }));

  const handlePracticalChange = (questions: PracticalQuestion[]) =>
    setForm((prev) => ({ ...prev, practical_questions: questions }));

  const handleCustomChange = (sections: CustomSection[]) =>
    setForm((prev) => ({ ...prev, custom_sections: sections }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{ 
        backgroundColor: 'white', 
        borderRadius: 8, 
        maxHeight: "90vh", 
        overflowY: "auto", 
        width: "90vw", 
        maxWidth: 1200,
        padding: 24
      }}>
        <div className="modal-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24,
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: 16
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>
            {exam ? "Edit" : "Create"} Exam
          </h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{ 
              fontSize: 32, 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              color: '#6b7280',
              padding: 0,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <div className="tab-navigation" style={{ 
          display: "flex", 
          gap: 8, 
          borderBottom: "2px solid #e5e7eb", 
          marginBottom: 24 
        }}>
          {[
            { key: "general", label: "General Info" },
            { key: "objectives", label: "Objectives" },
            { key: "theory", label: "Theory" },
            { key: "practical", label: "Practical" },
            { key: "custom", label: "Custom Sections" }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.key ? '#3b82f6' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#6b7280',
                cursor: 'pointer',
                borderRadius: '4px 4px 0 0',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "general" && (
            <div className="tab-content">
              <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold' }}>Exam Information</h3>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Exam Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Exam Title"
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Description</label>
                <RichTextEditor
                  value={form.description || ""}
                  onChange={(val) => setForm({ ...form, description: val })}
                  placeholder="Exam description..."
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Subject *</label>
                  <input
                    name="subject"
                    type="number"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Subject ID"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Grade Level *</label>
                  <input
                    name="grade_level"
                    type="number"
                    value={form.grade_level}
                    onChange={handleChange}
                    placeholder="Grade Level"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Exam Type</label>
                  <input
                    name="exam_type"
                    value={form.exam_type || ""}
                    onChange={handleChange}
                    placeholder="e.g., Midterm, Final, Quiz"
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Difficulty Level</label>
                  <select
                    name="difficulty_level"
                    value={form.difficulty_level || ""}
                    onChange={handleChange}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  >
                    <option value="">Select...</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Exam Date</label>
                  <input
                    name="exam_date"
                    type="date"
                    value={form.exam_date || ""}
                    onChange={handleChange}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Start Time</label>
                  <input
                    name="start_time"
                    type="time"
                    value={form.start_time || ""}
                    onChange={handleChange}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>End Time</label>
                  <input
                    name="end_time"
                    type="time"
                    value={form.end_time || ""}
                    onChange={handleChange}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Duration (minutes)</label>
                  <input
                    name="duration_minutes"
                    type="number"
                    value={form.duration_minutes || 0}
                    onChange={handleChange}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Total Marks *</label>
                  <input
                    name="total_marks"
                    type="number"
                    value={form.total_marks || 0}
                    onChange={handleChange}
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Pass Marks</label>
                  <input
                    name="pass_marks"
                    type="number"
                    value={form.pass_marks || 0}
                    onChange={handleChange}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Venue</label>
                  <input
                    name="venue"
                    value={form.venue || ""}
                    onChange={handleChange}
                    placeholder="Exam venue"
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Max Students</label>
                  <input
                    name="max_students"
                    type="number"
                    value={form.max_students || 0}
                    onChange={handleChange}
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 4 }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Instructions</label>
                <RichTextEditor
                  value={form.instructions || ""}
                  onChange={(val) => setForm({ ...form, instructions: val })}
                  placeholder="General exam instructions..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Materials Allowed</label>
                <RichTextEditor
                  value={form.materials_allowed || ""}
                  onChange={(val) => setForm({ ...form, materials_allowed: val })}
                  placeholder="Allowed materials..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Materials Provided</label>
                <RichTextEditor
                  value={form.materials_provided || ""}
                  onChange={(val) => setForm({ ...form, materials_provided: val })}
                  placeholder="Materials provided..."
                />
              </div>

              <div className="form-group" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="is_practical"
                    type="checkbox"
                    checked={form.is_practical || false}
                    onChange={handleCheckboxChange}
                  />
                  Is Practical
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="requires_computer"
                    type="checkbox"
                    checked={form.requires_computer || false}
                    onChange={handleCheckboxChange}
                  />
                  Requires Computer
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="is_online"
                    type="checkbox"
                    checked={form.is_online || false}
                    onChange={handleCheckboxChange}
                  />
                  Is Online
                </label>
              </div>
            </div>
          )}

          {activeTab === "objectives" && (
            <div className="tab-content">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Objective Instructions</label>
                <RichTextEditor
                  value={form.objective_instructions || ""}
                  onChange={(val) => setForm({ ...form, objective_instructions: val })}
                  placeholder="Instructions for objective section..."
                />
              </div>
              <QuestionSectionObjectives
                value={form.objective_questions ?? []}
                onChange={handleObjectivesChange}
              />
            </div>
          )}

          {activeTab === "theory" && (
            <div className="tab-content">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Theory Instructions</label>
                <RichTextEditor
                  value={form.theory_instructions || ""}
                  onChange={(val) => setForm({ ...form, theory_instructions: val })}
                  placeholder="Instructions for theory section..."
                />
              </div>
              <QuestionSectionTheory
                value={form.theory_questions ?? []}
                onChange={handleTheoryChange}
              />
            </div>
          )}

          {activeTab === "practical" && (
            <div className="tab-content">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Practical Instructions</label>
                <RichTextEditor
                  value={form.practical_instructions || ""}
                  onChange={(val) => setForm({ ...form, practical_instructions: val })}
                  placeholder="Instructions for practical section..."
                />
              </div>
              <QuestionSectionPractical
                value={form.practical_questions ?? []}
                onChange={handlePracticalChange}
              />
            </div>
          )}

          {activeTab === "custom" && (
            <div className="tab-content">
              <QuestionSectionCustom
                value={form.custom_sections ?? []}
                onChange={handleCustomChange}
              />
            </div>
          )}

          <div className="modal-footer" style={{ 
            display: "flex", 
            gap: 12, 
            justifyContent: "flex-end", 
            marginTop: 24, 
            borderTop: "2px solid #e5e7eb", 
            paddingTop: 16 
          }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                background: 'white',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{
                padding: '10px 20px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              {exam ? "Save Changes" : "Create Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamFormModal;