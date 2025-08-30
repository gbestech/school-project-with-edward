// Utility functions to safely handle exam data

export const safeArray = <T>(arr: T[] | undefined | null): T[] => {
  return Array.isArray(arr) ? arr : [];
};

export const safeExamData = (exam: any) => {
  if (!exam) {
    return {
      objective_questions: [],
      theory_questions: [],
      practical_questions: [],
      custom_sections: [],
      objective_instructions: '',
      theory_instructions: '',
      practical_instructions: '',
    };
  }
  
  return {
    ...exam,
    objective_questions: safeArray(exam?.objective_questions),
    theory_questions: safeArray(exam?.theory_questions),
    practical_questions: safeArray(exam?.practical_questions),
    custom_sections: safeArray(exam?.custom_sections),
    objective_instructions: exam?.objective_instructions || '',
    theory_instructions: exam?.theory_instructions || '',
    practical_instructions: exam?.practical_instructions || '',
  };
};

export const safeTheoryQuestions = (questions: any[]) => {
  return questions.map(q => ({
    ...q,
    subQuestions: safeArray(q?.subQuestions).map(sq => ({
      ...sq,
      subSubQuestions: safeArray(sq?.subSubQuestions)
    }))
  }));
};

export const safeCustomSections = (sections: any[]) => {
  return sections.map(section => ({
    ...section,
    questions: safeArray(section?.questions)
  }));
};
