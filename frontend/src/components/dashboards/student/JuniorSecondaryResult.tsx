// import React, { useRef } from "react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// /**
//  * PrimaryResultSheet
//  * - TailwindCSS used for quick styling
//  * - Layout matches the uploaded primary result sheet image: rotated vertical headers,
//  *   ~21 narrow columns, school header, student info lines, large subject list area,
//  *   footer with comments & physical development box.
//  * - Includes Download PDF (A4) which will shrink the captured image proportionally to fit a single A4 page.
//  */

// const SUBJECTS = [
//   "ENGLISH STUDIES",
//   "MATHEMATICS",
//   "BASIC SCIENCE TECHNOLOGY (BST)",
//   "NATIONAL VALUE (NV)",
//   "CULTURAL & CREATIVE ARTS (CCA)",
//   "PRE VOCATIONAL STUDIES (PVS)",
//   "NIGERIAN LANGUAGE (YORUBA/HAUSA/IGBO)",
//   "CHRISTIAN RELIGIOUS STUDIES / ARABIC",
//   "FRENCH LANGUAGE",
//   "HAND WRITING",
//   "HISTORY",
//   // extra empty rows to match template height
//   "",
//   "",
//   "",

// ];

// // Column headings (vertical). Use "\n" to indicate break points — we will split on "\n" when rendering.
// const COLUMN_HEADERS = [
//   "CONTINUOUS ASSESSMENT\n(15 MARKS)",
//   "TAKE HOME\nMARKS",
//   "TAKE HOME\nTEST",
//   "APPEARANCE\nMARKS",
//   "PRACTICAL\nMARKS",
//   "PROJECT\nMARKS",
//   "NOTE COPYING\nMARKS",
//   "C.A\nTOTAL",
//   "EXAM\n(60%)",
//   "TOTAL\n(100%)",
//   "POSITION",
//   "CONTINUOUS\nASSESSMENTS\n(%)",
//   "EXAMINATION\n(%)",
//   "TOTAL\n(100%)",
//   "CLASS\nAVERAGE",
//   "HIGHEST\nIN CLASS",
//   "LOWEST\nIN CLASS",
//   "SUBJECT\nPOSITION",
//   "PREVIOUS\nTERM SCORE",
//   "CUMULATIVE\nSCORE"
// ];

// export default function PrimaryResultSheet() {
//   const ref = useRef(null);

//   // const downloadPDF = async () => {
//   //   const element = ref.current;
//   //   if (!element) return;

//   //   // capture with html2canvas
//   //   const canvas = await html2canvas(element, { scale: 2, useCORS: true });
//   //   const imgData = canvas.toDataURL("image/png");

//   //   const pdf = new jsPDF("p", "mm", "a4");
//   //   const pdfWidth = pdf.internal.pageSize.getWidth();
//   //   const pdfHeight = pdf.internal.pageSize.getHeight();

//   //   // Use canvas dimensions to calculate image aspect ratio
//   //   const imgWidth = pdfWidth;
//   //   const imgHeight = (canvas.height * imgWidth) / canvas.width;

//   //   // If image is taller than the PDF page, scale it down proportionally to fit the page height
//   //   let finalWidth = imgWidth;
//   //   let finalHeight = imgHeight;
//   //   if (imgHeight > pdfHeight) {
//   //     finalHeight = pdfHeight;
//   //     finalWidth = (canvas.width * finalHeight) / canvas.height;
//   //   }

//   //   (pdf as any).addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);
//   //   pdf.save("primary_result.pdf");
//   // };


//            const downloadPDF = async () => {
//       const element = ref.current;
//       if (!element) return;

//       const canvas = await html2canvas(element, { scale: 2, useCORS: true });
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();

//       const imgProps = (pdf as any).getImageProperties(imgData);
//       const imgWidth = pdfWidth;
//       const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

//       // ✅ If taller than page, shrink proportionally
//       let finalHeight = imgHeight;
//       let finalWidth = imgWidth;
//       if (imgHeight > pdfHeight) {
//         finalHeight = pdfHeight;
//         finalWidth = (imgProps.width * pdfHeight) / imgProps.height;
//       }

//       (pdf as any).addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       pdf.save("primary_result_sheet.pdf");
//     };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//              <div className="flex justify-end mb-4">
//          <button
//            onClick={downloadPDF}
//            className="px-4 py-2 bg-blue-800 text-white rounded shadow"
//          >
//            Download PDF (A4)
//          </button>
//        </div>

//              <div
//          ref={ref}
//          className="bg-white mx-auto border border-blue-900 p-6"
//          style={{ width: 794 }}
//        >
//         {/* Header */}
//         <div className="flex items-start justify-between">
//           <div className="w-28 h-28 flex items-center justify-center">
//             {/* logo placeholder - will be replaced by backend image */}
//             <div className="w-24 h-24 border border-blue-900 flex items-center justify-center text-xs">LOGO</div>
//           </div>

//           <div className="text-center flex-1 px-4">
//             <h1 className="text-3xl font-extrabold text-blue-900 leading-tight">GOD'S TREASURE SCHOOLS</h1>
//             <p className="text-blue-600 text-xs mt-1">No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Jikwoyi Phase III Abuja.</p>
//             <p className="text-red-600 leading-tight text-sm font-semibold mt-1">PRIMARY SECTION</p>
//           </div>

//           <div style={{ width: 112 }} />
//         </div>

//         {/* Summary lines */}
//         <div className="mt-4 text-sm">
//           <div className="flex items-center gap-2">
//             <span className="font-semibold">SUMMARY OF ACADEMIC PERFORMANCE FOR</span>
//             <div className="flex-1 border-b border-black" style={{ height: 1 }} />
//             <span className="ml-4 font-semibold">TERM</span>
//             <div className="w-24 border-b border-black" style={{ height: 1 }} />
//             <span className="ml-4 font-semibold">YEAR:</span>
//             <div className="w-24 border-b border-black" style={{ height: 1 }} />
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">NAME</span>
//               <div className="flex-1 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">SEX</span>
//               <div className="w-24 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">AGE</span>
//               <div className="w-24 border-b border-black" style={{ height: 1 }} />
//             </div>
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NO IN CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">POSITION IN CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//             </div>
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">NUMBER OF TIMES SCHOOL OPENED:</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NUMBER OF TIMES PRESENT:</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NEXT TERM BEGINS</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//             </div>
//           </div>
//         </div>

//         {/* Academic Performance title */}
//         <div className="mt-3 text-center text-red-600 font-semibold text-base border-t border-b py-1">ACADEMIC PERFORMANCE</div>

//                                    {/* Main table area */}
//           <div className="mt-2 overflow-x-auto">
//             <table className="w-full border-collapse" style={{ border: '2px solid #1e3a8a' }}>
//               <thead>
//                 <tr>
//                   {/* Left grading key column - we will render as a multi-row cell on the left */}
//                   <th className="align-top" style={{ width: 160, borderRight: '2px solid #1e3a8a' }}>
//                     <div style={{ padding: 6 }}>
//                       <div style={{ fontSize: 11, fontWeight: 600 }}>SUBJECTS/KEY TO GRADING</div>
//                       <div style={{ fontSize: 10, marginTop: 6 }}>
//                         <div>A DISTINCTION 80 - 100%</div>
//                         <div>B+ VERY GOOD 70 - 79%</div>
//                         <div>B GOOD 60 - 69%</div>
//                         <div>C FAIRLY GOOD 50 - 59%</div>
//                         <div>D 40 - 49%</div>
//                         <div>E VERY WEAK BELOW 40%</div>
//                       </div>
//                     </div>
//                   </th>

//                   {/* dynamic rotated headers: render each as a narrow cell with vertical text */}
//                   {COLUMN_HEADERS.map((col, idx) => (
//                     <th
//                       key={idx}
//                       style={{
//                         width: 26,
//                         borderLeft: '1px solid #1e3a8a',
//                         borderBottom: '1px solid #1e3a8a',
//                         padding: '4px 2px',
//                         verticalAlign: 'bottom'
//                       }}
//                     >
//                       <div
//                         style={{
//                           writingMode: 'vertical-rl',
//                           textOrientation: 'mixed',
//                           transform: 'rotate(180deg)',
//                           fontSize: 9,
//                           lineHeight: '10px',
//                           whiteSpace: 'normal',
//                           textAlign: 'center'
//                         }}
//                       >
//                         {col.split("\n").map((line, i) => (
//                           <div key={i}>{line}</div>
//                         ))}
//                       </div>
//                     </th>
//                   ))}

//                   {/* final grade column on the extreme right */}
//                   <th style={{ width: 40, borderLeft: '2px solid #1e3a8a' }}>
//                     <div style={{ fontSize: 10, fontWeight: 600, textAlign: 'center' }}>GRADE</div>
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {SUBJECTS.map((subj, r) => (
//                   <tr key={r} style={{ height: 28 }}>
//                     <td style={{ border: '1px solid #1e3a8a', padding: 6, fontWeight: 600 }}>{subj}</td>

//                     {/* narrow columns of empty cells for marks etc */}
//                     {Array.from({ length: COLUMN_HEADERS.length }).map((_, c) => (
//                       <td key={c} style={{ border: '1px solid #1e3a8a', width: 26, textAlign: 'center' }}>
//                         {/* placeholder - empty */}
//                       </td>
//                     ))}

//                     <td style={{ border: '1px solid #1e3a8a', width: 40 }}></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//         {/* Footer area: totals, comments, signatures, physical development */}
//         <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
//           <div>
//             <div>Total Scores: <span className="font-semibold">__________</span></div>
//             <div className="mt-2">Average Scores: <span className="font-semibold">__________</span></div>
//             <div className="mt-2">Grade: <span className="font-semibold">__________</span></div>

//             <div className="mt-6" style={{ width: 300 }}>
//               {/* <div style={{ border: '1px solid #1e3a8a', padding: 8 }}>
//                 <h2 style={{ textAlign: 'center', fontWeight: 700 }}>PHYSICAL DEVELOPMENT</h2>
              
//                 <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
//                   <thead>
//                     <tr>
//                       <th style={{ border: '1px solid #1e3a8a', padding: 4 }}>HEIGHT</th>
//                       <th style={{ border: '1px solid #1e3a8a', padding: 4 }}>WEIGHT</th>
                   
//                     </tr>
//                   </thead>
//                   <tbody>
                  
//                     <tr>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         Beginning of Term<br />
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         End of Term<br />
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         Beginning of Term<br />
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         End of Term<br />
//                       </td>
//                     </tr>
//                     <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         cm
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                          cm
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                          cm
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                           cm
//                       </td>
//                     <tr>

//                     </tr>
//                     <tr>
//                       <td colSpan={2} style={{ border: '1px solid #1e3a8a', padding: 4 }}>NURSE'S COMMENT</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div> */}
//               <div style={{ border: '1px solid #1e3a8a', padding: 8 }}>
//   <h2 style={{ textAlign: 'center', fontWeight: 700 }}>PHYSICAL DEVELOPMENT</h2>
  
//   <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
//     <thead>
//       {/* First row: Two columns stretched across */}
//       <tr>
//         <th colSpan={2} style={{ border: '1px solid #1e3a8a', padding: 4 }}>HEIGHT</th>
//         <th colSpan={2} style={{ border: '1px solid #1e3a8a', padding: 4 }}>WEIGHT</th>
//       </tr>
//     </thead>
//     <tbody>
//       {/* Second row: Four columns */}
//       <tr className="text-xm">
//         <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           Beginning of Term<br />
//         </td>
//         <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           End of Term<br />
//         </td>
//         <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           Beginning of Term<br />
//         </td>
//         <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           End of Term<br />
//         </td>
//       </tr>
      
//       {/* Third row: Four columns */}
//       <tr className="text-xm">
//         <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           cm
//         </td>
//         <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           cm
//         </td>
//         <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           cm
//         </td>
//         <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           cm
//         </td>
//       </tr>
      
//       {/* Fourth row: One column stretched across all four */}
//       <tr>
//         <td colSpan={4} style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//           NURSE'S COMMENT
//         </td>
//       </tr>
//     </tbody>
//   </table>
// </div>
//             </div>
//           </div>

//           <div>
//             <div>CLASS TEACHER'S COMMENT: Good and intelligent pupil keep it up</div>
//             <div className="mt-4">SIGNATURE/DATE: </div>
//             <div className="mt-4">HEAD TEACHER'S COMMENT: Such a zelous and hard working child. impressive</div>
//             <div className="mt-4">SIGNATURE/DATE: </div>
//             <div className="mt-4">PARENT'S SIGNATURE/DATE: _______________________________</div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// import React, { useRef } from "react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// /**
//  * PrimaryResultSheet
//  * - TailwindCSS used for quick styling
//  * - Layout matches the uploaded primary result sheet image: rotated vertical headers,
//  *   ~21 narrow columns, school header, student info lines, large subject list area,
//  *   footer with comments & physical development box.
//  * - Includes Download PDF (A4) which will maintain aspect ratio and fit properly on the page.
//  */

// const SUBJECTS = [
//   "ENGLISH STUDIES",
//   "MATHEMATICS",
//   "BASIC SCIENCE TECHNOLOGY (BST)",
//   "NATIONAL VALUE (NV)",
//   "CULTURAL & CREATIVE ARTS (CCA)",
//   "PRE VOCATIONAL STUDIES (PVS)",
//   "NIGERIAN LANGUAGE (YORUBA/HAUSA/IGBO)",
//   "CHRISTIAN RELIGIOUS STUDIES / ARABIC",
//   "FRENCH LANGUAGE",
//   "HAND WRITING",
//   "HISTORY",
//   // extra empty rows to match template height
//   "",
//   "",
//   "",
// ];

// // Column headings (vertical). Use "\n" to indicate break points — we will split on "\n" when rendering.
// const COLUMN_HEADERS = [
//   "CONTINUOUS ASSESSMENT\n(15 MARKS)",
//   "TAKE HOME\nMARKS",
//   "TAKE HOME\nTEST",
//   "APPEARANCE\nMARKS",
//   "PRACTICAL\nMARKS",
//   "PROJECT\nMARKS",
//   "NOTE COPYING\nMARKS",
//   "C.A\nTOTAL",
//   "EXAM\n(60%)",
//   "TOTAL\n(100%)",
//   "POSITION",
//   "CONTINUOUS\nASSESSMENTS\n(%)",
//   "EXAMINATION\n(%)",
//   "TOTAL\n(100%)",
//   "CLASS\nAVERAGE",
//   "HIGHEST\nIN CLASS",
//   "LOWEST\nIN CLASS",
//   "SUBJECT\nPOSITION",
//   "PREVIOUS\nTERM SCORE",
//   "CUMULATIVE\nSCORE"
// ];

// export default function PrimaryResultSheet() {
//   const ref = useRef(null);

//   const downloadPDF = async () => {
//     const element = ref.current;
//     if (!element) return;

//     // Capture with higher scale for better quality
//     const canvas = await html2canvas(element, { scale: 2, useCORS: true });
//     const imgData = canvas.toDataURL("image/png");
    
//     const pdf = new jsPDF("p", "mm", "a4");
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();

//     // Get image properties
//     const imgProps = (pdf as any).getImageProperties(imgData);
    
//     // Calculate dimensions to fit the image within the page while maintaining aspect ratio
//     let imgWidth = pdfWidth;
//     let imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

//     // If the calculated height exceeds page height, scale down
//     if (imgHeight > pdfHeight) {
//       imgHeight = pdfHeight;
//       imgWidth = (imgProps.width * pdfHeight) / imgProps.height;
//     }

//     // Center the image on the page
//     const x = (pdfWidth - imgWidth) / 2;
//     const y = (pdfHeight - imgHeight) / 2;

//     // Add the image with proper dimensions and positioning
//     (pdf as any).addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
//     pdf.save("primary_result_sheet.pdf");
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="flex justify-end mb-4">
//         <button
//           onClick={downloadPDF}
//           className="px-4 py-2 bg-blue-800 text-white rounded shadow hover:bg-blue-900 transition-colors"
//         >
//           Download PDF (A4)
//         </button>
//       </div>

//       <div
//         ref={ref}
//         className="bg-white mx-auto border border-blue-900 p-6"
//         style={{ width: 794 }}
//       >
//         {/* Header */}
//         <div className="flex items-start justify-between">
//           <div className="w-28 h-28 flex items-center justify-center">
//             {/* logo placeholder - will be replaced by backend image */}
//             <div className="w-24 h-24 border border-blue-900 flex items-center justify-center text-xs">LOGO</div>
//           </div>

//           <div className="text-center flex-1 px-4">
//             <h1 className="text-3xl font-extrabold text-blue-900 leading-tight">GOD'S TREASURE SCHOOLS</h1>
//             <p className="text-blue-600 text-xs mt-1">No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Jikwoyi Phase III Abuja.</p>
//             <p className="text-red-600 leading-tight text-sm font-semibold mt-1">PRIMARY SECTION</p>
//           </div>

//           <div style={{ width: 112 }} />
//         </div>

//         {/* Summary lines */}
//         <div className="mt-4 text-sm">
//           <div className="flex items-center gap-2">
//             <span className="font-semibold">SUMMARY OF ACADEMIC PERFORMANCE FOR</span>
//             <div className="flex-1 border-b border-black" style={{ height: 1 }} />
//             <span className="ml-4 font-semibold">TERM</span>
//             <div className="w-24 border-b border-black" style={{ height: 1 }} />
//             <span className="ml-4 font-semibold">YEAR:</span>
//             <div className="w-24 border-b border-black" style={{ height: 1 }} />
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">NAME</span>
//               <div className="flex-1 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">SEX</span>
//               <div className="w-24 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">AGE</span>
//               <div className="w-24 border-b border-black" style={{ height: 1 }} />
//             </div>
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NO IN CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">POSITION IN CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//             </div>
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">NUMBER OF TIMES SCHOOL OPENED:</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NUMBER OF TIMES PRESENT:</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NEXT TERM BEGINS</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//             </div>
//           </div>
//         </div>

//         {/* Academic Performance title */}
//         <div className="mt-3 text-center text-red-600 font-semibold text-base border-t border-b py-1">ACADEMIC PERFORMANCE</div>

//         {/* Main table area */}
//         <div className="mt-2 overflow-x-auto">
//           <table className="w-full border-collapse" style={{ border: '2px solid #1e3a8a' }}>
//             <thead>
//               <tr>
//                 {/* Left grading key column - we will render as a multi-row cell on the left */}
//                 <th className="align-top" style={{ width: 160, borderRight: '2px solid #1e3a8a' }}>
//                   <div style={{ padding: 6 }}>
//                     <div style={{ fontSize: 11, fontWeight: 600 }}>SUBJECTS/KEY TO GRADING</div>
//                     <div style={{ fontSize: 10, marginTop: 6 }}>
//                       <div>A DISTINCTION 80 - 100%</div>
//                       <div>B+ VERY GOOD 70 - 79%</div>
//                       <div>B GOOD 60 - 69%</div>
//                       <div>C FAIRLY GOOD 50 - 59%</div>
//                       <div>D 40 - 49%</div>
//                       <div>E VERY WEAK BELOW 40%</div>
//                     </div>
//                   </div>
//                 </th>

//                 {/* dynamic rotated headers: render each as a narrow cell with vertical text */}
//                 {COLUMN_HEADERS.map((col, idx) => (
//                   <th
//                     key={idx}
//                     style={{
//                       width: 26,
//                       borderLeft: '1px solid #1e3a8a',
//                       borderBottom: '1px solid #1e3a8a',
//                       padding: '4px 2px',
//                       verticalAlign: 'bottom'
//                     }}
//                   >
//                     <div
//                       style={{
//                         writingMode: 'vertical-rl',
//                         textOrientation: 'mixed',
//                         transform: 'rotate(180deg)',
//                         fontSize: 9,
//                         lineHeight: '10px',
//                         whiteSpace: 'normal',
//                         textAlign: 'center'
//                       }}
//                     >
//                       {col.split("\n").map((line, i) => (
//                         <div key={i}>{line}</div>
//                       ))}
//                     </div>
//                   </th>
//                 ))}

//                 {/* final grade column on the extreme right */}
//                 <th style={{ width: 40, borderLeft: '2px solid #1e3a8a' }}>
//                   <div style={{ fontSize: 10, fontWeight: 600, textAlign: 'center' }}>GRADE</div>
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {SUBJECTS.map((subj, r) => (
//                 <tr key={r} style={{ height: 28 }}>
//                   <td style={{ border: '1px solid #1e3a8a', padding: 6, fontWeight: 600 }}>{subj}</td>

//                   {/* narrow columns of empty cells for marks etc */}
//                   {Array.from({ length: COLUMN_HEADERS.length }).map((_, c) => (
//                     <td key={c} style={{ border: '1px solid #1e3a8a', width: 26, textAlign: 'center' }}>
//                       {/* placeholder - empty */}
//                     </td>
//                   ))}

//                   <td style={{ border: '1px solid #1e3a8a', width: 40 }}></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer area: totals, comments, signatures, physical development */}
//         <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
//           <div>
//             <div>Total Scores: <span className="font-semibold">__________</span></div>
//             <div className="mt-2">Average Scores: <span className="font-semibold">__________</span></div>
//             <div className="mt-2">Grade: <span className="font-semibold">__________</span></div>

//             <div className="mt-6" style={{ width: 300 }}>
//               <div style={{ border: '1px solid #1e3a8a', padding: 8 }}>
//                 <h2 style={{ textAlign: 'center', fontWeight: 700 }}>PHYSICAL DEVELOPMENT</h2>
                
//                 <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
//                   <thead>
//                     {/* First row: Two columns stretched across */}
//                     <tr>
//                       <th colSpan={2} style={{ border: '1px solid #1e3a8a', padding: 4 }}>HEIGHT</th>
//                       <th colSpan={2} style={{ border: '1px solid #1e3a8a', padding: 4 }}>WEIGHT</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {/* Second row: Four columns */}
//                     <tr className="text-xs">
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         Beginning of Term<br />
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         End of Term<br />
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         Beginning of Term<br />
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         End of Term<br />
//                       </td>
//                     </tr>
                    
//                     {/* Third row: Four columns */}
//                     <tr className="text-xs">
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         cm
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         cm
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         cm
//                       </td>
//                       <td style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         cm
//                       </td>
//                     </tr>
                    
//                     {/* Fourth row: One column stretched across all four */}
//                     <tr>
//                       <td colSpan={4} style={{ border: '1px solid #1e3a8a', padding: 4 }}>
//                         NURSE'S COMMENT
//                       </td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           <div>
//             <div>CLASS TEACHER'S COMMENT: Good and intelligent pupil keep it up</div>
//             <div className="mt-4">SIGNATURE/DATE: </div>
//             <div className="mt-4">HEAD TEACHER'S COMMENT: Such a zelous and hard working child. impressive</div>
//             <div className="mt-4">SIGNATURE/DATE: </div>
//             <div className="mt-4">PARENT'S SIGNATURE/DATE: _______________________________</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { useRef } from "react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// /**
//  * PrimaryResultSheet
//  * - TailwindCSS used for quick styling
//  * - Layout matches the uploaded primary result sheet image: rotated vertical headers,
//  *   ~21 narrow columns, school header, student info lines, large subject list area,
//  *   footer with comments & physical development box.
//  * - Includes Download PDF (A4) which will maintain aspect ratio and fit properly on the page.
//  */

// const SUBJECTS = [
//   "ENGLISH STUDIES",
//   "MATHEMATICS",
//   "BASIC SCIENCE TECHNOLOGY (BST)",
//   "NATIONAL VALUE (NV)",
//   "CULTURAL & CREATIVE ARTS (CCA)",
//   "PRE VOCATIONAL STUDIES (PVS)",
//   "NIGERIAN LANGUAGE (YORUBA/HAUSA/IGBO)",
//   "CHRISTIAN RELIGIOUS STUDIES / ARABIC",
//   "FRENCH LANGUAGE",
//   "HAND WRITING",
//   "HISTORY",

// ];

// // Column headings (vertical). Use "\n" to indicate break points — we will split on "\n" when rendering.
// const COLUMN_HEADERS = [
//   "C.A\n(15 MARKS)",
//   "TAKE HOME\nMARKS",
//   "TAKE HOME\nTEST",
//   "APPEARANCE\nMARKS",
//   "PRACTICAL\nMARKS",
//   "PROJECT\nMARKS",
//   "NOTE COPYING\nMARKS",
//   "C.A\nTOTAL",
//   "EXAM\n(60%)",
//   "TOTAL\n(100%)",
//   "POSITION",
//   "C.A\n(60%)",
//   "EXAMINATION\n(%)",
//   "TOTAL\n(100%)",
//   "CLASS\nAVERAGE",
//   "HIGHEST\nIN CLASS",
//   "LOWEST\nIN CLASS",
//   "SUBJECT\nPOSITION",
//   "PREVIOUS\nTERM SCORE",
//   "CUMULATIVE\nSCORE"
// ];

// interface StudentData {
//   name?: string;
//   class?: string;
//   term?: string;
//   academicSession?: string;
// }

// interface ResultSheetProps {
//   studentData?: StudentData;
// }

// export default function PrimaryResultSheet({ studentData }: ResultSheetProps) {
//   const ref = useRef(null);

//   const downloadPDF = async () => {
//     const element = ref.current;
//     if (!element) return;

//     // Capture with higher scale for better quality
//     const canvas = await html2canvas(element, { scale: 2, useCORS: true });
//     const imgData = canvas.toDataURL("image/png");
    
//     const pdf = new jsPDF("p", "mm", "a4");
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();

//     // Get image properties
//     const imgProps = (pdf as any).getImageProperties(imgData);
    
//     // Calculate dimensions to fill the page width completely
//     const imgWidth = pdfWidth;
//     const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

//     // If the calculated height exceeds page height, scale down proportionally
//     let finalWidth = imgWidth;
//     let finalHeight = imgHeight;
//     if (imgHeight > pdfHeight) {
//       finalHeight = pdfHeight;
//       finalWidth = (imgProps.width * pdfHeight) / imgProps.height;
//     }

//     // Always start from top-left (0,0) to fill the page completely
//     (pdf as any).addImage(imgData, "PNG", 0, 0, finalWidth, finalHeight);
//     pdf.save("primary_result_sheet.pdf");
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="flex justify-end mb-4">
//         <button
//           onClick={downloadPDF}
//           className="px-4 py-2 bg-blue-800 text-white rounded shadow hover:bg-blue-900 transition-colors"
//         >
//           Download PDF (A4)
//         </button>
//       </div>

//       <div
//         ref={ref}
//         className="bg-white mx-auto border border-blue-900 p-4"
//         style={{ width: 1000, maxWidth: '100%' }}
//       >
//         {/* Header */}
//         <div className="flex items-start justify-between">
//           <div className="w-28 h-28 flex items-center justify-center">
//             {/* logo placeholder - will be replaced by backend image */}
//             <div className="w-24 h-24 border border-blue-900 flex items-center justify-center text-xs">LOGO</div>
//           </div>

//           <div className="text-center flex-1 px-4">
//             <h1 className="text-3xl font-extrabold text-blue-900 leading-tight">GOD'S TREASURE SCHOOLS</h1>
//             <p className="text-blue-600 text-xs mt-1">No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Jikwoyi Phase III Abuja.</p>
//             <p className="text-red-600 leading-tight text-sm font-semibold mt-1">PRIMARY SECTION</p>
//           </div>

//           <div style={{ width: 112 }} />
//         </div>

//         {/* Summary lines */}
//         <div className="mt-4 text-sm">
//           <div className="flex items-center gap-2">
//             <span className="font-semibold">SUMMARY OF ACADEMIC PERFORMANCE FOR</span>
//             <div className="flex-1 border-b border-black" style={{ height: 1 }} />
//             <span className="ml-4 font-semibold">TERM</span>
//             <div className="w-24 border-b border-black" style={{ height: 1 }} />
//             <span className="ml-4 font-semibold">YEAR:</span>
//             <div className="w-24 border-b border-black" style={{ height: 1 }} />
//           </div>
//           <div className="flex items-center gap-2 mt-1">
//             <span className="font-semibold">{studentData?.term || "3rd Term"}</span>
//             <div className="flex-1 border-b border-black" style={{ height: 1 }} />
//             <span className="ml-4 font-semibold">{studentData?.academicSession || "2024/2025"}</span>
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">NAME</span>
//               <div className="flex-1 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">SEX</span>
//               <div className="w-24 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">AGE</span>
//               <div className="w-24 border-b border-black" style={{ height: 1 }} />
//             </div>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="font-semibold">{studentData?.name || "Student Name"}</span>
//               <div className="flex-1 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">Male</span>
//               <div className="w-24 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">12</span>
//             </div>
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NO IN CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">POSITION IN CLASS</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//             </div>
//             <div className="flex items-center gap-2 mt-1">
//               <span className="font-semibold">{studentData?.class || "Primary 5"}</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">35</span>
//               <div className="w-36 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">5th</span>
//             </div>
//           </div>

//           <div className="mt-2">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">NUMBER OF TIMES SCHOOL OPENED:</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NUMBER OF TIMES PRESENT:</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//               <span className="ml-4 font-semibold">NEXT TERM BEGINS</span>
//               <div className="w-40 border-b border-black" style={{ height: 1 }} />
//             </div>
//           </div>
//         </div>

//         {/* Academic Performance title */}
//         <div className="mt-3 text-center text-red-600 font-semibold text-base border-t border-b py-1">ACADEMIC PERFORMANCE</div>

//         {/* Main table area */}
//         <div className="mt-2 overflow-x-auto">
//           <table className="w-full border-collapse border-2 border-blue-900 min-w-full">
//             <thead>
//               <tr style={{ height: '100px' }}>
//                 {/* Left subjects/key column */}
//                 <th 
//                   className="border border-blue-900 p-2 text-left align-top bg-white"
//                   style={{ width: '180px', height: '100px' }}
//                 >
//                   <div className="text-[10px] font-bold mb-1">SUBJECTS/KEY TO GRADING</div>
//                   <div className="text-[8px] leading-tight space-y-0.5">
//                     <div>A DISTINCTION 80 - 100%</div>
//                     <div>B+ VERY GOOD 70 - 79%</div>
//                     <div>B GOOD 60 - 69%</div>
//                     <div>C FAIRLY GOOD 50 - 59%</div>
//                     <div>D 40 - 49%</div>
//                     <div>E VERY WEAK BELOW 40%</div>
//                   </div>
//                 </th>

//                                  {/* Rotated column headers */}
//                  {COLUMN_HEADERS.map((header, idx) => (
//                    <th 
//                      key={idx}
//                      className="border border-blue-900 p-0.5 relative"
//                      style={{ 
//                        width: '32px', 
//                        height: '100px',
//                        minWidth: '32px'
//                      }}
//                    >
//                      <div className="absolute inset-0 flex items-center justify-center">
//                        <div 
//                          className="transform -rotate-90 origin-center text-[7px] font-medium text-center leading-tight"
//                          style={{ 
//                            writingMode: 'horizontal-tb',
//                            transformOrigin: 'center center',
//                            width: '90px',
//                            textAlign: 'center',
//                            height: '90px',
//                            display: 'flex',
//                            flexDirection: 'column',
//                            justifyContent: 'center'
//                          }}
//                        >
//                          {header.split('\n').map((line, i) => (
//                            <div key={i} style={{ 
//                              marginBottom: i < header.split('\n').length - 1 ? '3px' : '0',
//                              lineHeight: '1.1'
//                            }}>
//                              {line}
//                            </div>
//                          ))}
//                        </div>
//                      </div>
//                    </th>
//                  ))}

//                                  {/* Grade column */}
//                  <th 
//                    className="border border-blue-900 p-1 text-center font-bold"
//                    style={{ width: '40px', height: '100px' }}
//                  >
//                    <div className="text-[10px] flex items-center justify-center h-full">GRADE</div>
//                  </th>
//               </tr>
//             </thead>

//             <tbody>
//               {SUBJECTS.map((subject, idx) => (
//                 <tr key={idx}>
//                   <td 
//                     className="border border-blue-900 p-1 font-semibold text-xs"
//                     style={{ minHeight: '24px' }}
//                   >
//                     {subject}
//                   </td>
                  
//                   {/* Score columns */}
//                   {COLUMN_HEADERS.map((_, colIdx) => (
//                     <td 
//                       key={colIdx}
//                       className="border border-blue-900 p-0.5 text-center text-xs"
//                       style={{ width: '32px', height: '24px' }}
//                     >
//                       {/* Empty cells for data entry */}
//                     </td>
//                   ))}
                  
//                   {/* Grade column */}
//                   <td 
//                     className="border border-blue-900 p-0.5 text-center text-xs"
//                     style={{ width: '40px' }}
//                   >
//                     {/* Empty cell for grade */}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer area */}
//         <div className="mt-3 flex justify-between text-sm">
//           {/* Left side - Totals and Physical Development */}
//           <div className="flex-1 pr-6">
//             <div className="mb-1 text-xs">Total Scores: <span className="border-b border-black inline-block w-16"></span></div>
//             <div className="mb-1 text-xs">Average Scores: <span className="border-b border-black inline-block w-16"></span></div>
//             <div className="mb-3 text-xs">Grade: <span className="border-b border-black inline-block w-16"></span></div>

//             {/* Physical Development Table */}
//             <div className="border border-black" style={{ width: '360px' }}>
//               <div className="text-center font-bold py-1 border-b border-black text-xs">
//                 PHYSICAL DEVELOPMENT
//               </div>
              
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr>
//                     <th className="border border-black p-1 text-center font-bold text-[10px]" colSpan={2}>
//                       HEIGHT
//                     </th>
//                     <th className="border border-black p-1 text-center font-bold text-[10px]" colSpan={2}>
//                       WEIGHT
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr className="text-[9px]">
//                     <td className="border border-black p-1 text-center">
//                       Beginning of<br />Term
//                     </td>
//                     <td className="border border-black p-1 text-center">
//                       End of<br />Term
//                     </td>
//                     <td className="border border-black p-1 text-center">
//                       Beginning of<br />Term
//                     </td>
//                     <td className="border border-black p-1 text-center">
//                       End of<br />Term
//                     </td>
//                   </tr>
//                   <tr className="text-[9px]">
//                     <td className="border border-black p-1 text-center">cm</td>
//                     <td className="border border-black p-1 text-center">cm</td>
//                     <td className="border border-black p-1 text-center">cm</td>
//                     <td className="border border-black p-1 text-center">cm</td>
//                   </tr>
//                   <tr>
//                     <td className="border border-black p-1 text-center text-[9px]" colSpan={4}>
//                       NURSE'S COMMENT
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Right side - Comments and Signatures */}
//           <div className="flex-1">
//             <div className="mb-2">
//               <div className="font-semibold text-[10px]">CLASS TEACHER'S COMMENT:</div>
//               <div className="text-[10px] mt-0.5">Good and intelligent pupil keep it up</div>
//             </div>
            
//             <div className="mb-3">
//               <div className="text-[10px]">SIGNATURE/DATE: <span className="border-b border-black inline-block w-28"></span></div>
//             </div>

//             <div className="mb-2">
//               <div className="font-semibold text-[10px]">HEAD TEACHER'S COMMENT:</div>
//               <div className="text-[10px] mt-0.5">Such a zelous and hard working child. impressive</div>
//             </div>
            
//             <div className="mb-3">
//               <div className="text-[10px]">SIGNATURE/DATE: <span className="border-b border-black inline-block w-28"></span></div>
//             </div>

//             <div>
//               <div className="text-[10px]">PARENT'S SIGNATURE/DATE: <span className="border-b border-black inline-block w-32"></span></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * PrimaryResultSheet
 * - Ultra modern design with subtle colors
 * - Professional watermark
 * - Optimized PDF generation with proper margins
 */

const SUBJECTS = [
  "ENGLISH STUDIES",
  "MATHEMATICS",
  "BASIC SCIENCE TECHNOLOGY (BST)",
  "NATIONAL VALUE (NV)",
  "CULTURAL & CREATIVE ARTS (CCA)",
  "PRE VOCATIONAL STUDIES (PVS)",
  "NIGERIAN LANGUAGE (YORUBA/HAUSA/IGBO)",
  "CHRISTIAN RELIGIOUS STUDIES / ARABIC",
  "FRENCH LANGUAGE",
  "HAND WRITING",
  "HISTORY",
  "BUSINESS STUDIES",
  "HAUSA",
  "",
  "",
  "",
];

const COLUMN_HEADERS = [
  "C.A\n(15 MARKS)",
  "TAKE HOME\nMARKS",
  "TAKE HOME\nTEST",
  "APPEARANCE\nMARKS",
  "PRACTICAL\nMARKS",
  "PROJECT\nMARKS",
  "NOTE COPYING\nMARKS",
  "C.A\nTOTAL",
  "EXAM\n(60%)",
  "TOTAL\n(100%)",
  "POSITION",
  "C.A\n(60%)",
  "EXAMINATION\n(%)",
  "TOTAL\n(100%)",
  "CLASS\nAVERAGE",
  "HIGHEST\nIN CLASS",
  "LOWEST\nIN CLASS",
  "SUBJECT\nPOSITION",
  "PREVIOUS\nTERM SCORE",
  "CUMULATIVE\nSCORE"
];

const WatermarkLogo = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-3 z-0">
    <div className="text-center">
      <div 
        className="w-64 h-64 rounded-full flex items-center justify-center mb-6 mx-auto border-4"
        style={{ 
          background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.1))',
          borderColor: 'rgba(30, 64, 175, 0.2)'
        }}
      >
        <div className="text-center" style={{ color: 'rgba(30, 64, 175, 0.3)' }}>
          <div className="text-4xl font-bold mb-2">GTS</div>
          <div className="text-sm font-semibold">GOD'S TREASURE</div>
          <div className="text-sm font-semibold">SCHOOLS</div>
        </div>
      </div>
      <div 
        className="text-5xl font-bold tracking-wider"
        style={{ color: 'rgba(30, 64, 175, 0.15)' }}
      >
        GOD'S TREASURE SCHOOLS
      </div>
    </div>
  </div>
);

interface StudentData {
  name?: string;
  class?: string;
  term?: string;
  academicSession?: string;
  resultType?: string;
}

interface ResultSheetProps {
  studentData?: StudentData;
}

export default function JuniorSecondaryResult({ studentData }: ResultSheetProps) {
  const ref = useRef(null);

  const downloadPDF = async () => {
    const element = ref.current;
    if (!element) return;

    // Capture with optimized settings
    const canvas = await html2canvas(element, { 
      scale: 1.5, 
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      removeContainer: true,
      scrollX: 0,
      scrollY: 0
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 5;
    
    // Available space after margins
    const availableWidth = pageWidth - (2 * margin);
    const availableHeight = pageHeight - (2 * margin);
    
    // Get image properties
    const imgProps = (pdf as any).getImageProperties(imgData);
    const imgRatio = imgProps.height / imgProps.width;
    
    // Calculate dimensions to fit within available space
    let finalWidth = availableWidth;
    let finalHeight = availableWidth * imgRatio;
    
    // If height exceeds available space, scale down
    if (finalHeight > availableHeight) {
      finalHeight = availableHeight;
      finalWidth = availableHeight / imgRatio;
    }
    
    // Center the image
    const xOffset = margin + (availableWidth - finalWidth) / 2;
    const yOffset = margin + (availableHeight - finalHeight) / 2;
    
    (pdf as any).addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);
    pdf.save("primary_result_sheet.pdf");
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-end mb-4">
        <button
          onClick={downloadPDF}
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm"
        >
          Download PDF
        </button>
      </div>

      <div
        ref={ref}
        className="bg-white mx-auto border border-slate-300 relative overflow-hidden shadow-sm"
        style={{ 
          width: 1000, 
          maxWidth: '100%',
          padding: '20px'
        }}
      >
        {/* Modern Watermark */}
        <WatermarkLogo />

        {/* Content Layer */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="w-28 h-28 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-slate-300 rounded-full flex items-center justify-center text-xs font-semibold text-slate-600 bg-slate-50">
                <div className="text-center">
                  <div className="text-lg font-bold">GTS</div>
                  <div className="text-[8px]">LOGO</div>
                </div>
              </div>
            </div>

            <div className="text-center flex-1 px-4">
              <h1 className="text-4xl font-bold text-blue-900 leading-tight">GOD'S TREASURE SCHOOLS</h1>
              <p className="text-blue-600 text-xs mt-1">No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Jikwoyi Phase III Abuja.</p>
              <p className="text-red-600 leading-tight text-sm font-semibold mt-2 bg-red-50 px-4 py-2 rounded-full inline-block">
                JUNIOR SECONDARY SECTION
              </p>
            </div>

            <div style={{ width: 112 }} />
          </div>

          {/* Summary lines */}
          <div className="mb-6 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-blue-900">SUMMARY OF ACADEMIC PERFORMANCE FOR</span>
              <div className="flex-1 border-b border-slate-400" style={{ height: 1 }} />
              <span className="ml-4 font-semibold  text-blue-900">TERM</span>
              <div className="w-24 border-b border-slate-400" style={{ height: 1 }} />
              <span className="ml-4 font-semibold  text-blue-900">YEAR:</span>
              <div className="w-24 border-b border-slate-400" style={{ height: 1 }} />
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">NAME</span>
                <div className="flex-1 border-b border-slate-400" style={{ height: 1 }} />
                <span className="ml-4 font-semibold text-slate-700">SEX</span>
                <div className="w-24 border-b border-slate-400" style={{ height: 1 }} />
                <span className="ml-4 font-semibold text-slate-700">AGE</span>
                <div className="w-24 border-b border-slate-400" style={{ height: 1 }} />
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">CLASS</span>
                <div className="w-36 border-b border-slate-400" style={{ height: 1 }} />
                <span className="ml-4 font-semibold text-slate-700">NO IN CLASS</span>
                <div className="w-36 border-b border-slate-400" style={{ height: 1 }} />
                <span className="ml-4 font-semibold text-slate-700">POSITION IN CLASS</span>
                <div className="w-36 border-b border-slate-400" style={{ height: 1 }} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">NUMBER OF TIMES SCHOOL OPENED:</span>
                <div className="w-40 border-b border-slate-400" style={{ height: 1 }} />
                <span className="ml-4 font-semibold text-slate-700">NUMBER OF TIMES PRESENT:</span>
                <div className="w-40 border-b border-slate-400" style={{ height: 1 }} />
                <span className="ml-4 font-semibold text-slate-700">NEXT TERM BEGINS</span>
                <div className="w-40 border-b border-slate-400" style={{ height: 1 }} />
              </div>
            </div>
          </div>

          {/* Academic Performance title */}
          <div className="text-center font-semibold text-base py-3 mb-4 bg-blue-900 text-white rounded-lg">
            {studentData?.resultType === 'yearly' ? 'YEARLY' : studentData?.resultType === 'annually' ? 'ANNUAL' : 'ACADEMIC'} PERFORMANCE
          </div>

          {/* Main table area */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border-2 border-slate-800 min-w-full bg-white">
              <thead>
                <tr style={{ height: '100px' }}>
                  <th 
                    className="border border-slate-600 p-2 text-left align-top bg-slate-100"
                    style={{ width: '180px', height: '100px' }}
                  >
                    <div className="text-[10px] font-bold mb-1 text-slate-800">SUBJECTS/KEY TO GRADING</div>
                    <div className="text-[8px] leading-tight space-y-0.5 text-slate-600">
                      <div>A DISTINCTION 80 - 100%</div>
                      <div>B+ VERY GOOD 70 - 79%</div>
                      <div>B GOOD 60 - 69%</div>
                      <div>C FAIRLY GOOD 50 - 59%</div>
                      <div>D 40 - 49%</div>
                      <div>E VERY WEAK BELOW 40%</div>
                    </div>
                  </th>

                  {/* Rotated column headers */}
                  {COLUMN_HEADERS.map((header, idx) => (
                    <th 
                      key={idx}
                      className="border border-slate-600 p-0.5 relative bg-slate-200"
                      style={{ 
                        width: '45px', 
                        height: '100px',
                        minWidth: '32px'
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="transform -rotate-90 origin-center text-[7px] font-medium text-center leading-tight text-slate-700"
                          style={{ 
                            writingMode: 'horizontal-tb',
                            transformOrigin: 'center center',
                            width: '90px',
                            textAlign: 'center',
                            height: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          {header.split('\n').map((line, i) => (
                            <div key={i} style={{ 
                              marginBottom: i < header.split('\n').length - 1 ? '3px' : '0',
                              lineHeight: '1.1'
                            }}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    </th>
                  ))}

                  <th 
                    className="border border-slate-600 p-1 text-center font-bold bg-slate-300"
                    style={{ width: '40px', height: '100px' }}
                  >
                    <div className="text-[10px] flex items-center justify-center h-full text-slate-800">GRADE</div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {SUBJECTS.map((subject, idx) => (
                  <tr key={idx}>
                    <td 
                      className={`border border-slate-600 p-3 font-semibold text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      style={{ minHeight: '24px' }}
                    >
                      {subject}
                    </td>
                    
                    {COLUMN_HEADERS.map((_, colIdx) => (
                      <td 
                        key={colIdx}
                        className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                        style={{ width: '32px', height: '24px' }}
                      >
                      </td>
                    ))}
                    
                    <td 
                      className={`border border-slate-600 p-0.5 text-center text-xs ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                      style={{ width: '40px' }}
                    >
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer area */}
          <div className="flex justify-between text-sm">
            {/* Left side - Totals and Physical Development */}
            <div className="flex-1 pr-6">
              <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="mb-1 text-xs font-semibold text-slate-700">Total Scores: <span className="border-b border-slate-400 inline-block w-16"></span></div>
                <div className="mb-1 text-xs font-semibold text-slate-700">Average Scores: <span className="border-b border-slate-400 inline-block w-16"></span></div>
                <div className="text-xs font-semibold text-slate-700">Grade: <span className="border-b border-slate-400 inline-block w-16"></span></div>
              </div>

              {/* Physical Development Table */}
              <div className="border-2 border-slate-800 rounded-lg overflow-hidden" style={{ width: '360px' }}>
                <div className="text-center font-bold py-2 text-xs bg-blue-900 text-white">
                  PHYSICAL DEVELOPMENT
                </div>
                
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr>
                      <th className="border border-slate-600 p-1 text-center font-bold text-[10px] bg-slate-100" colSpan={2}>
                        HEIGHT
                      </th>
                      <th className="border border-slate-600 p-1 text-center font-bold text-[10px] bg-slate-100" colSpan={2}>
                        WEIGHT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-[9px]">
                      <td className="border border-slate-600 p-1 text-left bg-slate-50">
                        Beginning of<br />Term
                      </td>
                      <td className="border border-slate-600 p-1 text-left bg-white">
                        End of<br />Term
                      </td>
                      <td className="border border-slate-600 p-1 text-left bg-slate-50">
                        Beginning of<br />Term
                      </td>
                      <td className="border border-slate-600 p-1 text-left bg-white">
                        End of<br />Term
                      </td>
                    </tr>
                    <tr className="text-[9px] text-left">
                      <td className="border border-slate-600 p-1 text-center">cm</td>
                      <td className="border border-slate-600 p-1 text-center">cm</td>
                      <td className="border border-slate-600 p-1 text-center">cm</td>
                      <td className="border border-slate-600 p-1 text-center">cm</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-600 p-1 text-left text-[9px] bg-slate-100" colSpan={4}>
                        NURSE'S COMMENT
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right side - Comments and Signatures */}
            <div className="flex-1">
              <div className="mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-semibold text-[10px] text-slate-800">CLASS TEACHER'S COMMENT:</div>
                <div className="text-[10px] mt-1 text-slate-600 italic">Good and intelligent pupil keep it up</div>
              </div>
              
              <div className="mb-4">
                <div className="text-[10px] font-medium text-slate-700">SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-28"></span></div>
              </div>

              <div className="mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-semibold text-[10px] text-slate-800">HEAD TEACHER'S COMMENT:</div>
                <div className="text-[10px] mt-1 text-slate-600 italic">Such a zealous and hard working child. impressive</div>
              </div>
              
              <div className="mb-4">
                <div className="text-[10px] font-medium text-slate-700">SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-28"></span></div>
              </div>

              <div>
                <div className="text-[10px] font-medium text-slate-700">PARENT'S SIGNATURE/DATE: <span className="border-b border-slate-400 inline-block w-32"></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}