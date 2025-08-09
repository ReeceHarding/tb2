import * as fs from 'fs';
import * as path from 'path';
import { 
  SECTION_SCHEMAS, 
  SectionSchema,
  generatePromptFromSchema,
  hasRequiredData,
  getMissingData 
} from './section-schemas';
import { fieldMapper } from './supabase-service';
import { aiPromptLogger } from './ai-prompt-logger';

// Cache for XML template
let xmlTemplateCache: string | null = null;
let templateCacheTimestamp = 0;
const TEMPLATE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface XMLPromptBuilderOptions {
  sectionId: string;
  userData: Record<string, any>;
  userContext: {
    email?: string;
    firstName?: string;
    lastName?: string;
    userId?: string;
  };
  messageHistory?: Array<{ role: string; content: string }>;
  additionalContext?: Record<string, any>;
}

interface XMLPromptResponse {
  success: boolean;
  prompt?: string;
  missingData?: string[];
  error?: string;
}

class XMLPromptBuilder {
  private static instance: XMLPromptBuilder;
  
  private constructor() {}
  
  public static getInstance(): XMLPromptBuilder {
    if (!XMLPromptBuilder.instance) {
      XMLPromptBuilder.instance = new XMLPromptBuilder();
    }
    return XMLPromptBuilder.instance;
  }
  
  // Load and cache XML template
  private getXMLTemplate(): string {
    const now = Date.now();
    
    if (!xmlTemplateCache || (now - templateCacheTimestamp) > TEMPLATE_CACHE_TTL) {
      console.log('[XMLPromptBuilder] Loading XML template from filesystem');
      const templatePath = path.join(process.cwd(), 'public/docs/prompt-example.xml');
      xmlTemplateCache = fs.readFileSync(templatePath, 'utf8');
      templateCacheTimestamp = now;
    } else {
      console.log('[XMLPromptBuilder] Using cached XML template');
    }
    
    return xmlTemplateCache;
  }
  
  // Build prompt for a specific section
  public buildPrompt(options: XMLPromptBuilderOptions): XMLPromptResponse {
    const { sectionId, userData, userContext, messageHistory = [], additionalContext = {} } = options;
    
    console.log(`[XMLPromptBuilder] Building prompt for section: ${sectionId}`);
    
    // Get section schema
    const schema = SECTION_SCHEMAS[sectionId];
    if (!schema) {
      return {
        success: false,
        error: `Unknown section ID: ${sectionId}`
      };
    }
    
    // Map user data to AI expected field names
    const mappedUserData = fieldMapper.mapQuizToAI(userData);
    console.log('[XMLPromptBuilder] Mapped user data:', mappedUserData);
    
    // Check for missing required data
    const missingData = getMissingData(sectionId, mappedUserData);
    if (missingData.length > 0) {
      console.log(`[XMLPromptBuilder] Missing required data: ${missingData.join(', ')}`);
      return {
        success: false,
        missingData
      };
    }
    
    try {
      // Get base XML template
      const xmlTemplate = this.getXMLTemplate();
      
      // Generate section-specific prompt from schema
      const sectionPrompt = generatePromptFromSchema(sectionId, mappedUserData);
      
      // Build context for the section
      const sectionContext = this.buildSectionContext(schema, mappedUserData, additionalContext);
      
      // Build message history string
      const messageHistoryString = messageHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      // Get other knowledge bases (whitepaper, school info)
      const whitepaperContent = this.getWhitepaperContent();
      const schoolInfoContent = this.getSchoolInfoContent();
      
      // Build the complete prompt
      let populatedPrompt = xmlTemplate
        .replace('{{WHITE_PAPER_CONTENT}}', whitepaperContent)
        .replace('{{SCHOOL_INFO_CONTENT}}', schoolInfoContent)
        .replace('{{USER_FIRST_NAME}}', userContext.firstName || 'Parent')
        .replace('{{STUDENT_GRADE_LEVEL}}', mappedUserData.studentGrade || 'elementary')
        .replace('{{STUDENT_SUBJECTS_OF_INTEREST}}', Array.isArray(mappedUserData.subjects) ? mappedUserData.subjects.join(', ') : 'math, science')
        .replace('{{PARENT_CONCERNS}}', Array.isArray(mappedUserData.academicGoals) ? mappedUserData.academicGoals.join(', ') : 'academic achievement')
        .replace('{{SELECTED_SCHOOLS_CONTEXT}}', this.buildSchoolContext(mappedUserData.selectedSchools))
        .replace('{{SCHOOL_LEVELS}}', this.getSchoolLevels(mappedUserData.studentGrade))
        .replace('{{SCHOOL_LOCATIONS}}', this.getSchoolLocations(mappedUserData.selectedSchools))
        .replace('{{SCHOOL_NAMES}}', this.getSchoolNames(mappedUserData.selectedSchools))
        .replace('{{CURRENT_REQUEST}}', sectionPrompt)
        .replace('{{MESSAGE_HISTORY}}', messageHistoryString)
        .replace('{{QUIZ_DATA}}', JSON.stringify(mappedUserData, null, 2))
        .replace('{{USER_CONTEXT}}', JSON.stringify(userContext, null, 2));
      
      // Add section-specific instructions
      populatedPrompt = this.addSectionInstructions(populatedPrompt, schema, sectionContext);
      
      // Log the XML prompt
      aiPromptLogger.logXMLPrompt('xml-prompt-builder', populatedPrompt, {
        sectionId,
        userId: userContext.userId,
        userEmail: userContext.email,
        messageHistoryCount: messageHistory.length,
        promptLength: populatedPrompt.length
      });
      
      return {
        success: true,
        prompt: populatedPrompt
      };
      
    } catch (error) {
      console.error('[XMLPromptBuilder] Error building prompt:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Build context specific to the section
  private buildSectionContext(
    schema: SectionSchema, 
    userData: Record<string, any>,
    additionalContext: Record<string, any>
  ): string {
    const contextParts: string[] = [];
    
    // Add section name and description
    contextParts.push(`Section: ${schema.name}`);
    contextParts.push(`Purpose: ${schema.description}`);
    
    // Add available data points
    const availableData = [...schema.requiredData, ...schema.optionalData]
      .filter(field => userData[field] !== undefined && userData[field] !== null);
    
    contextParts.push(`Available Data: ${availableData.join(', ')}`);
    
    // Add expected output structure
    contextParts.push(`Expected Output Structure: ${JSON.stringify(schema.outputStructure, null, 2)}`);
    
    // Add component type hint
    contextParts.push(`Component Type: ${schema.componentType}`);
    
    // Add any additional context
    if (Object.keys(additionalContext).length > 0) {
      contextParts.push(`Additional Context: ${JSON.stringify(additionalContext, null, 2)}`);
    }
    
    return contextParts.join('\n');
  }
  
  // Add section-specific instructions to the prompt
  private addSectionInstructions(
    prompt: string, 
    schema: SectionSchema,
    sectionContext: string
  ): string {
    // Find the instructions section and add section-specific guidance
    const instructionsMarker = '</instructions>';
    const insertPosition = prompt.indexOf(instructionsMarker);
    
    if (insertPosition === -1) {
      return prompt;
    }
    
    const sectionInstructions = `

SECTION-SPECIFIC INSTRUCTIONS FOR ${schema.name.toUpperCase()}:
${sectionContext}

Generate content that strictly follows the expected output structure.
Ensure all required fields are populated with relevant, personalized content.
For ${schema.componentType} components, format the response appropriately.
`;
    
    return prompt.slice(0, insertPosition) + sectionInstructions + prompt.slice(insertPosition);
  }
  
  // Get whitepaper content
  private getWhitepaperContent(): string {
    try {
      const whitepaperPath = path.join(process.cwd(), 'public/data/timeback-whitepaper.md');
      return fs.readFileSync(whitepaperPath, 'utf8');
    } catch (error) {
      console.error('[XMLPromptBuilder] Error reading whitepaper:', error);
      return '';
    }
  }
  
  // Get school info content
  private getSchoolInfoContent(): string {
    try {
      const schoolInfoPath = path.join(process.cwd(), 'public/data/school-info.md');
      return fs.readFileSync(schoolInfoPath, 'utf8');
    } catch (error) {
      console.error('[XMLPromptBuilder] Error reading school info:', error);
      return '';
    }
  }
  
  // Build school context from selected schools
  private buildSchoolContext(selectedSchools?: string[]): string {
    if (!selectedSchools || selectedSchools.length === 0) {
      return 'No specific schools selected';
    }
    
    return `User is interested in: ${selectedSchools.join(', ')}`;
  }
  
  // Get school levels based on grade
  private getSchoolLevels(grade?: string): string {
    if (!grade) return 'All levels';
    
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum)) {
      return grade === 'K' ? 'Elementary' : 'All levels';
    }
    
    if (gradeNum <= 5) return 'Elementary';
    if (gradeNum <= 8) return 'Middle School';
    return 'High School';
  }
  
  // Get school locations from selected schools
  private getSchoolLocations(selectedSchools?: string[]): string {
    if (!selectedSchools || selectedSchools.length === 0) {
      return 'Multiple locations';
    }
    
    // Map school IDs to locations
    const locationMap: Record<string, string> = {
      'austin': 'Austin, TX',
      'houston': 'Houston, TX',
      'dallas': 'Dallas, TX',
      'miami': 'Miami, FL',
      'nyc': 'New York, NY',
      'chicago': 'Chicago, IL',
      'sf': 'San Francisco, CA',
      'la': 'Los Angeles, CA'
    };
    
    const locations = selectedSchools
      .map(school => locationMap[school] || school)
      .filter(Boolean);
    
    return locations.length > 0 ? locations.join(', ') : 'Multiple locations';
  }
  
  // Get school names from selected schools
  private getSchoolNames(selectedSchools?: string[]): string {
    if (!selectedSchools || selectedSchools.length === 0) {
      return 'TimeBack Schools';
    }
    
    // Map school IDs to names
    const nameMap: Record<string, string> = {
      'austin': 'TimeBack Austin',
      'houston': 'TimeBack Houston',
      'dallas': 'TimeBack Dallas',
      'miami': 'TimeBack Miami',
      'nyc': 'TimeBack New York',
      'chicago': 'TimeBack Chicago',
      'sf': 'TimeBack San Francisco',
      'la': 'TimeBack Los Angeles'
    };
    
    const names = selectedSchools
      .map(school => nameMap[school] || `TimeBack ${school}`)
      .filter(Boolean);
    
    return names.length > 0 ? names.join(', ') : 'TimeBack Schools';
  }
  
  // Validate that AI response matches schema
  public validateResponse(sectionId: string, response: any): boolean {
    const schema = SECTION_SCHEMAS[sectionId];
    if (!schema) return false;
    
    try {
      // Basic validation - check if response has expected structure
      const expectedKeys = Object.keys(schema.outputStructure);
      const responseKeys = Object.keys(response);
      
      // Check if all expected keys are present
      const hasAllKeys = expectedKeys.every(key => responseKeys.includes(key));
      
      if (!hasAllKeys) {
        console.error(`[XMLPromptBuilder] Response missing expected keys for ${sectionId}`);
        return false;
      }
      
      // Additional type checking could be added here
      
      return true;
    } catch (error) {
      console.error('[XMLPromptBuilder] Error validating response:', error);
      return false;
    }
  }
}

export const xmlPromptBuilder = XMLPromptBuilder.getInstance();
export type { XMLPromptBuilderOptions, XMLPromptResponse };