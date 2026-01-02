import { EducationLevel } from '@/types/results';
import { RemarkEducationKey } from '@/types/results';

export const mapEducationLevelToRemarkKey = (
  level: EducationLevel
): RemarkEducationKey => {
  switch (level) {
    case 'NURSERY':
      return 'nursery';
    case 'PRIMARY':
      return 'primary';
    case 'JUNIOR_SECONDARY':
      return 'junior_secondary';
    case 'SENIOR_SECONDARY':
      return 'senior_secondary';
    default:
      return 'primary';
  }
};
