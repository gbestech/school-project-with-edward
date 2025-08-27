// import React from "react";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";

// type ResultSheetProps = {
//   studentData: {
//     name?: string;
//     // Add other fields as needed, e.g. id?: string; age?: number; etc.
//   };
// };

// export default function ResultSheet({ studentData }: ResultSheetProps) {
//   const downloadPDF = () => {
//     const input = document.getElementById("result-sheet");
//     if (!input) return;
//     html2canvas(input, { scale: 2 }).then((canvas) => {
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//       pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`${studentData.name || "result-sheet"}.pdf`);
//     });
//   };

//   return (
//     <div className="p-6">
//       <div id="result-sheet" className="border border-black p-4 w-[794px] mx-auto text-xs">
        
//         {/* HEADER */}
//         <div className="text-center font-bold">
//           <h2 className="text-lg">GOD’S TREASURE SCHOOLS</h2>
//           <p>No 54 Dagbana Road, Opp. St. Kevin’s Catholic Church, Jikwoyi Phase III Abuja.</p>
//           <p className="underline font-semibold">PRIMARY SECTION</p>
//         </div>

//         {/* Pupil info */}
//         <div className="grid grid-cols-2 mt-4 text-sm">
//           <p>TERM: ___________________________ DATE: _______________________</p>
//           <p>PUPIL’S NAME: ___________________________ NO OF TIMES SCHOOL OPENED ______</p>
//           <p>CLASS: ___________________________ HOUSE: ____________________</p>
//           <p>NO OF TIMES PRESENT: __________________</p>
//         </div>

//         {/* PHYSICAL DEVELOPMENT */}
//         <div className="mt-4 border border-black">
//           <div className="text-center font-bold border-b border-black">PHYSICAL DEVELOPMENT / SPECIAL REPORTS DURING THE TERM</div>
//           <table className="w-full border-collapse text-center">
//             <thead>
//               <tr>
//                 <th className="border border-black w-1/5"> </th>
//                 <th className="border border-black">EXCELLENT</th>
//                 <th className="border border-black">VERY GOOD</th>
//                 <th className="border border-black">GOOD</th>
//                 <th className="border border-black">FAIR</th>
//                 <th className="border border-black">COMMENTS</th>
//               </tr>
//             </thead>
//             <tbody>
//               {["PHYSICAL DEVELOPMENT", "HEALTH", "CLEANLINESS", "GENERAL CONDUCT"].map((item, idx) => (
//                 <tr key={idx}>
//                   <td className="border border-black text-left px-2">{item}</td>
//                   <td className="border border-black"></td>
//                   <td className="border border-black"></td>
//                   <td className="border border-black"></td>
//                   <td className="border border-black"></td>
//                   <td className="border border-black"></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* ACADEMIC PERFORMANCE */}
//         <div className="mt-4 border border-black">
//           <div className="text-center font-bold border-b border-black">ACADEMIC PERFORMANCE</div>
//           <table className="w-full border-collapse text-center">
//             <thead>
//               <tr>
//                 <th className="border border-black w-2/5">SUBJECTS</th>
//                 <th className="border border-black">MAX MARKS OBTAINABLE</th>
//                 <th className="border border-black">MARK OBTAINED</th>
//                 <th className="border border-black">POSITIONS</th>
//                 <th className="border border-black">COMMENTS</th>
//               </tr>
//             </thead>
//             <tbody>
//               {[
//                 "English (Alphabet)", "Mathematics (Numbers)", "Social Studies", "Basic Science",
//                 "Christian Religious Studies", "Computer Studies", "Moral & Value Studies (MVS)",
//                 "Colouring Activities", "Rhymes", "Physical & Health Education", "Writing Skill", "Craft"
//               ].map((subject, idx) => (
//                 <tr key={idx}>
//                   <td className="border border-black text-left px-2">{subject}</td>
//                   <td className="border border-black"></td>
//                   <td className="border border-black"></td>
//                   <td className="border border-black"></td>
//                   <td className="border border-black"></td>
//                 </tr>
//               ))}
//               <tr>
//                 <td className="border border-black font-bold text-right px-2">Total</td>
//                 <td className="border border-black"></td>
//                 <td className="border border-black"></td>
//                 <td className="border border-black"></td>
//                 <td className="border border-black"></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* PUPIL’S POSITION */}
//         <div className="mt-4 border border-black p-2 font-bold">
//           PUPIL’S POSITION <br />
//           PERCENTAGE AVERAGE ___________ GRADE ___________ POSITION ___________ OUT OF ___________
//         </div>

//         {/* GENERAL COMMENTS */}
//         <div className="mt-4 border border-black">
//           <div className="text-center font-bold border-b border-black">GENERAL COMMENTS</div>
//           <div className="p-2">
//             <p>CLASS TEACHER’S REMARK _____________________________________________</p>
//             <p>HEAD TEACHER’S REMARK _____________________________________________</p>
//             <p>CLASS TEACHER’S SIGNATURE ____________________ HEAD TEACHER’S SIGNATURE ____________________</p>
//             <p>NEXT TERM BEGINS ON _____________________________________________</p>
//           </div>
//         </div>
//       </div>

//       {/* DOWNLOAD BUTTON */}
//       <div className="text-center mt-4">
//         <button
//           onClick={downloadPDF}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg"
//         >
//           Download PDF
//         </button>
//       </div>
//     </div>
//   );
// }


// import React from "react";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";

// type ResultSheetProps = {
//   studentData: {
//     name?: string;
//     class?: string;
//     term?: string;
//     date?: string;
//     house?: string;
//     timesOpened?: string;
//     timesPresent?: string;
//     // Add other fields as needed
//   };
// };

// const SchoolLogo = () => (
//   <div className="w-35 h-30 border-2 border-gray-400 rounded-md flex items-center justify-center bg-gray-50">
//     <div className="text-center text-xs">
//       <div className="font-bold mb-1">LOGO</div>
//       <div className="text-[8px]">GOD'S TREASURE</div>
//       <div className="text-[8px]">SCHOOLS</div>
//     </div>
//   </div>
// );

// const WatermarkLogo = () => (
//   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
//     <div className="text-center">
//       <div className="w-40 h-40 border-4 border-gray-400 rounded-full flex items-center justify-center mb-4">
//         <div className="text-center">
//           <div className="text-2xl font-bold mb-2">LOGO</div>
//           <div className="text-sm">GOD'S TREASURE</div>
//           <div className="text-sm">SCHOOLS</div>
//         </div>
//       </div>
//       <div className="text-4xl font-bold text-blue-900">GOD'S TREASURE SCHOOLS</div>
//     </div>
//   </div>
// );

// export default function NurseryResult({ studentData }: ResultSheetProps) {
//   const downloadPDF = () => {
//     const input = document.getElementById("result-sheet");
//     if (!input) return;
//     html2canvas(input, { scale: 2 }).then((canvas) => {
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4");
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//       pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`${studentData.name || "result-sheet"}.pdf`);
//     });
//   };

//   return (
//     <div className="p-4 bg-gray-50">
//       <div id="result-sheet" className="relative border-2 border-black p-3 w-[794px] mx-auto bg-white text-xs overflow-hidden">
        
//         {/* Background Watermark */}
//         <WatermarkLogo />
        
//         {/* Content Layer */}
//         <div className="relative z-10">
          
//           {/* HEADER with Logo */}
//           <div className="flex justify-between items-start mb-2">
//             <div className="flex-1">
//               <SchoolLogo />
//             </div>
//             <div className="flex-2 text-center mx-4">
//               <h1 className="text-3xl font-bold mb-2 text-blue-900">GOD'S TREASURE SCHOOLS</h1>
//               <p className="text-sm text-blue-500 mb-1">No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Jikwoyi Phase III Abuja.</p>
             
//             </div>
//             <div className="flex-1 flex justify-end">
//               <SchoolLogo />
//             </div>
//           </div>

//           {/* Underlined divider */}
//           {/* <div className="border-b-2 border-black mb-4"></div> */}

//           {/* Student Information */}
//           <div className="mb-3">
//             <div className="grid grid-cols-2 gap-4 mb-3">
//               <div className="flex justify-content-space-between">
//                 <span className="font-semibold min-w-[120px]">TERM:</span>
//                 <span className="border-b border-black flex-1 ml-2">{studentData.term || ""}</span>
//                 <span className="font-semibold ml-8 min-w-[60px]">DATE:</span>
//                 <span className="border-b border-black flex-1 ml-2">{studentData.date || ""}</span>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 gap-4 mb-3">
//               <div className="flex">
//                 <span className="font-semibold min-w-[120px]">PUPIL'S NAME:</span>
//                 <span className="border-b border-black flex-1 ml-2">{studentData.name || ""}</span>
//               </div>
//               <div className="flex">
//                 <span className="font-semibold min-w-[200px]">NO OF TIMES SCHOOL OPENED:</span>
//                 <span className="border-b border-black flex-1 ml-2">{studentData.timesOpened || ""}</span>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4 mb-2">
//               <div className="flex">
//                 <span className="font-semibold min-w-[60px]">CLASS:</span>
//                 <span className="border-b border-black flex-1 ml-2 mr-4">{studentData.class || ""}</span>
//                 <span className="font-semibold min-w-[60px]">HOUSE:</span>
//                 <span className="border-b border-black flex-1 ml-2">{studentData.house || ""}</span>
//               </div>
//               <div className="flex">
//                 <span className="font-semibold min-w-[150px]">NO OF TIMES PRESENT:</span>
//                 <span className="border-b border-black flex-1 ml-2">{studentData.timesPresent || ""}</span>
//               </div>
//             </div>
//           </div>

//           {/* PHYSICAL DEVELOPMENT */}
//           <div className="mb-1 border-2 border-blue-900">
//             <div className="text-center text-red-600 font-semibold border-b-2 border-black py-2 bg-grey-100">
//               PHYSICAL DEVELOPMENT / SPECIAL REPORTS DURING THE TERM
//             </div>
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr>
//                   <th className="border border-black w-1/4 py-2 text-center font-semibold"> </th>
//                   <th className="border border-black py-2 text-center font-semibold">EXCELLENT</th>
//                   <th className="border border-black py-2 text-center font-semibold">VERY GOOD</th>
//                   <th className="border border-black py-2 text-center font-semibold">GOOD</th>
//                   <th className="border border-black py-2 text-center font-semibold">FAIR</th>
//                   <th className="border border-black py-2 text-center font-semibold">COMMENTS</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {["PHYSICAL DEVELOPMENT", "HEALTH", "CLEANLINESS", "GENERAL CONDUCT"].map((item, idx) => (
//                   <tr key={idx}>
//                     <td className="border border-black text-left px-3 py-2 font-semibold">{item}</td>
//                     <td className="border border-black py-2 h-8"></td>
//                     <td className="border border-black py-2 h-8"></td>
//                     <td className="border border-black py-2 h-8"></td>
//                     <td className="border border-black py-2 h-8"></td>
//                     <td className="border border-black py-2 h-8"></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* ACADEMIC PERFORMANCE */}
//           <div className="mb-1 border-2 border-black">
//             <div className="text-center text-red-600 font-semibold border-b-2 border-black py-2 bg-grey-100">ACADEMIC PERFORMANCE</div>
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr>
//                   <th className="border border-black w-2/5 py-2 text-center font-semibold">SUBJECTS</th>
//                   <th className="border border-black py-2 text-center font-semibold">MAX MARKS<br/>OBTAINABLE</th>
//                   <th className="border border-black py-2 text-center font-semibold">MARK<br/>OBTAINED</th>
//                   <th className="border border-black py-2 text-center font-semibold">POSITIONS</th>
//                   <th className="border border-black py-2 text-center font-semibold">COMMENTS</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {[
//                   "English (Alphabet)", "Mathematics (Numbers)", "Social Studies", "Basic Science",
//                   "Christian Religious Studies", "Computer Studies", "Moral & Value Studies (MVS)",
//                   "Colouring Activities", "Rhymes", "Physical & Health Education", "Writing Skill", "Craft"
//                 ].map((subject, idx) => (
//                   <tr key={idx}>
//                     <td className="border border-black text-left px-3 py-2">{subject}</td>
//                     <td className="border border-black py-2 h-8 text-center"></td>
//                     <td className="border border-black py-2 h-8 text-center"></td>
//                     <td className="border border-black py-2 h-8 text-center"></td>
//                     <td className="border border-black py-2 h-8"></td>
//                   </tr>
//                 ))}
//                 <tr className="bg-gray-100">
//                   <td className="border border-black font-bold text-right px-3 py-2">Total</td>
//                   <td className="border border-black py-2 h-8 text-center"></td>
//                   <td className="border border-black py-2 h-8 text-center"></td>
//                   <td className="border border-black py-2 h-8 text-center"></td>
//                   <td className="border border-black py-2 h-4"></td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           {/* PUPIL'S POSITION */}
//           <div className="mb-1 border-2 border-black p-1 bg-gray-50">
//             <div className="text-center font-bold mb-2 text-red-600 text-lg underline">PUPIL'S POSITION</div>
//             <div className="grid grid-cols-4 gap-4 text-sm">
//               <div className="flex items-center">
//                 <span className="font-semibold">PERCENTAGE AVERAGE:</span>
                
//               </div>
//               <div className="flex items-center">
//                 <span className="font-semibold">GRADE:</span>
                
//               </div>
//               <div className="flex items-center">
//                 <span className="font-semibold">POSITION:</span>
             
//               </div>
//               <div className="flex items-center">
//                 <span className="font-semibold">OUT OF:</span>
                
//               </div>
//             </div>
//           </div>

//           {/* GENERAL COMMENTS */}
//           <div className="mb-1 border-2 border-black">
//             <div className="text-center font-bold text-red-600 border-b-2 border-black py-1 bg-gray-100">GENERAL COMMENTS</div>
//             <div className="p-2 space-y-4">
//               <div className="flex items-center">
//                 <span className="font-semibold min-w-[180px]">CLASS TEACHER'S REMARK:</span>
              
//               </div>
//               <div className="flex items-center">
//                 <span className="font-semibold min-w-[180px]">HEAD TEACHER'S REMARK:</span>
            
//               </div>
//               <div className="grid grid-cols-2 gap-8 mt-2">
//                 <div className="flex items-center">
//                   <span className="font-semibold">CLASS TEACHER'S SIGNATURE:</span>
             
//                 </div>
//                 <div className="flex items-center">
//                   <span className="font-semibold">HEAD TEACHER'S SIGNATURE:</span>
                
//                 </div>
//               </div>
//               <div className="flex items-center mt-1">
//                 <span className="font-semibold min-w-[150px]">NEXT TERM BEGINS ON:</span>
              
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* DOWNLOAD BUTTON */}
//       <div className="text-center mt-6">
//         <button
//           onClick={downloadPDF}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
//         >
//           Download PDF
//         </button>
//       </div>
//     </div>
//   );
// }


// import React from "react";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";

// type ResultSheetProps = {
//   studentData: {
//     name?: string;
//     class?: string;
//     term?: string;
//     date?: string;
//     house?: string;
//     timesOpened?: string;
//     timesPresent?: string;
//     // Add other fields as needed
//   };
// };

// const SchoolLogo = () => (
//   <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white shadow-lg" 
//        style={{
//          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
//          border: '2px solid #1e40af'
//        }}>
//     <div className="text-center text-xs">
//       <div className="font-bold text-lg mb-1">GTS</div>
//       <div className="text-[8px] font-medium">GOD'S TREASURE</div>
//       <div className="text-[8px] font-medium">SCHOOLS</div>
//     </div>
//   </div>
// );

// const WatermarkLogo = () => (
//   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
//     <div className="text-center">
//       <div className="w-80 h-80 rounded-full flex items-center justify-center mb-8 border-4"
//            style={{
//              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
//              borderColor: '#1e40af'
//            }}>
//         <div className="text-center text-white">
//           <div className="text-6xl font-bold mb-4">GTS</div>
//           <div className="text-2xl font-semibold">GOD'S TREASURE</div>
//           <div className="text-xl font-semibold">SCHOOLS</div>
//         </div>
//       </div>
//       <div className="text-8xl font-bold" style={{ color: '#1e40af' }}>
//         GOD'S TREASURE SCHOOLS
//       </div>
//     </div>
//   </div>
// );

// export default function ResultSheet({ studentData }: ResultSheetProps) {
//   const downloadPDF = async () => {
//     const input = document.getElementById("result-sheet");
//     if (!input) return;
    
//     const canvas = await html2canvas(input, { 
//       scale: 1.5, 
//       useCORS: true,
//       allowTaint: true,
//       backgroundColor: '#ffffff'
//     });
    
//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");
    
//     const pageWidth = 210;
//     const pageHeight = 297;
//     const margin = 5;
    
//     const availableWidth = pageWidth - (2 * margin);
//     const availableHeight = pageHeight - (2 * margin);
    
//     const imgProps = pdf.getImageProperties(imgData);
//     const imgRatio = imgProps.height / imgProps.width;
    
//     let finalWidth = availableWidth;
//     let finalHeight = availableWidth * imgRatio;
    
//     if (finalHeight > availableHeight) {
//       finalHeight = availableHeight;
//       finalWidth = availableHeight / imgRatio;
//     }
    
//     const xOffset = margin + (availableWidth - finalWidth) / 2;
//     const yOffset = margin + (availableHeight - finalHeight) / 2;
    
//     pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);
//     pdf.save(`${studentData.name || "result-sheet"}.pdf`);
//   };

//   return (
//     <div className="p-6" style={{
//       background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
//       minHeight: '100vh'
//     }}>
//       <div id="result-sheet" className="relative p-6 w-[794px] mx-auto bg-white text-xs overflow-hidden shadow-2xl rounded-2xl border border-slate-200">
        
//         {/* Background Watermark */}
//         <WatermarkLogo />
        
//         {/* Content Layer */}
//         <div className="relative z-10">
          
//           {/* HEADER with Logo */}
//           <div className="flex justify-between items-start mb-6">
//             <div className="flex-1">
//               <SchoolLogo />
//             </div>
//             <div className="flex-2 text-center mx-6">
//               <h1 className="text-3xl font-black mb-2 tracking-tight" 
//                   style={{ color: '#1e40af' }}>
//                 GOD'S TREASURE SCHOOLS
//               </h1>
//               <p className="text-sm text-slate-600 mb-1 font-medium">
//                 No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Jikwoyi Phase III Abuja.
//               </p>
//             </div>
//             <div className="flex-1 flex justify-end">
//               <SchoolLogo />
//             </div>
//           </div>

//           {/* Student Information */}
//           <div className="mb-6 p-4 rounded-xl border border-slate-200"
//                style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
            
//             <div className="grid grid-cols-2 gap-6 mb-4">
//               <div className="flex items-center">
//                 <span className="font-bold text-slate-700 min-w-[80px]">TERM:</span>
//                 <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
//                   {studentData.term || ""}
//                 </span>
//                 <span className="font-bold text-slate-700 ml-8 min-w-[50px]">DATE:</span>
//                 <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
//                   {studentData.date || ""}
//                 </span>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-2 gap-6 mb-4">
//               <div className="flex items-center">
//                 <span className="font-bold text-slate-700 min-w-[120px]">PUPIL'S NAME:</span>
//                 <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
//                   {studentData.name || ""}
//                 </span>
//               </div>
//               <div className="flex items-center">
//                 <span className="font-bold text-slate-700 min-w-[200px]">NO OF TIMES SCHOOL OPENED:</span>
//                 <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
//                   {studentData.timesOpened || ""}
//                 </span>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-6">
//               <div className="flex items-center">
//                 <span className="font-bold text-slate-700 min-w-[60px]">CLASS:</span>
//                 <span className="border-b-2 border-blue-300 flex-1 ml-3 mr-6 pb-1 text-slate-800 font-medium">
//                   {studentData.class || ""}
//                 </span>
//                 <span className="font-bold text-slate-700 min-w-[60px]">HOUSE:</span>
//                 <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
//                   {studentData.house || ""}
//                 </span>
//               </div>
//               <div className="flex items-center">
//                 <span className="font-bold text-slate-700 min-w-[150px]">NO OF TIMES PRESENT:</span>
//                 <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
//                   {studentData.timesPresent || ""}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* PHYSICAL DEVELOPMENT */}
//           <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-200">
//             <div className="text-center font-bold py-3 text-white text-sm tracking-wide"
//                  style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
//               PHYSICAL DEVELOPMENT / SPECIAL REPORTS DURING THE TERM
//             </div>
//             <table className="w-full border-collapse bg-white">
//               <thead>
//                 <tr style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
//                   <th className="border border-slate-300 w-1/4 py-3 text-center font-bold text-slate-700"> </th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">EXCELLENT</th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">VERY GOOD</th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">GOOD</th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">FAIR</th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">COMMENTS</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {["PHYSICAL DEVELOPMENT", "HEALTH", "CLEANLINESS", "GENERAL CONDUCT"].map((item, idx) => (
//                   <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
//                     <td className="border border-slate-300 text-left px-4 py-3 font-bold text-slate-700">{item}</td>
//                     <td className="border border-slate-300 py-3 h-10"></td>
//                     <td className="border border-slate-300 py-3 h-10"></td>
//                     <td className="border border-slate-300 py-3 h-10"></td>
//                     <td className="border border-slate-300 py-3 h-10"></td>
//                     <td className="border border-slate-300 py-3 h-10"></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* ACADEMIC PERFORMANCE */}
//           <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-200">
//             <div className="text-center font-bold py-3 text-white text-sm tracking-wide"
//                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
//               ACADEMIC PERFORMANCE
//             </div>
//             <table className="w-full border-collapse bg-white">
//               <thead>
//                 <tr style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
//                   <th className="border border-slate-300 w-2/5 py-3 text-center font-bold text-slate-700">SUBJECTS</th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">MAX MARKS<br/>OBTAINABLE</th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">MARK<br/>OBTAINED</th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">POSITIONS</th>
//                   <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">COMMENTS</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {[
//                   "English (Alphabet)", "Mathematics (Numbers)", "Social Studies", "Basic Science",
//                   "Christian Religious Studies", "Computer Studies", "Moral & Value Studies (MVS)",
//                   "Colouring Activities", "Rhymes", "Physical & Health Education", "Writing Skill", "Craft"
//                 ].map((subject, idx) => (
//                   <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
//                     <td className="border border-slate-300 text-left px-4 py-3 font-medium text-slate-700">{subject}</td>
//                     <td className="border border-slate-300 py-3 h-10 text-center"></td>
//                     <td className="border border-slate-300 py-3 h-10 text-center"></td>
//                     <td className="border border-slate-300 py-3 h-10 text-center"></td>
//                     <td className="border border-slate-300 py-3 h-10"></td>
//                   </tr>
//                 ))}
//                 <tr style={{ background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' }}>
//                   <td className="border border-slate-300 font-black text-right px-4 py-3 text-slate-800">Total</td>
//                   <td className="border border-slate-300 py-3 h-10 text-center"></td>
//                   <td className="border border-slate-300 py-3 h-10 text-center"></td>
//                   <td className="border border-slate-300 py-3 h-10 text-center"></td>
//                   <td className="border border-slate-300 py-3 h-10"></td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           {/* PUPIL'S POSITION */}
//           <div className="mb-6 p-5 rounded-xl border border-slate-200"
//                style={{ background: 'linear-gradient(135deg, #fef7cd, #fef3c7)' }}>
//             <div className="text-center font-black mb-4 text-lg tracking-wide"
//                  style={{ color: '#dc2626' }}>
//               PUPIL'S POSITION
//             </div>
//             <div className="grid grid-cols-4 gap-4 text-sm">
//               <div className="text-center">
//                 <span className="font-bold text-slate-700 block mb-2">PERCENTAGE AVERAGE</span>
//                 <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
//               </div>
//               <div className="text-center">
//                 <span className="font-bold text-slate-700 block mb-2">GRADE</span>
//                 <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
//               </div>
//               <div className="text-center">
//                 <span className="font-bold text-slate-700 block mb-2">POSITION</span>
//                 <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
//               </div>
//               <div className="text-center">
//                 <span className="font-bold text-slate-700 block mb-2">OUT OF</span>
//                 <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
//               </div>
//             </div>
//           </div>

//           {/* GENERAL COMMENTS */}
//           <div className="mb-4 rounded-xl overflow-hidden shadow-lg border border-slate-200">
//             <div className="text-center font-bold py-3 text-white text-sm tracking-wide"
//                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
//               GENERAL COMMENTS
//             </div>
//             <div className="p-6 space-y-5" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
//               <div className="space-y-2">
//                 <span className="font-bold text-slate-700 block">CLASS TEACHER'S REMARK:</span>
//                 <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
//               </div>
              
//               <div className="space-y-2">
//                 <span className="font-bold text-slate-700 block">HEAD TEACHER'S REMARK:</span>
//                 <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
//               </div>
              
//               <div className="grid grid-cols-2 gap-8 pt-4">
//                 <div className="space-y-2">
//                   <span className="font-bold text-slate-700 block">CLASS TEACHER'S SIGNATURE:</span>
//                   <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
//                 </div>
//                 <div className="space-y-2">
//                   <span className="font-bold text-slate-700 block">HEAD TEACHER'S SIGNATURE:</span>
//                   <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
//                 </div>
//               </div>
              
//               <div className="space-y-2 pt-2">
//                 <span className="font-bold text-slate-700 block">NEXT TERM BEGINS ON:</span>
//                 <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* DOWNLOAD BUTTON */}
//       <div className="text-center mt-8">
//         <button
//           onClick={downloadPDF}
//           className="px-8 py-4 text-white rounded-xl font-bold text-sm tracking-wide shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
//           style={{
//             background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
//             boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
//           }}
//         >
//           📄 Download PDF
//         </button>
//       </div>
//     </div>
//   );
// }


import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type ResultSheetProps = {
  studentData: {
    name?: string;
    class?: string;
    term?: string;
    date?: string;
    house?: string;
    timesOpened?: string;
    timesPresent?: string;
    // Add other fields as needed
  };
};

const SchoolLogo = () => (
  <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white shadow-lg" 
       style={{
         background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
         border: '2px solid #1e40af'
       }}>
    <div className="text-center text-xs">
      <div className="font-bold text-lg mb-1">GTS</div>
      <div className="text-[8px] font-medium">GOD'S TREASURE</div>
      <div className="text-[8px] font-medium">SCHOOLS</div>
    </div>
  </div>
);

const WatermarkLogo = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
    <div className="text-center">
      <div className="w-80 h-80 rounded-full flex items-center justify-center mb-8 border-4"
           style={{
             background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
             borderColor: '#1e40af'
           }}>
        <div className="text-center text-white">
          <div className="text-6xl font-bold mb-4">GTS</div>
          <div className="text-2xl font-semibold">GOD'S TREASURE</div>
          <div className="text-xl font-semibold">SCHOOLS</div>
        </div>
      </div>
      <div className="text-8xl font-bold" style={{ color: '#1e40af' }}>
        GOD'S TREASURE SCHOOLS
      </div>
    </div>
  </div>
);

export default function ResultSheet({ studentData }: ResultSheetProps) {
  const downloadPDF = async () => {
    const input = document.getElementById("result-sheet");
    if (!input) return;
    
    const canvas = await html2canvas(input, { 
      scale: 1.7, // Increased scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    // A4 dimensions in mm
    const pageWidth = 210;
    const pageHeight = 297;
    
    // Use the full page dimensions without margins
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save(`${studentData.name || "result-sheet"}.pdf`);
  };

  return (
    <div className="p-6" style={{
      background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
      minHeight: '100vh'
    }}>
      <div id="result-sheet" className="relative p-6 w-[794px] mx-auto bg-white text-xs overflow-hidden shadow-2xl rounded-2xl border border-slate-200">
        
        {/* Background Watermark */}
        <WatermarkLogo />
        
        {/* Content Layer */}
        <div className="relative z-10">
          
          {/* HEADER with Logo */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <SchoolLogo />
            </div>
            <div className="flex-2 text-center mx-6">
              <h1 className="text-3xl font-black mb-2 tracking-tight" 
                  style={{ color: '#1e40af' }}>
                GOD'S TREASURE SCHOOLS
              </h1>
              <p className="text-sm text-slate-600 mb-1 font-medium">
                No 54 Dagbana Road, Opp. St. Kevin's Catholic Church, Jikwoyi Phase III Abuja.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <SchoolLogo />
            </div>
          </div>

          {/* Student Information */}
          <div className="mb-6 p-4 rounded-xl border border-slate-200"
               style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
            
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[80px]">TERM:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.term || ""}
                </span>
                <span className="font-bold text-slate-700 ml-8 min-w-[50px]">DATE:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.date || ""}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[120px]">PUPIL'S NAME:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.name || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[200px]">NO OF TIMES SCHOOL OPENED:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.timesOpened || ""}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[60px]">CLASS:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 mr-6 pb-1 text-slate-800 font-medium">
                  {studentData.class || ""}
                </span>
                <span className="font-bold text-slate-700 min-w-[60px]">HOUSE:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.house || ""}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-700 min-w-[150px]">NO OF TIMES PRESENT:</span>
                <span className="border-b-2 border-blue-300 flex-1 ml-3 pb-1 text-slate-800 font-medium">
                  {studentData.timesPresent || ""}
                </span>
              </div>
            </div>
          </div>

          {/* PHYSICAL DEVELOPMENT */}
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-200">
            <div className="text-center font-bold py-3 text-white text-sm tracking-wide"
                 style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
              PHYSICAL DEVELOPMENT / SPECIAL REPORTS DURING THE TERM
            </div>
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                  <th className="border border-slate-300 w-1/4 py-3 text-center font-bold text-slate-700"> </th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">EXCELLENT</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">VERY GOOD</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">GOOD</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">FAIR</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">COMMENTS</th>
                </tr>
              </thead>
              <tbody>
                {["PHYSICAL DEVELOPMENT", "HEALTH", "CLEANLINESS", "GENERAL CONDUCT"].map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 text-left px-4 py-3 font-bold text-slate-700">{item}</td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ACADEMIC PERFORMANCE */}
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg border border-slate-200">
            <div className="text-center font-bold py-3 text-white text-sm tracking-wide"
                 style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
              ACADEMIC PERFORMANCE
            </div>
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                  <th className="border border-slate-300 w-2/5 py-3 text-center font-bold text-slate-700">SUBJECTS</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">MAX MARKS<br/>OBTAINABLE</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">MARK<br/>OBTAINED</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">POSITIONS</th>
                  <th className="border border-slate-300 py-3 text-center font-bold text-slate-700">COMMENTS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "English (Alphabet)", "Mathematics (Numbers)", "Social Studies", "Basic Science",
                  "Christian Religious Studies", "Computer Studies", "Moral & Value Studies (MVS)",
                  "Colouring Activities", "Rhymes", "Physical & Health Education", "Writing Skill", "Craft"
                ].map((subject, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 text-left px-4 py-3 font-medium text-slate-700">{subject}</td>
                    <td className="border border-slate-300 py-3 h-10 text-center"></td>
                    <td className="border border-slate-300 py-3 h-10 text-center"></td>
                    <td className="border border-slate-300 py-3 h-10 text-center"></td>
                    <td className="border border-slate-300 py-3 h-10"></td>
                  </tr>
                ))}
                <tr style={{ background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' }}>
                  <td className="border border-slate-300 font-black text-right px-4 py-3 text-slate-800">Total</td>
                  <td className="border border-slate-300 py-3 h-10 text-center"></td>
                  <td className="border border-slate-300 py-3 h-10 text-center"></td>
                  <td className="border border-slate-300 py-3 h-10 text-center"></td>
                  <td className="border border-slate-300 py-3 h-10"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PUPIL'S POSITION */}
          <div className="mb-6 p-5 rounded-xl border border-slate-200"
               style={{ background: 'linear-gradient(135deg, #fef7cd, #fef3c7)' }}>
            <div className="text-center font-black mb-4 text-lg tracking-wide"
                 style={{ color: '#dc2626' }}>
              PUPIL'S POSITION
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">PERCENTAGE AVERAGE</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">GRADE</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">POSITION</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
              </div>
              <div className="text-center">
                <span className="font-bold text-slate-700 block mb-2">OUT OF</span>
                <div className="border-b-2 border-amber-400 h-8 bg-white rounded-md"></div>
              </div>
            </div>
          </div>

          {/* GENERAL COMMENTS */}
          <div className="mb-4 rounded-xl overflow-hidden shadow-lg border border-slate-200">
            <div className="text-center font-bold py-3 text-white text-sm tracking-wide"
                 style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              GENERAL COMMENTS
            </div>
            <div className="p-6 space-y-5" style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' }}>
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">CLASS TEACHER'S REMARK:</span>
                <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
              </div>
              
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">HEAD TEACHER'S REMARK:</span>
                <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">CLASS TEACHER'S SIGNATURE:</span>
                  <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
                </div>
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">HEAD TEACHER'S SIGNATURE:</span>
                  <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 block">NEXT TERM BEGINS ON:</span>
                <div className="border-b-2 border-green-300 h-8 bg-white rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      <div className="text-center mt-8">
        <button
          onClick={downloadPDF}
          className="px-8 py-4 text-white rounded-xl font-bold text-sm tracking-wide shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
          style={{
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
          }}
        >
          📄 Download PDF
        </button>
      </div>
    </div>
  );
}