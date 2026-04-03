/**
 * Predefined subject list for the foundation multi-select.
 *
 * Covers Norwegian videregående subjects + common international equivalents.
 * Grouped by category for clean UI presentation.
 */

export interface SubjectGroup {
  category: string;
  subjects: string[];
}

export const SUBJECT_GROUPS: SubjectGroup[] = [
  {
    category: 'Mathematics & Science',
    subjects: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Science',
      'Statistics',
    ],
  },
  {
    category: 'Technology',
    subjects: [
      'Computer Science',
      'IT',
      'Design & Technology',
      'Media Studies',
    ],
  },
  {
    category: 'Languages',
    subjects: [
      'English',
      'Norwegian',
      'German',
      'French',
      'Spanish',
    ],
  },
  {
    category: 'Humanities & Social',
    subjects: [
      'History',
      'Geography',
      'Psychology',
      'Sociology',
      'Philosophy',
      'Law',
      'Politics',
      'Economics',
    ],
  },
  {
    category: 'Business & Finance',
    subjects: [
      'Business Studies',
      'Accounting',
      'Entrepreneurship',
    ],
  },
  {
    category: 'Creative & Practical',
    subjects: [
      'Art & Design',
      'Music',
      'Drama',
      'Food Technology',
      'Physical Education',
    ],
  },
  {
    category: 'Health & Care',
    subjects: [
      'Health Science',
      'Social Studies',
    ],
  },
];

/** Flat list of all predefined subjects */
export const ALL_SUBJECTS = SUBJECT_GROUPS.flatMap((g) => g.subjects);
