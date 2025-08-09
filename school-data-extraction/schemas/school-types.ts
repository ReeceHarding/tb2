/**
 * TypeScript schemas for school marketing materials extraction
 * Defines the structure for organizing data from Google Drive folders
 */

export interface SchoolLocation {
  id: string;
  name: string;
  city: string;
  state?: string;
  type: 'alpha-school' | 'other-school';
  isMainBrand: boolean;
}

export interface MediaFile {
  filename: string;
  originalPath: string;
  localPath: string;
  fileType: 'video' | 'image' | 'document';
  mimeType: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // for videos
  thumbnailPath?: string;
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
    dateCreated?: string;
    lastModified?: string;
  };
}

export interface SchoolData {
  school: SchoolLocation;
  media: {
    videos: MediaFile[];
    images: MediaFile[];
    documents: MediaFile[];
  };
  metadata: {
    totalFiles: number;
    lastUpdated: string;
    extractionDate: string;
    googleDriveFolder: string;
  };
  marketing: {
    description?: string;
    highlights?: string[];
    programs?: string[];
    accreditations?: string[];
  };
}

export interface ExtractionReport {
  summary: {
    totalSchools: number;
    totalFiles: number;
    extractionDate: string;
    status: 'complete' | 'partial' | 'failed';
  };
  schools: SchoolData[];
  errors: Array<{
    school: string;
    error: string;
    timestamp: string;
  }>;
  fileTypes: {
    videos: number;
    images: number;
    documents: number;
  };
}

// Predefined school locations based on the Google Drive structure
export const ALPHA_SCHOOL_LOCATIONS: SchoolLocation[] = [
  { id: 'alpha-austin', name: 'Alpha High School', city: 'Austin', state: 'TX', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-austin-main', name: 'Alpha School', city: 'Austin', state: 'TX', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-bethesda', name: 'Alpha School', city: 'Bethesda', state: 'MD', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-brownsville', name: 'Alpha School', city: 'Brownsville', state: 'TX', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-chantilly', name: 'Alpha School', city: 'Chantilly', state: 'VA', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-charlotte', name: 'Alpha School', city: 'Charlotte', state: 'NC', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-chicago', name: 'Alpha School', city: 'Chicago', state: 'IL', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-denver', name: 'Alpha School', city: 'Denver', state: 'CO', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-folsom', name: 'Alpha School', city: 'Folsom', state: 'CA', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-fort-worth', name: 'Alpha School', city: 'Fort Worth', state: 'TX', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-houston', name: 'Alpha School', city: 'Houston', state: 'TX', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-lake-forest', name: 'Alpha School', city: 'Lake Forest', state: 'CA', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-miami', name: 'Alpha School', city: 'Miami', state: 'FL', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-microschools', name: 'Alpha School Microschools', city: 'Multiple', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-new-york', name: 'Alpha School', city: 'New York', state: 'NY', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-orlando', name: 'Alpha School', city: 'Orlando', state: 'FL', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-palm-beach', name: 'Alpha School', city: 'Palm Beach', state: 'FL', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-plano', name: 'Alpha School', city: 'Plano', state: 'TX', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-raleigh', name: 'Alpha School', city: 'Raleigh', state: 'NC', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-san-francisco', name: 'Alpha School', city: 'San Francisco', state: 'CA', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-santa-barbara', name: 'Alpha School', city: 'Santa Barbara', state: 'CA', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-scottsdale', name: 'Alpha School', city: 'Scottsdale', state: 'AZ', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-silicon-valley', name: 'Alpha School', city: 'Silicon Valley', state: 'CA', type: 'alpha-school', isMainBrand: true },
  { id: 'alpha-tampa', name: 'Alpha School', city: 'Tampa', state: 'FL', type: 'alpha-school', isMainBrand: true },
];

export const OTHER_SCHOOL_LOCATIONS: SchoolLocation[] = [
  { id: 'gt-school', name: 'GT School', city: 'Unknown', type: 'other-school', isMainBrand: false },
  { id: 'nextgen-austin', name: 'NextGen Academy', city: 'Austin', state: 'TX', type: 'other-school', isMainBrand: false },
  { id: 'nova-academy', name: 'Nova Academy (aka Valenta Academy)', city: 'Unknown', type: 'other-school', isMainBrand: false },
  { id: 'novatio-school', name: 'Novatio School', city: 'Unknown', type: 'other-school', isMainBrand: false },
  { id: 'sat-level-up', name: 'SAT Level Up', city: 'Unknown', type: 'other-school', isMainBrand: false },
  { id: 'texas-sports-academy', name: 'Texas Sports Academy', city: 'Texas', state: 'TX', type: 'other-school', isMainBrand: false },

  { id: 'unbound', name: 'Unbound', city: 'Unknown', type: 'other-school', isMainBrand: false },
  { id: 'montessorium', name: 'Montessorium', city: 'Unknown', type: 'other-school', isMainBrand: false },
  { id: 'limitless-education', name: 'Limitless Education', city: 'Unknown', type: 'other-school', isMainBrand: false },
  { id: 'learn-earn', name: 'Learn + Earn', city: 'Unknown', type: 'other-school', isMainBrand: false },
];

export const ALL_SCHOOLS = [...ALPHA_SCHOOL_LOCATIONS, ...OTHER_SCHOOL_LOCATIONS];