import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Field mapping utility for consistent data access
export const fieldMapper = {
  // Map quiz fields to AI generation expected fields
  mapQuizToAI: (quizData: Record<string, any>): Record<string, any> => {
    return {
      // Grade mapping
      studentGrade: quizData.grade || quizData.studentGrade,
      
      // Interests mapping
      interests: quizData.kidsInterests || quizData.interests || [],
      
      // Location mapping - extract from selected schools or use provided location
      userLocation: quizData.userLocation || quizData.zipCode || 
        (quizData.selectedSchools && quizData.selectedSchools.length > 0 && quizData.selectedSchools[0].city
          ? `${quizData.selectedSchools[0].city}, ${quizData.selectedSchools[0].state}`
          : null),
      
      // Family size mapping
      familySize: quizData.numberOfKids || quizData.familySize || 1,
      
      // Subject mapping - extract from interests or use dedicated field
      subjects: quizData.subjects || 
        (quizData.kidsInterests ? quizData.kidsInterests.filter((i: string) => 
          ['math', 'science', 'reading', 'writing', 'history', 'languages', 'arts', 'stem'].includes(i.toLowerCase())
        ) : []),
      
      // Direct mappings
      selectedSchools: quizData.selectedSchools || [],
      academicGoals: quizData.academicGoals || [],
      timePreference: quizData.timePreference,
      parentSchedule: quizData.parentSchedule,
      currentChallenges: quizData.currentChallenges,
      
      // Learning goals mapping
      learningGoal: quizData.learningGoal,
      subject: quizData.subject,
      
      // Pass through any other fields
      ...quizData
    };
  },
  
  // Map AI fields back to quiz/storage fields
  mapAIToQuiz: (aiData: Record<string, any>): Record<string, any> => {
    return {
      grade: aiData.studentGrade || aiData.grade,
      kidsInterests: aiData.interests || aiData.kidsInterests || [],
      numberOfKids: aiData.familySize || aiData.numberOfKids || 1,
      ...aiData
    };
  }
};

// Types for our data structures
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface SectionData {
  id: string;
  userId: string;
  sectionType: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedContent {
  id: string;
  userId: string;
  sectionType: string;
  prompt: string;
  response: any;
  schema: any;
  createdAt: Date;
}

export interface Journey {
  id: string;
  userId: string;
  title: string;
  sections: string[]; // Array of content IDs
  sharedUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;
  
  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    
    // Create client with standard configuration
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });
  }
  
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }
  
  // User Profile Operations
  async createOrUpdateUser(email: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // Map interface field names to database column names
      const dbData = {
        email,
        first_name: data.firstName,
        last_name: data.lastName,
        metadata: data.metadata || {},
        updated_at: new Date().toISOString()
      };
      
      const { data: user, error } = await this.client
        .from('user_profiles')
        .upsert(dbData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Map response back to interface field names
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        createdAt: user.createdAt || user.created_at,
        updatedAt: user.updatedAt || user.updated_at,
        metadata: user.metadata || {}
      };
    } catch (error) {
      console.error('[SupabaseService] Error creating/updating user:', error);
      return null;
    }
  }
  
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.client
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle missing records gracefully
        
      if (error) {
        console.error('[SupabaseService] Query error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('[SupabaseService] No user profile found for email:', email);
        return null;
      }
      
      // Map database column names to interface field names
      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name || data.firstName,
        lastName: data.last_name || data.lastName,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at,
        metadata: data.metadata || {}
      };
    } catch (error) {
      console.error('[SupabaseService] Error fetching user:', error);
      return null;
    }
  }
  
  // Section Data Operations
  async saveSectionData(userId: string, sectionType: string, data: any): Promise<SectionData | null> {
    try {
      console.log(`[SupabaseService] Saving section data for ${sectionType}`);
      
      // Map to database column names (userId -> user_email)
      const { data: saved, error } = await this.client
        .from('section_data')
        .upsert({
          user_email: userId, // Map userId parameter to user_email column
          sectionId: sectionType, // Use sectionId as the column name
          data,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Map response back to interface field names
      return {
        id: saved.id,
        userId: saved.user_email, // Map back to userId
        sectionType: saved.sectionId, // Map sectionId back to sectionType
        data: saved.data,
        createdAt: saved.createdAt || saved.created_at,
        updatedAt: saved.updatedAt || saved.updated_at
      };
    } catch (error) {
      console.error('[SupabaseService] Error saving section data:', error);
      return null;
    }
  }
  
  async getSectionData(userId: string, sectionType: string): Promise<SectionData | null> {
    try {
      const { data, error } = await this.client
        .from('section_data')
        .select('*')
        .eq('user_email', userId) // Map userId to user_email column
        .eq('sectionId', sectionType) // Map sectionType to sectionId column
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      if (!data) return null;
      
      // Map response back to interface field names
      return {
        id: data.id,
        userId: data.user_email,
        sectionType: data.sectionId, // Map sectionId back to sectionType
        data: data.data,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at
      };
    } catch (error) {
      console.error('[SupabaseService] Error fetching section data:', error);
      return null;
    }
  }
  
  async getAllSectionData(userId: string): Promise<SectionData[]> {
    try {
      const { data, error } = await this.client
        .from('section_data')
        .select('*')
        .eq('user_email', userId) // Map userId to user_email column
        .order('created_at', { ascending: true }); // Map createdAt to created_at
        
      if (error) throw error;
      
      // Map each item back to interface field names
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_email,
        sectionType: item.sectionId, // Map sectionId back to sectionType
        data: item.data,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at
      }));
    } catch (error) {
      console.error('[SupabaseService] Error fetching all section data:', error);
      return [];
    }
  }
  
  // Generated Content Operations
  async saveGeneratedContent(
    userId: string,
    sectionType: string,
    prompt: string,
    response: any,
    schema: any
  ): Promise<GeneratedContent | null> {
    try {
      console.log(`[SupabaseService] Saving generated content for ${sectionType}`);
      
      // Map to database column names
      const { data, error } = await this.client
        .from('generated_content')
        .insert({
          user_email: userId, // Map userId to user_email
          sectionId: sectionType, // Map sectionType to sectionId
          content: response, // Map response to content column
          metadata: { prompt, schema }, // Store prompt and schema in metadata
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Map response back to interface field names
      return {
        id: data.id,
        userId: data.user_email,
        sectionType: data.sectionId, // Map sectionId back to sectionType
        prompt: data.metadata?.prompt || prompt,
        response: data.content,
        schema: data.metadata?.schema || schema,
        createdAt: data.createdAt || data.created_at
      };
    } catch (error) {
      console.error('[SupabaseService] Error saving generated content:', error);
      return null;
    }
  }
  
  async getGeneratedContent(userId: string, sectionType?: string): Promise<GeneratedContent[]> {
    try {
      let query = this.client
        .from('generated_content')
        .select('*')
        .eq('user_email', userId); // Map userId to user_email column
        
      if (sectionType) {
        query = query.eq('sectionId', sectionType); // Map sectionType to sectionId column
      }
      
      const { data, error } = await query.order('created_at', { ascending: true }); // Map createdAt to created_at
      
      if (error) throw error;
      
      // Map each item back to interface field names
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_email,
        sectionType: item.sectionId, // Map sectionId back to sectionType
        prompt: item.metadata?.prompt || '',
        response: item.content,
        schema: item.metadata?.schema || {},
        createdAt: item.createdAt || item.created_at
      }));
    } catch (error) {
      console.error('[SupabaseService] Error fetching generated content:', error);
      return [];
    }
  }
  
  // Journey Operations
  async createJourney(userId: string, title: string): Promise<Journey | null> {
    try {
      // Map to database column names
      const { data, error } = await this.client
        .from('journeys')
        .insert({
          user_email: userId, // Map userId to user_email
          title,
          sections: [],
          metadata: { isPublic: false }, // Store isPublic in metadata
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Map response back to interface field names
      return {
        id: data.id,
        userId: data.user_email,
        title: data.title,
        sections: data.sections || [],
        sharedUrl: data.shareId,
        isPublic: data.metadata?.isPublic || false,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at
      };
    } catch (error) {
      console.error('[SupabaseService] Error creating journey:', error);
      return null;
    }
  }
  
  async updateJourney(journeyId: string, updates: Partial<Journey>): Promise<Journey | null> {
    try {
      const { data, error } = await this.client
        .from('journeys')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', journeyId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[SupabaseService] Error updating journey:', error);
      return null;
    }
  }
  
  async addSectionToJourney(journeyId: string, contentId: string): Promise<boolean> {
    try {
      // First get the current journey
      const { data: journey, error: fetchError } = await this.client
        .from('journeys')
        .select('sections')
        .eq('id', journeyId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Add the new section
      const updatedSections = [...(journey.sections || []), contentId];
      
      const { error: updateError } = await this.client
        .from('journeys')
        .update({
          sections: updatedSections,
          updatedAt: new Date().toISOString()
        })
        .eq('id', journeyId);
        
      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error('[SupabaseService] Error adding section to journey:', error);
      return false;
    }
  }
  
  async getJourneysByUser(userId: string): Promise<Journey[]> {
    try {
      const { data, error } = await this.client
        .from('journeys')
        .select('*')
        .eq('user_email', userId) // Map userId to user_email column
        .order('created_at', { ascending: false }); // Map createdAt to created_at
        
      if (error) throw error;
      
      // Map each item back to interface field names
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_email,
        title: item.title,
        sections: item.sections || [],
        sharedUrl: item.shareId,
        isPublic: item.metadata?.isPublic || false,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at
      }));
    } catch (error) {
      console.error('[SupabaseService] Error fetching user journeys:', error);
      return [];
    }
  }
  
  async getJourneyById(journeyId: string): Promise<Journey | null> {
    try {
      const { data, error } = await this.client
        .from('journeys')
        .select('*')
        .eq('id', journeyId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[SupabaseService] Error fetching journey:', error);
      return null;
    }
  }
  
  async getPublicJourney(sharedUrl: string): Promise<Journey | null> {
    try {
      const { data, error } = await this.client
        .from('journeys')
        .select('*')
        .eq('sharedUrl', sharedUrl)
        .eq('isPublic', true)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[SupabaseService] Error fetching public journey:', error);
      return null;
    }
  }
  
  // Email-based retrieval
  async getUserDataByEmail(email: string): Promise<{
    profile: UserProfile | null;
    sectionData: SectionData[];
    generatedContent: GeneratedContent[];
    journeys: Journey[];
  }> {
    try {
      // First get the user
      const profile = await this.getUserByEmail(email);
      if (!profile) {
        return {
          profile: null,
          sectionData: [],
          generatedContent: [],
          journeys: []
        };
      }
      
      // Then get all their data
      const [sectionData, generatedContent, journeys] = await Promise.all([
        this.getAllSectionData(profile.id),
        this.getGeneratedContent(profile.id),
        this.getJourneysByUser(profile.id)
      ]);
      
      return {
        profile,
        sectionData,
        generatedContent,
        journeys
      };
    } catch (error) {
      console.error('[SupabaseService] Error fetching user data by email:', error);
      return {
        profile: null,
        sectionData: [],
        generatedContent: [],
        journeys: []
      };
    }
  }
  
  // Utility method to check if service is available
  async isAvailable(): Promise<boolean> {
    try {
      const { error } = await this.client.from('user_profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export const supabaseService = SupabaseService.getInstance();