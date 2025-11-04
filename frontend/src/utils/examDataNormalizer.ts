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
// export const normalizeExamDataForEdit = (examData: any) => {
//   const normalized = { ...examData };

//   console.log('🔄 Normalizing exam data for edit:', examData);

//   // Normalize objective questions
//   if (normalized.objective_questions?.length > 0) {
//     normalized.objective_questions = normalized.objective_questions.map((q: any) => {
//       let parsedTable = null;
//       if (q.table) {
//         try {
//           parsedTable = typeof q.table === 'string' ? JSON.parse(q.table) : q.table;
//         } catch (e) {
//           console.error('Failed to parse table for objective question:', q, e);
//         }
//       }

//       return {
//         ...q,
//         imageUrl: q.imageUrl || q.image || '',
//         imageAlt: q.imageAlt || q.image_alt || '',
//         table: parsedTable
//       };
//     });
//   }

//   // Normalize theory questions
//   if (normalized.theory_questions?.length > 0) {
//     normalized.theory_questions = normalized.theory_questions.map((q: any) => {
//       let parsedTable = null;
//       if (q.table) {
//         try {
//           parsedTable = typeof q.table === 'string' ? JSON.parse(q.table) : q.table;
//         } catch (e) {
//           console.error('Failed to parse table for theory question:', q, e);
//         }
//       }

//       return {
//         ...q,
//         imageUrl: q.imageUrl || q.image || '',
//         imageAlt: q.imageAlt || q.image_alt || '',
//         table: parsedTable,
//         // Normalize sub-questions
//         subQuestions: (q.subQuestions || []).map((sq: any) => {
//           let sqParsedTable = null;
//           if (sq.table) {
//             try {
//               sqParsedTable = typeof sq.table === 'string' ? JSON.parse(sq.table) : sq.table;
//             } catch (e) {
//               console.error('Failed to parse table for sub-question:', sq, e);
//             }
//           }

//           return {
//             ...sq,
//             imageUrl: sq.imageUrl || sq.image || '',
//             imageAlt: sq.imageAlt || sq.image_alt || '',
//             table: sqParsedTable,
//             // Normalize sub-sub-questions
//             subSubQuestions: (sq.subSubQuestions || []).map((ssq: any) => ({
//               ...ssq,
//               imageUrl: ssq.imageUrl || ssq.image || '',
//               imageAlt: ssq.imageAlt || ssq.image_alt || ''
//             }))
//           };
//         })
//       };
//     });
//   }

//   // Normalize practical questions
//   if (normalized.practical_questions?.length > 0) {
//     normalized.practical_questions = normalized.practical_questions.map((q: any) => {
//       let parsedTable = null;
//       if (q.table) {
//         try {
//           parsedTable = typeof q.table === 'string' ? JSON.parse(q.table) : q.table;
//         } catch (e) {
//           console.error('Failed to parse table for practical question:', q, e);
//         }
//       }

//       return {
//         ...q,
//         imageUrl: q.imageUrl || q.image || '',
//         imageAlt: q.imageAlt || q.image_alt || '',
//         table: parsedTable
//       };
//     });
//   }

//   // Normalize custom sections
//   if (normalized.custom_sections?.length > 0) {
//     normalized.custom_sections = normalized.custom_sections.map((section: any) => ({
//       ...section,
//       questions: (section.questions || []).map((q: any) => {
//         let parsedTable = null;
//         if (q.table) {
//           try {
//             parsedTable = typeof q.table === 'string' ? JSON.parse(q.table) : q.table;
//           } catch (e) {
//             console.error('Failed to parse table for custom section question:', q, e);
//           }
//         }

//         return {
//           ...q,
//           imageUrl: q.imageUrl || q.image || '',
//           imageAlt: q.imageAlt || q.image_alt || '',
//           table: parsedTable
//         };
//       })
//     }));
//   }

//   console.log('✅ Normalized exam data for edit complete');

//   return normalized;
// };

/**
 * Normalize exam data after loading from API
 * Converts unified format to teacher format for editing
 */
export const normalizeExamDataForEdit = (examData: any) => {
  const normalized = { ...examData };

  console.log('🔄 Normalizing exam data for edit:', examData);

  // CRITICAL FIX: Preserve all essential fields with multiple fallbacks
  normalized.grade_level = examData.grade_level || 
                          examData.gradeLevel || 
                          examData.grade_level_id ||
                          null;
  
  normalized.subject = examData.subject || 
                       examData.subject_id ||
                       null;
  
  normalized.max_students = examData.max_students || 
                           examData.maxStudents ||
                           null;

  // Preserve display names
  normalized.grade_level_name = examData.grade_level_name || 
                               examData.gradeLevelName || 
                               '';
  
  normalized.subject_name = examData.subject_name || 
                           examData.subjectName || 
                           '';

  // Preserve other essential fields
  normalized.exam_type = examData.exam_type || examData.examType || '';
  normalized.exam_date = examData.exam_date || examData.examDate || '';
  normalized.duration = examData.duration || 0;
  normalized.total_marks = examData.total_marks || examData.totalMarks || 0;
  normalized.instructions = examData.instructions || '';

  console.log('✅ Essential fields after normalization:', {
    grade_level: normalized.grade_level,
    subject: normalized.subject,
    max_students: normalized.max_students,
    grade_level_name: normalized.grade_level_name,
    subject_name: normalized.subject_name
  });

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
 * Convert table data (array or object) to HTML table string
 */
function convertTableToHtml(tableData: any): string {
  if (!tableData) return '';

  // If it's already a string (HTML), return as-is
  if (typeof tableData === 'string') {
    // Check if it already contains HTML table tags
    if (tableData.includes('<table')) {
      return tableData;
    }
    // Otherwise, try to parse as JSON
    try {
      tableData = JSON.parse(tableData);
    } catch {
      // If parsing fails, wrap in a simple table
      return `<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${tableData}</td>
          </tr>
        </tbody>
      </table>`;
    }
  }

  try {
    // Handle array of arrays (rows and columns)
    if (Array.isArray(tableData)) {
      if (tableData.length === 0) return '';

      // Check if first element is an array (matrix format)
      if (Array.isArray(tableData[0])) {
        const headers = tableData[0];
        const rows = tableData.slice(1);

        let html = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
        
        // Add header row
        html += '<thead><tr>';
        headers.forEach((header: any) => {
          html += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0; text-align: left; font-weight: bold;">${header || ''}</th>`;
        });
        html += '</tr></thead>';

        // Add body rows
        html += '<tbody>';
        rows.forEach((row: any[]) => {
          html += '<tr>';
          row.forEach((cell: any) => {
            html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${cell || ''}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';

        return html;
      } else {
        // Array of objects - first object keys become headers
        if (tableData.length > 0 && typeof tableData[0] === 'object') {
          const headers = Object.keys(tableData[0]);
          
          let html = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
          
          html += '<thead><tr>';
          headers.forEach(header => {
            html += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0; text-align: left; font-weight: bold;">${header}</th>`;
          });
          html += '</tr></thead>';

          html += '<tbody>';
          tableData.forEach((row: any) => {
            html += '<tr>';
            headers.forEach(header => {
              html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${row[header] || ''}</td>`;
            });
            html += '</tr>';
          });
          html += '</tbody></table>';

          return html;
        }
      }
    }

    // Handle object with headers and rows properties
    if (tableData.headers && tableData.rows) {
      let html = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
      
      html += '<thead><tr>';
      tableData.headers.forEach((header: any) => {
        html += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0; text-align: left; font-weight: bold;">${header}</th>`;
      });
      html += '</tr></thead>';

      html += '<tbody>';
      tableData.rows.forEach((row: any[]) => {
        html += '<tr>';
        row.forEach((cell: any) => {
          html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${cell || ''}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table>';

      return html;
    }

    // Handle generic object (convert to key-value table)
    const entries = Object.entries(tableData);
    if (entries.length === 0) return '';

    let html = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd;">';
    html += '<tbody>';
    entries.forEach(([key, value]) => {
      html += '<tr>';
      html += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f0f0f0; text-align: left; font-weight: bold;">${key}</th>`;
      html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${value}</td>`;
      html += '</tr>';
    });
    html += '</tbody></table>';

    return html;
  } catch (error) {
    console.error('❌ Error converting table to HTML:', error, tableData);
    return '';
  }
}

/**
 * Normalize exam data for display (view modal and print)
 * Ensures consistent structure for rendering with HTML generation
 * CRITICAL: This converts tables to HTML format for proper display
 */
export const normalizeExamDataForDisplay = (examData: any) => {
  if (!examData) return null;

  const normalized = { ...examData };

  console.group('🔄 Normalizing exam data for display');
  console.log('Input exam data:', examData);

  // Helper to normalize a single question for display
  const normalizeQuestion = (q: any, questionType: string = 'unknown') => {
    const result = { ...q };
    
    // CRITICAL: Normalize image field with multiple fallbacks
    // Check all possible image field names
    result.image = 
      q.image || 
      q.imageUrl || 
      q.image_url || 
      q.imageURL ||
      q.question_image ||
      null;
    
    // If image is an object, extract URL
    if (result.image && typeof result.image === 'object') {
      result.image = result.image.url || result.image.src || result.image.path || null;
    }

    // Ensure it's a valid URL string
    if (result.image && typeof result.image !== 'string') {
      console.warn(`⚠️ Invalid image format for ${questionType}:`, result.image);
      result.image = null;
    }

    // Log image detection
    if (result.image) {
      console.log(`✅ Image found for ${questionType}:`, result.image.substring(0, 100));
    }
    
    // CRITICAL: Convert table to HTML format for display
    if (q.table) {
      console.log(`🔍 Processing table for ${questionType}:`, typeof q.table, q.table);
      
      // If table is a string, try to parse it first
      let tableData = q.table;
      if (typeof tableData === 'string') {
        // Check if it's already HTML
        if (tableData.includes('<table')) {
          console.log(`✅ Table is already HTML for ${questionType}`);
          result.table = tableData;
        } else {
          // Try to parse as JSON
          try {
            tableData = JSON.parse(tableData);
            console.log(`✅ Parsed table JSON for ${questionType}:`, tableData);
            result.table = convertTableToHtml(tableData);
            console.log(`✅ Converted table to HTML for ${questionType}`);
          } catch (e) {
            console.error(`❌ Failed to parse table JSON for ${questionType}:`, e);
            // Treat as plain text, wrap in simple table
            result.table = convertTableToHtml(tableData);
          }
        }
      } else if (typeof tableData === 'object') {
        // Convert object to HTML table
        console.log(`🔄 Converting table object to HTML for ${questionType}`);
        result.table = convertTableToHtml(tableData);
        console.log(`✅ Converted table to HTML for ${questionType}:`, result.table.substring(0, 200));
      } else {
        console.warn(`⚠️ Unknown table format for ${questionType}:`, typeof tableData);
        result.table = null;
      }
    }
    
    // Normalize question text
    result.question = q.question || q.question_text || q.questionText || q.text || '';
    
    return result;
  };

  // Normalize all question types
  if (normalized.objective_questions?.length > 0) {
    console.log(`📊 Processing ${normalized.objective_questions.length} objective questions`);
    normalized.objective_questions = normalized.objective_questions.map((q: any, idx: number) => 
      normalizeQuestion(q, `objective-${idx + 1}`)
    );
  }

  if (normalized.theory_questions?.length > 0) {
    console.log(`📝 Processing ${normalized.theory_questions.length} theory questions`);
    normalized.theory_questions = normalized.theory_questions.map((q: any, idx: number) => {
      const normalizedQ = normalizeQuestion(q, `theory-${idx + 1}`);
      
      // Normalize sub-questions
      if (normalizedQ.subQuestions?.length > 0) {
        console.log(`  └─ Processing ${normalizedQ.subQuestions.length} sub-questions`);
        normalizedQ.subQuestions = normalizedQ.subQuestions.map((sq: any, sqIdx: number) => {
          const normalizedSq = normalizeQuestion(sq, `theory-${idx + 1}-sub-${sqIdx + 1}`);
          
          // Normalize sub-sub-questions
          if (normalizedSq.subSubQuestions?.length > 0) {
            console.log(`    └─ Processing ${normalizedSq.subSubQuestions.length} sub-sub-questions`);
            normalizedSq.subSubQuestions = normalizedSq.subSubQuestions.map((ssq: any, ssqIdx: number) =>
              normalizeQuestion(ssq, `theory-${idx + 1}-sub-${sqIdx + 1}-subsub-${ssqIdx + 1}`)
            );
          }
          
          return normalizedSq;
        });
      }
      
      return normalizedQ;
    });
  }

  if (normalized.practical_questions?.length > 0) {
    console.log(`🔬 Processing ${normalized.practical_questions.length} practical questions`);
    normalized.practical_questions = normalized.practical_questions.map((q: any, idx: number) =>
      normalizeQuestion(q, `practical-${idx + 1}`)
    );
  }

  if (normalized.custom_sections?.length > 0) {
    console.log(`📑 Processing ${normalized.custom_sections.length} custom sections`);
    normalized.custom_sections = normalized.custom_sections.map((section: any, sIdx: number) => ({
      ...section,
      questions: (section.questions || []).map((q: any, qIdx: number) =>
        normalizeQuestion(q, `custom-${sIdx + 1}-${qIdx + 1}`)
      )
    }));
  }

  // Count images and tables for verification
  const imageCount = [
    ...(normalized.objective_questions || []),
    ...(normalized.theory_questions || []),
    ...(normalized.practical_questions || []),
    ...(normalized.custom_sections?.flatMap((s: any) => s.questions || []) || [])
  ].filter(q => q.image).length;

  const tableCount = [
    ...(normalized.objective_questions || []),
    ...(normalized.theory_questions || []),
    ...(normalized.practical_questions || []),
    ...(normalized.custom_sections?.flatMap((s: any) => s.questions || []) || [])
  ].filter(q => q.table).length;

  console.log('✅ Normalized exam data for display complete:', {
    totalImages: imageCount,
    totalTables: tableCount,
    objective: normalized.objective_questions?.length || 0,
    theory: normalized.theory_questions?.length || 0,
    practical: normalized.practical_questions?.length || 0,
    custom: normalized.custom_sections?.length || 0
  });
  console.groupEnd();

  return normalized;
};