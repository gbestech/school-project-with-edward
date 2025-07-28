// Mock data for student results and school logo

export const schoolLogoSVG = `
<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <polygon points="40,10 70,70 10,70" fill="#001f4d" stroke="#b30000" stroke-width="3" />
  <text x="40" y="45" text-anchor="middle" font-size="10" fill="#fff" font-family="Arial" font-weight="bold">God's</text>
  <text x="40" y="57" text-anchor="middle" font-size="10" fill="#fff" font-family="Arial" font-weight="bold">Treasure</text>
  <text x="40" y="69" text-anchor="middle" font-size="10" fill="#fff" font-family="Arial" font-weight="bold">Schools</text>
</svg>
`;

export interface SubjectResult {
  subject: string;
  score: number;
  grade: string;
  remarks: string;
  teacher: string;
}

export interface StudentResultSheet {
  studentId: string;
  studentName: string;
  username: string; // unique username
  class: string;
  term: string;
  year: string;
  profilePicUrl: string;
  results: SubjectResult[];
}

export const mockStudentResults: StudentResultSheet[] = [
  {
    studentId: 'STU001',
    studentName: 'John Doe',
    username: 'johndoe',
    class: 'Primary 5',
    term: 'First Term',
    year: '2024/2025',
    profilePicUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    results: [
      { subject: 'Mathematics', score: 85, grade: 'A', remarks: 'Excellent', teacher: 'Mrs. Johnson' },
      { subject: 'English Language', score: 80, grade: 'A-', remarks: 'Very Good', teacher: 'Mrs. Davis' },
      { subject: 'Basic Science', score: 78, grade: 'B+', remarks: 'Good', teacher: 'Mr. Smith' },
      { subject: 'Social Studies', score: 74, grade: 'B', remarks: 'Good', teacher: 'Mrs. Brown' },
      { subject: 'CRS/IRS', score: 90, grade: 'A+', remarks: 'Outstanding', teacher: 'Mr. White' }
    ]
  }
]; 