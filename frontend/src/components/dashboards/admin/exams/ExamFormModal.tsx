// components/ExamFormModal.tsx
import React, { useState, useEffect } from "react";
import { ObjectiveQuestion, TheoryQuestion, PracticalQuestion, CustomSection } from "@/types/types";
import RichTextEditor from "./RichTextEditor";
import { ExamService, Exam, ExamCreateData } from '@/services/ExamService';
import QuestionSectionObjectives from "./QuestionSectionObjectives";
import QuestionSectionTheory from "./QuestionSectionTheory";
import QuestionSectionPractical from "./QuestionSectionPractical";
import QuestionSectionCustom from "./QuestionSectionCustom"

interface ExamFormModalProps {
  open: boolean;
  exam?: ExamCreateData | null;
  onClose: () => void;
  onSubmit: (examData: ExamCreateData) => void;
}

const getInitialState = (exam?: ExamCreateData | null): ExamCreateData => ({
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
    if (open) setForm(getInitialState(exam));
  }, [open, exam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleObjectivesChange = (questions: ObjectiveQuestion[]) =>
    setForm((prev) => ({ ...prev, objectivequestions: questions }));

  const handleTheoryChange = (questions: TheoryQuestion[]) =>
    setForm((prev) => ({ ...prev, theoryquestions: questions }));

  const handlePracticalChange = (questions: PracticalQuestion[]) =>
    setForm((prev) => ({ ...prev, practicalquestions: questions }));

  const handleCustomChange = (sections: CustomSection[]) =>
    setForm((prev) => ({ ...prev, customsections: sections }));

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: "90vh", overflowY: "auto", width: "90vw", maxWidth: 1200 }}>
        <div className="modal-header">
          <h2>{exam ? "Edit" : "Create"} Exam</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tab-navigation" style={{ display: "flex", gap: 8, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
          <button
            className={activeTab === "general" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("general")}
          >
            General Info
          </button>
          <button
            className={activeTab === "objectives" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("objectives")}
          >
            Objectives
          </button>
          <button
            className={activeTab === "theory" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("theory")}
          >
            Theory
          </button>
          <button
            className={activeTab === "practical" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("practical")}
          >
            Practical
          </button>
          <button
            className={activeTab === "custom" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("custom")}
          >
            Custom Sections
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "general" && (
            <div className="tab-content">
              <h3>Exam Information</h3>

              <div className="form-group">
                <label>Exam Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Exam Title"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <RichTextEditor
                  value={form.description || ""}
                  onChange={(val) => setForm({ ...form, description: val })}
                  placeholder="Exam description..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    name="subject"
                    type="number"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="Subject ID"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Grade Level *</label>
                  <input
                    name="gradelevel"
                    type="number"
                    value={form.grade_level}
                    onChange={handleChange}
                    placeholder="Grade Level"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Exam Type</label>
                  <input
                    name="examtype"
                    value={form.exam_type || ""}
                    onChange={handleChange}
                    placeholder="e.g., Midterm, Final, Quiz"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty Level</label>
                  <select
                    name="difficultylevel"
                    value={form.difficulty_level || ""}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select...</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Exam Date</label>
                  <input
                    name="examdate"
                    type="date"
                    value={form.exam_date || ""}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    name="starttime"
                    type="time"
                    value={form.start_time || ""}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    name="endtime"
                    type="time"
                    value={form.end_time || ""}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    name="durationminutes"
                    type="number"
                    value={form.duration_minutes || 0}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Total Marks *</label>
                  <input
                    name="totalmarks"
                    type="number"
                    value={form.total_marks || 0}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Pass Marks</label>
                  <input
                    name="passmarks"
                    type="number"
                    value={form.pass_marks || 0}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Venue</label>
                  <input
                    name="venue"
                    value={form.venue || ""}
                    onChange={handleChange}
                    placeholder="Exam venue"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Max Students</label>
                  <input
                    name="maxstudents"
                    type="number"
                    value={form.max_students || 0}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Instructions</label>
                <RichTextEditor
                  value={form.instructions || ""}
                  onChange={(val) => setForm({ ...form, instructions: val })}
                  placeholder="General exam instructions..."
                />
              </div>

              <div className="form-group">
                <label>Materials Allowed</label>
                <RichTextEditor
                  value={form.materials_allowed || ""}
                  onChange={(val) => setForm({ ...form, materials_allowed: val })}
                  placeholder="Allowed materials..."
                />
              </div>

              <div className="form-group">
                <label>Materials Provided</label>
                <RichTextEditor
                  value={form.materials_provided || ""}
                  onChange={(val) => setForm({ ...form, materials_provided: val })}
                  placeholder="Materials provided..."
                />
              </div>

              <div className="form-group" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="ispractical"
                    type="checkbox"
                    checked={form.is_practical || false}
                    onChange={handleCheckboxChange}
                  />
                  Is Practical
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="requirescomputer"
                    type="checkbox"
                    checked={form.requires_computer || false}
                    onChange={handleCheckboxChange}
                  />
                  Requires Computer
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    name="isonline"
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
              <div className="form-group">
                <label>Objective Instructions</label>
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
              <div className="form-group">
                <label>Theory Instructions</label>
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
              <div className="form-group">
                <label>Practical Instructions</label>
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

          <div className="modal-footer" style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 24, borderTop: "1px solid #ddd", paddingTop: 16 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {exam ? "Save Changes" : "Create Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamFormModal;
