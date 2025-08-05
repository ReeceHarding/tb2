// Auto-generated from school data extraction
// Do not edit manually - regenerate with npm run generate-integration

export interface ExtractedSchoolData {
  id: string;
  name: string;
  city: string;
  state?: string;
  type: 'alpha-school' | 'other-school';
  videos: ExtractedMediaFile[];
  images: ExtractedMediaFile[];
  documents: ExtractedMediaFile[];
  totalFiles: number;
}

export interface ExtractedMediaFile {
  filename: string;
  url: string;
  fileType: 'video' | 'image' | 'document';
  mimeType: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  duration?: number;
  title?: string;
  description?: string;
  tags?: string[];
}

// Available schools (25 total)
export const AVAILABLE_SCHOOLS = {
  ALPHA_SCHOOLS: {
    'alpha-austin': { name: 'Alpha High School', city: 'Austin', state: 'TX' },
    'alpha-austin-main': { name: 'Alpha School', city: 'Austin', state: 'TX' },
    'alpha-bethesda': { name: 'Alpha School', city: 'Bethesda', state: 'MD' },
    'alpha-brownsville': { name: 'Alpha School', city: 'Brownsville', state: 'TX' },
    'alpha-chantilly': { name: 'Alpha School', city: 'Chantilly', state: 'VA' },
    'alpha-charlotte': { name: 'Alpha School', city: 'Charlotte', state: 'NC' },
    'alpha-chicago': { name: 'Alpha School', city: 'Chicago', state: 'IL' },
    'alpha-denver': { name: 'Alpha School', city: 'Denver', state: 'CO' },
    'alpha-folsom': { name: 'Alpha School', city: 'Folsom', state: 'CA' },
    'alpha-fort-worth': { name: 'Alpha School', city: 'Fort Worth', state: 'TX' },
    'alpha-houston': { name: 'Alpha School', city: 'Houston', state: 'TX' },
    'alpha-lake-forest': { name: 'Alpha School', city: 'Lake Forest', state: 'CA' },
    'alpha-miami': { name: 'Alpha School', city: 'Miami', state: 'FL' },
    'alpha-new-york': { name: 'Alpha School', city: 'New York', state: 'NY' },
    'alpha-orlando': { name: 'Alpha School', city: 'Orlando', state: 'FL' },
    'alpha-palm-beach': { name: 'Alpha School', city: 'Palm Beach', state: 'FL' },
    'alpha-plano': { name: 'Alpha School', city: 'Plano', state: 'TX' },
    'alpha-raleigh': { name: 'Alpha School', city: 'Raleigh', state: 'NC' },
    'alpha-san-francisco': { name: 'Alpha School', city: 'San Francisco', state: 'CA' },
    'alpha-santa-barbara': { name: 'Alpha School', city: 'Santa Barbara', state: 'CA' },
    'alpha-scottsdale': { name: 'Alpha School', city: 'Scottsdale', state: 'AZ' },
    'alpha-silicon-valley': { name: 'Alpha School', city: 'Silicon Valley', state: 'CA' },
    'alpha-tampa': { name: 'Alpha School', city: 'Tampa', state: 'FL' }
  },
  OTHER_SCHOOLS: {
    'gt-school': { name: 'GT School', city: 'Unknown' },
    'nextgen-austin': { name: 'NextGen Academy', city: 'Austin' }
  }
} as const;

// Media counts
export const MEDIA_STATS = {
  totalVideos: 25,
  totalImages: 25,
  totalDocuments: 49,
  totalFiles: 102,
  lastUpdated: '2025-08-03T21:05:54.184Z'
} as const;

export type SchoolId = keyof typeof AVAILABLE_SCHOOLS.ALPHA_SCHOOLS | keyof typeof AVAILABLE_SCHOOLS.OTHER_SCHOOLS;
