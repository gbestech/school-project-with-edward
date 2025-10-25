/**
 * Exam Data Normalization Utilities
 * Ensures compatibility between Teacher and Admin dashboards
 */

/**
 * Normalize exam data before saving to ensure compatibility
 * Converts teacher format to unified format
 */
export const normalizeExamDataForSave = (examData: any) => {
  const normalized = { ...examData };

  // Normalize objective questions
  if (normalized.objective_questions?.length > 0) {
    normalized.objective_questions = normalized.objective_questions.map((q: any) => ({
      ...q,
      // Ensure both imageUrl and image exist for compatibility
      image: q.imageUrl || q.image || null,
      imageUrl: q.imageUrl || q.image || null,
      image_alt: q.imageAlt || q.image_alt || null,
      // Ensure table is stringified if it's an object
      table: q.table ? (typeof q.table === 'string' ? q.table : JSON.stringify(q.table)) : null
    }));
  }

  // Normalize theory questions
  if (normalized.theory_questions?.length > 0) {
    normalized.theory_questions = normalized.theory_questions.map((q: any) => ({
      ...q,
      image: q.imageUrl || q.image || null,
      imageUrl: q.imageUrl || q.image || null,
      image_alt: q.imageAlt || q.image_alt || null,
      table: q.table ? (typeof q.table === 'string' ? q.table : JSON.stringify(q.table)) : null,
      // Normalize sub-questions
      subQuestions: (q.subQuestions || []).map((sq: any) => ({
        ...sq,
        image: sq.imageUrl || sq.image || null,
        imageUrl: sq.imageUrl || sq.image || null,
        image_alt: sq.imageAlt || sq.image_alt || null,
        table: sq.table ? (typeof sq.table === 'string' ? sq.table : JSON.stringify(sq.table)) : null,
        // Normalize sub-sub-questions
        subSubQuestions: (sq.subSubQuestions || []).map((ssq: any) => ({
          ...ssq,
          image: ssq.imageUrl || ssq.image || null,
          imageUrl: ssq.imageUrl || ssq.image || null,
          image_alt: ssq.imageAlt || ssq.image_alt || null
        }))
      }))
    }));
  }

  // Normalize practical questions
  if (normalized.practical_questions?.length > 0) {
    normalized.practical_questions = normalized.practical_questions.map((q: any) => ({
      ...q,
      image: q.imageUrl || q.image || null,
      imageUrl: q.imageUrl || q.image || null,
      image_alt: q.imageAlt || q.image_alt || null,
      table: q.table ? (typeof q.table === 'string' ? q.table : JSON.stringify(q.table)) : null
    }));
  }

  // Normalize custom sections
  if (normalized.custom_sections?.length > 0) {
    normalized.custom_sections = normalized.custom_sections.map((section: any) => ({
      ...section,
      questions: (section.questions || []).map((q: any) => ({
        ...q,
        image: q.imageUrl || q.image || null,
        imageUrl: q.imageUrl || q.image || null,
        image_alt: q.imageAlt || q.image_alt || null,
        table: q.table ? (typeof q.table === 'string' ? q.table : JSON.stringify(q.table)) : null
      }))
    }));
  }

  console.log('✅ Normalized exam data for save:', {
    objective: normalized.objective_questions?.length || 0,
    theory: normalized.theory_questions?.length || 0,
    practical: normalized.practical_questions?.length || 0,
    custom: normalized.custom_sections?.length || 0
  });

  return normalized;
};

/**
 * Normalize exam data after loading from API
 * Converts unified format to teacher format for editing
 */
export const normalizeExamDataForEdit = (examData: any) => {
  const normalized = { ...examData };

  console.log('🔄 Normalizing exam data for edit:', examData);

  // Normalize objective questions
  if (normalized.objective_questions?.length > 0) {
    normalized.objective_questions = normalized.objective_questions.map((q: any) => {
      let parsedTable = null;
      if (q.table) {
        try {
          parsedTable = typeof q.table === 'string' ? JSON.parse(q.table) : q.table;
        } catch (e) {
          console.error('Failed to parse table for objective question:', q, e);
        }
      }

      return {
        ...q,
        imageUrl: q.imageUrl || q.image || '',
        imageAlt: q.imageAlt || q.image_alt || '',
        table: parsedTable
      };
    });
  }

  // Normalize theory questions
  if (normalized.theory_questions?.length > 0) {
    normalized.theory_questions = normalized.theory_questions.map((q: any) => {
      let parsedTable = null;
      if (q.table) {
        try {
          parsedTable = typeof q.table === 'string' ? JSON.parse(q.table) : q.table;
        } catch (e) {
          console.error('Failed to parse table for theory question:', q, e);
        }
      }

      return {
        ...q,
        imageUrl: q.imageUrl || q.image || '',
        imageAlt: q.imageAlt || q.image_alt || '',
        table: parsedTable,
        // Normalize sub-questions
        subQuestions: (q.subQuestions || []).map((sq: any) => {
          let sqParsedTable = null;
          if (sq.table) {
            try {
              sqParsedTable = typeof sq.table === 'string' ? JSON.parse(sq.table) : sq.table;
            } catch (e) {
              console.error('Failed to parse table for sub-question:', sq, e);
            }
          }

          return {
            ...sq,
            imageUrl: sq.imageUrl || sq.image || '',
            imageAlt: sq.imageAlt || sq.image_alt || '',
            table: sqParsedTable,
            // Normalize sub-sub-questions
            subSubQuestions: (sq.subSubQuestions || []).map((ssq: any) => ({
              ...ssq,
              imageUrl: ssq.imageUrl || ssq.image || '',
              imageAlt: ssq.imageAlt || ssq.image_alt || ''
            }))
          };
        })
      };
    });
  }

  // Normalize practical questions
  if (normalized.practical_questions?.length > 0) {
    normalized.practical_questions = normalized.practical_questions.map((q: any) => {
      let parsedTable = null;
      if (q.table) {
        try {
          parsedTable = typeof q.table === 'string' ? JSON.parse(q.table) : q.table;
        } catch (e) {
          console.error('Failed to parse table for practical question:', q, e);
        }
      }

      return {
        ...q,
        imageUrl: q.imageUrl || q.image || '',
        imageAlt: q.imageAlt || q.image_alt || '',
        table: parsedTable
      };
    });
  }

  // Normalize custom sections
  if (normalized.custom_sections?.length > 0) {
    normalized.custom_sections = normalized.custom_sections.map((section: any) => ({
      ...section,
      questions: (section.questions || []).map((q: any) => {
        let parsedTable = null;
        if (q.table) {
          try {
            parsedTable = typeof q.table === 'string' ? JSON.parse(q.table) : q.table;
          } catch (e) {
            console.error('Failed to parse table for custom section question:', q, e);
          }
        }

        return {
          ...q,
          imageUrl: q.imageUrl || q.image || '',
          imageAlt: q.imageAlt || q.image_alt || '',
          table: parsedTable
        };
      })
    }));
  }

  console.log('✅ Normalized exam data for edit complete');

  return normalized;
};

/**
 * Normalize exam data for display (view modal)
 * Ensures consistent structure for rendering
 */
export const normalizeExamDataForDisplay = (examData: any) => {
  const normalized = { ...examData };

  console.log('🔄 Normalizing exam data for display:', examData);

  // Helper to normalize a single question
  const normalizeQuestion = (q: any) => {
    const result = { ...q };
    
    // Ensure image field exists and is a URL string
    result.image = q.image || q.imageUrl || null;
    result.imageUrl = q.imageUrl || q.image || null;
    result.image_alt = q.image_alt || q.imageAlt || '';
    
    // Ensure table is parsed object
    if (result.table) {
      if (typeof result.table === 'string') {
        try {
          result.table = JSON.parse(result.table);
          console.log('✅ Parsed table for question:', result.table);
        } catch (e) {
          console.error('❌ Failed to parse table:', result.table, e);
          result.table = null;
        }
      } else {
        console.log('✅ Table already parsed:', result.table);
      }
    }
    
    return result;
  };

  // Normalize all question types
  if (normalized.objective_questions?.length > 0) {
    normalized.objective_questions = normalized.objective_questions.map(normalizeQuestion);
  }

  if (normalized.theory_questions?.length > 0) {
    normalized.theory_questions = normalized.theory_questions.map((q: any) => {
      const normalizedQ = normalizeQuestion(q);
      
      // Normalize sub-questions
      if (normalizedQ.subQuestions?.length > 0) {
        normalizedQ.subQuestions = normalizedQ.subQuestions.map((sq: any) => {
          const normalizedSq = normalizeQuestion(sq);
          
          // Normalize sub-sub-questions
          if (normalizedSq.subSubQuestions?.length > 0) {
            normalizedSq.subSubQuestions = normalizedSq.subSubQuestions.map(normalizeQuestion);
          }
          
          return normalizedSq;
        });
      }
      
      return normalizedQ;
    });
  }

  if (normalized.practical_questions?.length > 0) {
    normalized.practical_questions = normalized.practical_questions.map(normalizeQuestion);
  }

  if (normalized.custom_sections?.length > 0) {
    normalized.custom_sections = normalized.custom_sections.map((section: any) => ({
      ...section,
      questions: (section.questions || []).map(normalizeQuestion)
    }));
  }

  console.log('✅ Normalized exam data for display complete');

  return normalized;
};