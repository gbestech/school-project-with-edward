import api from './api';

// Backend Attendance model fields:
// id, date, student, teacher, section, status

export interface AttendanceRecordBackend {
  id: number;
  date: string;
  student: number | null;
  teacher: number | null;
  section: number | null;
  status: 'P' | 'A' | 'L' | 'E'; // Present, Absent, Late, Excused
}

export const AttendanceStatusMap: Record<'present' | 'absent' | 'late' | 'excused', 'P' | 'A' | 'L' | 'E'> = {
  present: 'P',
  absent: 'A',
  late: 'L',
  excused: 'E',
};

export const AttendanceCodeToStatusMap: Record<'P' | 'A' | 'L' | 'E', 'present' | 'absent' | 'late' | 'excused'> = {
  P: 'present',
  A: 'absent',
  L: 'late',
  E: 'excused',
};

export async function getAttendance(params?: Record<string, any>) {
  return api.get('/attendance/attendance/', params);
}

export async function addAttendance(data: Partial<AttendanceRecordBackend>) {
  return api.post('/attendance/attendance/', data);
}

export async function updateAttendance(id: number, data: Partial<AttendanceRecordBackend>) {
  return api.patch(`/attendance/attendance/${id}/`, data);
}

export async function deleteAttendance(id: number) {
  return api.delete(`/attendance/attendance/${id}/`);
}

// Lesson/Class Attendance
export async function getLessonAttendance(params?: Record<string, any>) {
  return api.get('/lessons/attendances/', params);
}

export async function addLessonAttendance(data: any) {
  return api.post('/lessons/attendances/', data);
}

export async function updateLessonAttendance(id: number, data: any) {
  return api.patch(`/lessons/attendances/${id}/`, data);
}

export async function deleteLessonAttendance(id: number) {
  return api.delete(`/lessons/attendances/${id}/`);
}
