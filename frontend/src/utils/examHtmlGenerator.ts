// utils/examHtmlGenerator.ts
import { Exam } from "../services/ExamService";

export function generateExamHtml(exam: Exam): string {
  const renderList = (title: string, questions: any[], renderer: (q: any, idx: number) => string) =>
    questions?.length
      ? `<div style="margin-top: 20px;"><h3 style="border-bottom: 2px solid #333; padding-bottom: 10px;">${title}</h3><ol>${questions.map(renderer).join("")}</ol></div>`
      : "";

interface ObjectiveQuestion {
    question?: string;
    optionA?: string;
    option_a?: string;
    optionB?: string;
    option_b?: string;
    optionC?: string;
    option_c?: string;
    optionD?: string;
    option_d?: string;
    marks?: number;
}

interface SubQuestion {
    question?: string;
    expected_points?: string | number;
    expectedPoints?: string | number;
    word_limit?: number;
    wordLimit?: number;
    marks?: number;
}

interface TheoryQuestion {
    question?: string;
    expected_points?: string | number;
    expectedPoints?: string | number;
    word_limit?: number;
    wordLimit?: number;
    marks?: number;
    subQuestions?: SubQuestion[];
}

interface PracticalQuestion {
    task?: string;
    question?: string;
    materials?: string;
    expected_outcome?: string;
    expectedOutcome?: string;
    time_limit?: string | number;
    timeLimit?: string | number;
    marks?: number;
}

interface CustomQuestion {
    question?: string;
    word_limit?: number;
    wordLimit?: number;
    marks?: number;
}

interface CustomSection {
    name?: string;
    instructions?: string;
    questions?: CustomQuestion[];
}

let html: string = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${exam.title}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                line-height: 1.6;
                color: #333;
            }
            h1 { 
                border-bottom: 3px solid #007bff; 
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            h2, h3 { 
                color: #0056b3;
                margin-top: 20px;
            }
            .exam-header {
                background-color: #f0f0f0;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .exam-header p {
                margin: 5px 0;
            }
            .instructions {
                background-color: #fff3cd;
                padding: 15px;
                border-left: 4px solid #ffc107;
                margin: 15px 0;
                border-radius: 3px;
            }
            .question {
                margin-bottom: 15px;
                page-break-inside: avoid;
            }
            .question ol { margin-top: 8px; }
            .question li { margin: 8px 0; }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 10px 0;
            }
            table, th, td {
                border: 1px solid #ddd;
            }
            th, td {
                padding: 8px;
                text-align: left;
            }
            img {
                max-width: 100%;
                height: auto;
                margin: 10px 0;
            }
            @media print {
                body { margin: 20px; }
                .question { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <h1>${exam.title}</h1>
        
        <div class="exam-header">
            <p><strong>Code:</strong> ${exam.code || "N/A"}</p>
            <p><strong>Subject:</strong> ${exam.subject_name || exam.subject || "N/A"}</p>
            <p><strong>Grade Level:</strong> ${exam.grade_level_name || exam.grade_level || "N/A"}</p>
            <p><strong>Exam Type:</strong> ${exam.exam_type_display || exam.exam_type || "N/A"}</p>
            <p><strong>Difficulty Level:</strong> ${exam.difficulty_level_display || exam.difficulty_level || "N/A"}</p>
            <p><strong>Date:</strong> ${exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : "N/A"}</p>
            <p><strong>Time:</strong> ${exam.start_time || "N/A"} - ${exam.end_time || "N/A"}</p>
            <p><strong>Duration:</strong> ${exam.duration_minutes || "N/A"} minutes</p>
            <p><strong>Total Marks:</strong> ${exam.total_marks || 0}</p>
            <p><strong>Pass Marks:</strong> ${exam.pass_marks || "N/A"}</p>
            ${exam.venue ? `<p><strong>Venue:</strong> ${exam.venue}</p>` : ""}
            ${exam.max_students ? `<p><strong>Max Students:</strong> ${exam.max_students}</p>` : ""}
        </div>

        ${
            exam.instructions
                ? `<div class="instructions"><strong>General Instructions:</strong><br/>${exam.instructions}</div>`
                : ""
        }

        ${
            exam.materials_allowed
                ? `<div class="instructions"><strong>Materials Allowed:</strong><br/>${exam.materials_allowed}</div>`
                : ""
        }

        ${
            exam.materials_provided
                ? `<div class="instructions"><strong>Materials Provided:</strong><br/>${exam.materials_provided}</div>`
                : ""
        }

        <!-- OBJECTIVE QUESTIONS SECTION -->
        ${
            exam.objective_questions?.length
                ? `
                    <h2>Section A: Objective Questions</h2>
                    ${
                        exam.objective_instructions
                            ? `<div class="instructions">${exam.objective_instructions}</div>`
                            : ""
                    }
                    ${exam.objective_questions
                        .map(
                            (q: ObjectiveQuestion, idx: number) => `
                        <div class="question">
                            <strong>${idx + 1}. ${q.question || ""}</strong>
                            <ol type="A">
                                <li>${q.optionA || q.option_a || ""}</li>
                                <li>${q.optionB || q.option_b || ""}</li>
                                <li>${q.optionC || q.option_c || ""}</li>
                                <li>${q.optionD || q.option_d || ""}</li>
                            </ol>
                            <p style="margin-top: 10px; color: #666;"><em>Marks: ${q.marks || 1}</em></p>
                        </div>
                    `
                        )
                        .join("")}
                `
                : ""
        }

        <!-- THEORY QUESTIONS SECTION -->
        ${
            exam.theory_questions?.length
                ? `
                    <h2>Section B: Theory Questions</h2>
                    ${
                        exam.theory_instructions
                            ? `<div class="instructions">${exam.theory_instructions}</div>`
                            : ""
                    }
                    ${exam.theory_questions
                        .map(
                            (q: TheoryQuestion, idx: number) => `
                        <div class="question">
                            <strong>${idx + 1}. ${q.question || ""}</strong>
                            ${q.expectedPoints ? `<p><strong>Expected Points:</strong> ${q.expected_points || q.expectedPoints}</p>` : ""}
                            ${q.wordLimit || q.word_limit ? `<p><strong>Word Limit:</strong> ${q.word_limit || q.wordLimit} words</p>` : ""}
                            <p style="margin-top: 10px; color: #666;"><em>Marks: ${q.marks || 1}</em></p>
                            ${
                                q.subQuestions && q.subQuestions.length
                                    ? `
                                <div style="margin-left: 20px; margin-top: 10px;">
                                    <strong>Sub-questions:</strong>
                                    <ol>
                                        ${q.subQuestions
                                            .map(
                                                (sq: SubQuestion) => `
                                            <li>
                                                ${sq.question || ""}
                                                ${sq.expectedPoints ? `<br/><em>Expected: ${sq.expected_points || sq.expectedPoints}</em>` : ""}
                                                ${sq.wordLimit || sq.word_limit ? `<br/><em>Word Limit: ${sq.word_limit || sq.wordLimit}</em>` : ""}
                                                <br/><em>Marks: ${sq.marks || 1}</em>
                                            </li>
                                        `
                                            )
                                            .join("")}
                                    </ol>
                                </div>
                            `
                                    : ""
                            }
                        </div>
                    `
                        )
                        .join("")}
                `
                : ""
        }

        <!-- PRACTICAL QUESTIONS SECTION -->
        ${
            exam.practical_questions?.length
                ? `
                    <h2>Section C: Practical Questions</h2>
                    ${
                        exam.practical_instructions
                            ? `<div class="instructions">${exam.practical_instructions}</div>`
                            : ""
                    }
                    ${exam.practical_questions
                        .map(
                            (q: PracticalQuestion, idx: number) => `
                        <div class="question">
                            <strong>${idx + 1}. ${q.task || q.question || ""}</strong>
                            ${q.materials ? `<p><strong>Materials Required:</strong> ${q.materials}</p>` : ""}
                            ${q.expectedOutcome || q.expected_outcome ? `<p><strong>Expected Outcome:</strong> ${q.expected_outcome || q.expectedOutcome}</p>` : ""}
                            ${q.timeLimit || q.time_limit ? `<p><strong>Time Limit:</strong> ${q.time_limit || q.timeLimit}</p>` : ""}
                            <p style="margin-top: 10px; color: #666;"><em>Marks: ${q.marks || 1}</em></p>
                        </div>
                    `
                        )
                        .join("")}
                `
                : ""
        }

        <!-- CUSTOM SECTIONS -->
        ${
            exam.custom_sections?.length
                ? exam.custom_sections
                        .map(
                            (section: CustomSection, sidx: number) => `
                    <h2>Section ${String.fromCharCode(68 + sidx)}: ${section.name || "Custom Section"}</h2>
                    ${
                        section.instructions
                            ? `<div class="instructions">${section.instructions}</div>`
                            : ""
                    }
                    ${
                        section.questions && section.questions.length
                            ? section.questions
                                    .map(
                                        (q: CustomQuestion, qidx: number) => `
                                <div class="question">
                                    <strong>${qidx + 1}. ${q.question || ""}</strong>
                                    ${q.wordLimit || q.word_limit ? `<p><strong>Word Limit:</strong> ${q.word_limit || q.wordLimit} words</p>` : ""}
                                    <p style="margin-top: 10px; color: #666;"><em>Marks: ${q.marks || 1}</em></p>
                                </div>
                            `
                                    )
                                    .join("")
                            : ""
                    }
                `
                        )
                        .join("")
                : ""
        }

        <!-- FOOTER -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px;">
            <p>This is an exam paper generated on ${new Date().toLocaleString()}</p>
            <p>Status: ${exam.status_display || exam.status}</p>
        </div>
    </body>
    </html>
`;

  return html;
}
