// libs/content-registry.ts

interface ContentRegistryEntry {
  isGenerated: boolean;
  content: any;
  timestamp: number;
}

class ContentRegistry {
  private static instance: ContentRegistry;
  private registry: Map<string, ContentRegistryEntry> = new Map();

  private constructor() {}

  public static getInstance(): ContentRegistry {
    if (!ContentRegistry.instance) {
      ContentRegistry.instance = new ContentRegistry();
    }
    return ContentRegistry.instance;
  }

  public setContent(sectionId: string, content: any) {
    this.registry.set(sectionId, {
      isGenerated: true,
      content,
      timestamp: Date.now(),
    });
  }

  public getContent(sectionId: string): ContentRegistryEntry | undefined {
    return this.registry.get(sectionId);
  }

  public isGenerated(sectionId: string): boolean {
    return this.registry.has(sectionId) && this.registry.get(sectionId)!.isGenerated;
  }
}

export const contentRegistry = ContentRegistry.getInstance();
