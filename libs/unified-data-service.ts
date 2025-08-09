import { supabaseService, UserProfile, SectionData, GeneratedContent, Journey } from './supabase-service';

// Local storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'timeback-user-profile',
  SECTION_DATA: 'timeback-section-data',
  GENERATED_CONTENT: 'timeback-generated-content',
  JOURNEYS: 'timeback-journeys',
  SYNC_STATUS: 'timeback-sync-status'
};

// Types for local storage
interface LocalStorageData {
  userProfile?: UserProfile;
  sectionData: Record<string, SectionData>;
  generatedContent: GeneratedContent[];
  journeys: Journey[];
  lastSynced?: number;
}

interface SyncStatus {
  lastSync: number;
  pendingSync: string[];
  syncErrors: Array<{ key: string; error: string; timestamp: number }>;
}

class UnifiedDataService {
  private static instance: UnifiedDataService;
  private isOnline: boolean = true;
  private syncInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Check online status
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      
      // Start sync interval
      this.startSyncInterval();
    }
  }
  
  public static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }
  
  private handleOnline() {
    console.log('[UnifiedDataService] Online - starting sync');
    this.isOnline = true;
    this.syncLocalToCloud();
  }
  
  private handleOffline() {
    console.log('[UnifiedDataService] Offline - using local storage only');
    this.isOnline = false;
  }
  
  private startSyncInterval() {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncLocalToCloud();
      }
    }, 30000);
  }
  
  // Local Storage Operations
  private getLocalData(): LocalStorageData {
    if (typeof window === 'undefined') {
      return { sectionData: {}, generatedContent: [], journeys: [] };
    }
    
    try {
      const userProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const sectionData = localStorage.getItem(STORAGE_KEYS.SECTION_DATA);
      const generatedContent = localStorage.getItem(STORAGE_KEYS.GENERATED_CONTENT);
      const journeys = localStorage.getItem(STORAGE_KEYS.JOURNEYS);
      
      return {
        userProfile: userProfile ? JSON.parse(userProfile) : undefined,
        sectionData: sectionData ? JSON.parse(sectionData) : {},
        generatedContent: generatedContent ? JSON.parse(generatedContent) : [],
        journeys: journeys ? JSON.parse(journeys) : []
      };
    } catch (error) {
      console.error('[UnifiedDataService] Error reading local storage:', error);
      return { sectionData: {}, generatedContent: [], journeys: [] };
    }
  }
  
  private saveToLocal(key: string, data: any) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.markForSync(key);
    } catch (error) {
      console.error('[UnifiedDataService] Error saving to local storage:', error);
    }
  }
  
  private markForSync(key: string) {
    const syncStatus = this.getSyncStatus();
    if (!syncStatus.pendingSync.includes(key)) {
      syncStatus.pendingSync.push(key);
      localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(syncStatus));
    }
  }
  
  private getSyncStatus(): SyncStatus {
    if (typeof window === 'undefined') {
      return { lastSync: 0, pendingSync: [], syncErrors: [] };
    }
    
    try {
      const status = localStorage.getItem(STORAGE_KEYS.SYNC_STATUS);
      return status ? JSON.parse(status) : { lastSync: 0, pendingSync: [], syncErrors: [] };
    } catch {
      return { lastSync: 0, pendingSync: [], syncErrors: [] };
    }
  }
  
  // User Profile Operations
  async getUserProfile(email: string): Promise<UserProfile | null> {
    // Check local first
    const localData = this.getLocalData();
    if (localData.userProfile && localData.userProfile.email === email) {
      console.log('[UnifiedDataService] User profile found in local storage');
      return localData.userProfile;
    }
    
    // If online, check Supabase
    if (this.isOnline) {
      const cloudProfile = await supabaseService.getUserByEmail(email);
      if (cloudProfile) {
        console.log('[UnifiedDataService] User profile found in cloud');
        this.saveToLocal(STORAGE_KEYS.USER_PROFILE, cloudProfile);
        return cloudProfile;
      }
    }
    
    return null;
  }
  
  async saveUserProfile(email: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = {
      ...data,
      email,
      id: data.id || crypto.randomUUID(),
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date()
    } as UserProfile;
    
    // Save to local storage immediately
    this.saveToLocal(STORAGE_KEYS.USER_PROFILE, profile);
    
    // Try to save to cloud if online
    if (this.isOnline) {
      const cloudProfile = await supabaseService.createOrUpdateUser(email, profile);
      if (cloudProfile) {
        return cloudProfile;
      }
    }
    
    return profile;
  }
  
  // Section Data Operations
  async getAllSectionData(userId: string): Promise<SectionData[]> {
    // Get from local storage
    const localData = this.getLocalData();
    const allSections: SectionData[] = [];
    
    // Extract all section data for this user from local storage
    Object.entries(localData.sectionData).forEach(([key, data]) => {
      if (data.userId === userId) {
        allSections.push(data);
      }
    });
    
    // If online, also get from Supabase
    if (this.isOnline) {
      const cloudData = await supabaseService.getAllSectionData(userId);
      
      // Merge and deduplicate
      const localIds = new Set(allSections.map(s => s.id));
      for (const section of cloudData) {
        if (!localIds.has(section.id)) {
          allSections.push(section);
        }
      }
    }
    
    return allSections;
  }
  
  async getSectionData(userId: string, sectionType: string): Promise<SectionData | null> {
    // Check local first
    const localData = this.getLocalData();
    const key = `${userId}-${sectionType}`;
    
    if (localData.sectionData[key]) {
      console.log(`[UnifiedDataService] Section data for ${sectionType} found in local storage`);
      return localData.sectionData[key];
    }
    
    // If online, check Supabase
    if (this.isOnline) {
      const cloudData = await supabaseService.getSectionData(userId, sectionType);
      if (cloudData) {
        console.log(`[UnifiedDataService] Section data for ${sectionType} found in cloud`);
        localData.sectionData[key] = cloudData;
        this.saveToLocal(STORAGE_KEYS.SECTION_DATA, localData.sectionData);
        return cloudData;
      }
    }
    
    return null;
  }
  
  async saveSectionData(userId: string, sectionType: string, data: any): Promise<SectionData | null> {
    const sectionData: SectionData = {
      id: crypto.randomUUID(),
      userId,
      sectionType,
      data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to local storage immediately
    const localData = this.getLocalData();
    const key = `${userId}-${sectionType}`;
    localData.sectionData[key] = sectionData;
    this.saveToLocal(STORAGE_KEYS.SECTION_DATA, localData.sectionData);
    
    // Try to save to cloud if online
    if (this.isOnline) {
      const cloudData = await supabaseService.saveSectionData(userId, sectionType, data);
      if (cloudData) {
        return cloudData;
      }
    }
    
    return sectionData;
  }
  
  // Generated Content Operations
  async saveGeneratedContent(
    userId: string,
    sectionType: string,
    prompt: string,
    response: any,
    schema: any
  ): Promise<GeneratedContent | null> {
    const content: GeneratedContent = {
      id: crypto.randomUUID(),
      userId,
      sectionType,
      prompt,
      response,
      schema,
      createdAt: new Date()
    };
    
    // Save to local storage immediately
    const localData = this.getLocalData();
    localData.generatedContent.push(content);
    this.saveToLocal(STORAGE_KEYS.GENERATED_CONTENT, localData.generatedContent);
    
    // Try to save to cloud if online
    if (this.isOnline) {
      const cloudContent = await supabaseService.saveGeneratedContent(
        userId,
        sectionType,
        prompt,
        response,
        schema
      );
      if (cloudContent) {
        return cloudContent;
      }
    }
    
    return content;
  }
  
  async getGeneratedContent(userId: string, sectionType?: string): Promise<GeneratedContent[]> {
    // Get local content
    const localData = this.getLocalData();
    let localContent = localData.generatedContent.filter(c => c.userId === userId);
    
    if (sectionType) {
      localContent = localContent.filter(c => c.sectionType === sectionType);
    }
    
    // If online, merge with cloud content
    if (this.isOnline) {
      const cloudContent = await supabaseService.getGeneratedContent(userId, sectionType);
      
      // Merge and deduplicate
      const merged = [...localContent];
      const localIds = new Set(localContent.map(c => c.id));
      
      for (const content of cloudContent) {
        if (!localIds.has(content.id)) {
          merged.push(content);
        }
      }
      
      // Sort by creation date
      merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      return merged;
    }
    
    return localContent;
  }
  
  // Journey Operations
  async createJourney(userId: string, title: string): Promise<Journey | null> {
    const journey: Journey = {
      id: crypto.randomUUID(),
      userId,
      title,
      sections: [],
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to local storage
    const localData = this.getLocalData();
    localData.journeys.push(journey);
    this.saveToLocal(STORAGE_KEYS.JOURNEYS, localData.journeys);
    
    // Try to save to cloud if online
    if (this.isOnline) {
      const cloudJourney = await supabaseService.createJourney(userId, title);
      if (cloudJourney) {
        // Update local with cloud ID
        const index = localData.journeys.findIndex(j => j.id === journey.id);
        if (index !== -1) {
          localData.journeys[index] = cloudJourney;
          this.saveToLocal(STORAGE_KEYS.JOURNEYS, localData.journeys);
        }
        return cloudJourney;
      }
    }
    
    return journey;
  }
  
  async getJourney(journeyId: string): Promise<Journey | null> {
    // Check local first
    const localData = this.getLocalData();
    const journey = localData.journeys.find(j => j.id === journeyId);
    
    if (journey) {
      console.log('[UnifiedDataService] Journey found in local storage');
      return journey;
    }
    
    // If online, check Supabase
    if (this.isOnline) {
      const cloudJourney = await supabaseService.getJourneyById(journeyId);
      if (cloudJourney) {
        console.log('[UnifiedDataService] Journey found in cloud');
        // Cache locally
        localData.journeys.push(cloudJourney);
        this.saveToLocal(STORAGE_KEYS.JOURNEYS, localData.journeys);
        return cloudJourney;
      }
    }
    
    return null;
  }
  
  async getJourneysByUser(userId: string): Promise<Journey[]> {
    // Get from local storage
    const localData = this.getLocalData();
    const userJourneys = localData.journeys.filter(j => j.userId === userId);
    
    // If online, merge with cloud data
    if (this.isOnline) {
      const cloudJourneys = await supabaseService.getJourneysByUser(userId);
      
      // Merge and deduplicate
      const localIds = new Set(userJourneys.map(j => j.id));
      for (const journey of cloudJourneys) {
        if (!localIds.has(journey.id)) {
          userJourneys.push(journey);
        }
      }
    }
    
    // Sort by creation date (newest first)
    userJourneys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return userJourneys;
  }
  
  async addSectionToJourney(journeyId: string, contentId: string): Promise<boolean> {
    // Update local storage
    const localData = this.getLocalData();
    const journey = localData.journeys.find(j => j.id === journeyId);
    
    if (journey) {
      journey.sections.push(contentId);
      journey.updatedAt = new Date();
      this.saveToLocal(STORAGE_KEYS.JOURNEYS, localData.journeys);
      
      // Try to update cloud if online
      if (this.isOnline) {
        await supabaseService.addSectionToJourney(journeyId, contentId);
      }
      
      return true;
    }
    
    return false;
  }
  
  // Sync Operations
  async syncLocalToCloud(): Promise<void> {
    if (!this.isOnline) return;
    
    console.log('[UnifiedDataService] Starting sync to cloud');
    const syncStatus = this.getSyncStatus();
    const localData = this.getLocalData();
    
    try {
      // Sync user profile
      if (localData.userProfile && syncStatus.pendingSync.includes(STORAGE_KEYS.USER_PROFILE)) {
        await supabaseService.createOrUpdateUser(
          localData.userProfile.email,
          localData.userProfile
        );
        syncStatus.pendingSync = syncStatus.pendingSync.filter(
          k => k !== STORAGE_KEYS.USER_PROFILE
        );
      }
      
      // Sync section data
      if (syncStatus.pendingSync.includes(STORAGE_KEYS.SECTION_DATA)) {
        for (const [key, sectionData] of Object.entries(localData.sectionData)) {
          await supabaseService.saveSectionData(
            sectionData.userId,
            sectionData.sectionType,
            sectionData.data
          );
        }
        syncStatus.pendingSync = syncStatus.pendingSync.filter(
          k => k !== STORAGE_KEYS.SECTION_DATA
        );
      }
      
      // Sync generated content
      if (syncStatus.pendingSync.includes(STORAGE_KEYS.GENERATED_CONTENT)) {
        for (const content of localData.generatedContent) {
          await supabaseService.saveGeneratedContent(
            content.userId,
            content.sectionType,
            content.prompt,
            content.response,
            content.schema
          );
        }
        syncStatus.pendingSync = syncStatus.pendingSync.filter(
          k => k !== STORAGE_KEYS.GENERATED_CONTENT
        );
      }
      
      // Update sync status
      syncStatus.lastSync = Date.now();
      localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(syncStatus));
      
      console.log('[UnifiedDataService] Sync completed successfully');
    } catch (error) {
      console.error('[UnifiedDataService] Sync error:', error);
      syncStatus.syncErrors.push({
        key: 'sync',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      localStorage.setItem(STORAGE_KEYS.SYNC_STATUS, JSON.stringify(syncStatus));
    }
  }
  
  // Utility method to check if data exists for a section
  async hasDataForSection(userId: string, sectionType: string): Promise<boolean> {
    const data = await this.getSectionData(userId, sectionType);
    return data !== null;
  }
  
  // Clear all local data (for testing or logout)
  clearLocalData(): void {
    if (typeof window === 'undefined') return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
  
  // Cleanup on destroy
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const unifiedDataService = UnifiedDataService.getInstance();
export type { UserProfile, SectionData, GeneratedContent, Journey } from './supabase-service';