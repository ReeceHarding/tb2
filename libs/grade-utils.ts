/**
 * Utility functions for converting between grade formats
 * Quiz uses strings ('K', '1st', '2nd', etc.)
 * API uses numbers (0 for K, 1-12 for grades)
 */

import { Grade } from '@/types/quiz';

/**
 * Convert quiz grade string to numeric format for API
 * @param grade - Grade string from quiz (e.g., '5th', 'K')
 * @returns Numeric grade (0 for K, 1-12 for grades)
 */
export function gradeToNumber(grade: Grade | null): number | null {
  if (!grade) return null;
  
  const gradeMap: Record<Grade, number> = {
    'K': 0,
    '1st': 1,
    '2nd': 2,
    '3rd': 3,
    '4th': 4,
    '5th': 5,
    '6th': 6,
    '7th': 7,
    '8th': 8,
    '9th': 9,
    '10th': 10,
    '11th': 11,
    '12th': 12
  };
  
  return gradeMap[grade] ?? null;
}

/**
 * Convert numeric grade to display string
 * @param gradeNumber - Numeric grade (0-12)
 * @returns Grade string for display
 */
export function numberToGrade(gradeNumber: number): string {
  const grades = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
  return grades[gradeNumber] || `Grade ${gradeNumber}`;
}

/**
 * Get grade range string for display
 * @param centerGrade - Center grade number
 * @param range - Plus/minus range
 * @returns Display string like "3rd-5th grade"
 */
export function getGradeRangeString(centerGrade: number, range: number = 1): string {
  const minGrade = Math.max(0, centerGrade - range);
  const maxGrade = Math.min(12, centerGrade + range);
  
  if (minGrade === maxGrade) {
    return numberToGrade(minGrade);
  }
  
  return `${numberToGrade(minGrade)}-${numberToGrade(maxGrade)} grade`;
}

/**
 * Check if a grade is in high school range
 * @param gradeNumber - Numeric grade
 * @returns True if grade 9-12
 */
export function isHighSchool(gradeNumber: number): boolean {
  return gradeNumber >= 9 && gradeNumber <= 12;
}

/**
 * Check if a grade is in middle school range
 * @param gradeNumber - Numeric grade
 * @returns True if grade 6-8
 */
export function isMiddleSchool(gradeNumber: number): boolean {
  return gradeNumber >= 6 && gradeNumber <= 8;
}

/**
 * Check if a grade is in elementary school range
 * @param gradeNumber - Numeric grade
 * @returns True if grade K-5
 */
export function isElementarySchool(gradeNumber: number): boolean {
  return gradeNumber >= 0 && gradeNumber <= 5;
}