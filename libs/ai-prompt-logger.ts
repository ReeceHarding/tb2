import fs from 'fs';
import path from 'path';

interface PromptLogEntry {
  timestamp: string;
  type: 'SYSTEM' | 'USER' | 'ASSISTANT' | 'XML_PROMPT' | 'API_REQUEST' | 'API_RESPONSE';
  service: string;
  prompt?: string;
  response?: string;
  error?: string;
  metadata?: Record<string, any>;
}

class AIPromptLogger {
  private static instance: AIPromptLogger;
  private logFile: string;
  private maxPromptLength: number;

  private constructor() {
    this.logFile = path.join(process.cwd(), 'log.txt');
    this.maxPromptLength = parseInt(process.env.AI_PROMPT_LOG_MAX_LENGTH || '5000');
  }

  static getInstance(): AIPromptLogger {
    if (!AIPromptLogger.instance) {
      AIPromptLogger.instance = new AIPromptLogger();
    }
    return AIPromptLogger.instance;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private trimContent(content: string, maxLength?: number): string {
    const limit = maxLength || this.maxPromptLength;
    
    if (content.length <= limit) {
      return content;
    }
    
    // Special handling for whitepaper content
    if (content.includes('# TimeBack Educational Whitepaper') || content.includes('TimeBack enables students')) {
      const lines = content.split('\n');
      const firstLines = lines.slice(0, 10).join('\n');
      const lastLines = lines.slice(-5).join('\n');
      const totalLines = lines.length;
      const trimmedChars = content.length - (firstLines.length + lastLines.length + 100);
      
      return `${firstLines}\n\n... [WHITEPAPER CONTENT TRIMMED - ${trimmedChars} characters, ${totalLines - 15} lines hidden for terminal readability] ...\n\n${lastLines}`;
    }
    
    // General content trimming
    const halfLimit = Math.floor(limit / 2);
    const start = content.substring(0, halfLimit);
    const end = content.substring(content.length - halfLimit);
    const trimmedChars = content.length - limit;
    
    return `${start}\n\n... [CONTENT TRIMMED - ${trimmedChars} characters hidden for terminal readability] ...\n\n${end}`;
  }

  private formatLogEntry(entry: PromptLogEntry): string {
    const separator = '-'.repeat(60);
    let logText = `\n${separator}\n`;
    logText += `[${entry.timestamp}] [AI_${entry.type}] [${entry.service}]\n`;
    
    if (entry.metadata) {
      logText += `Metadata: ${JSON.stringify(entry.metadata, null, 2)}\n`;
    }
    
    if (entry.prompt) {
      logText += `\n--- PROMPT ---\n`;
      logText += this.trimContent(entry.prompt);
      logText += `\n--- END PROMPT ---\n`;
    }
    
    if (entry.response) {
      logText += `\n--- RESPONSE ---\n`;
      logText += this.trimContent(entry.response);
      logText += `\n--- END RESPONSE ---\n`;
    }
    
    if (entry.error) {
      logText += `\n--- ERROR ---\n`;
      logText += entry.error;
      logText += `\n--- END ERROR ---\n`;
    }
    
    logText += `${separator}\n`;
    return logText;
  }

  private writeToLog(content: string): void {
    try {
      // Skip file logging in production (Vercel) due to read-only filesystem
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        // In production, only log to console
        console.log('[AIPromptLogger]', content);
        return;
      }
      
      fs.appendFileSync(this.logFile, content, 'utf8');
    } catch (error) {
      console.error('[AIPromptLogger] Failed to write to log file:', error);
    }
  }

  logXMLPrompt(service: string, xmlContent: string, metadata?: Record<string, any>): void {
    const entry: PromptLogEntry = {
      timestamp: this.formatTimestamp(),
      type: 'XML_PROMPT',
      service,
      prompt: this.trimContent(xmlContent, 3000), // More aggressive trimming for XML prompts
      metadata
    };
    
    this.writeToLog(this.formatLogEntry(entry));
  }

  logAPIRequest(service: string, request: any, metadata?: Record<string, any>): void {
    const entry: PromptLogEntry = {
      timestamp: this.formatTimestamp(),
      type: 'API_REQUEST',
      service,
      prompt: typeof request === 'string' ? request : JSON.stringify(request, null, 2),
      metadata
    };
    
    this.writeToLog(this.formatLogEntry(entry));
  }

  logAPIResponse(service: string, response: any, metadata?: Record<string, any>): void {
    const entry: PromptLogEntry = {
      timestamp: this.formatTimestamp(),
      type: 'API_RESPONSE',
      service,
      response: typeof response === 'string' ? response : JSON.stringify(response, null, 2),
      metadata
    };
    
    this.writeToLog(this.formatLogEntry(entry));
  }

  logError(service: string, error: any, context?: string): void {
    const entry: PromptLogEntry = {
      timestamp: this.formatTimestamp(),
      type: 'API_REQUEST',
      service,
      error: error instanceof Error ? error.message : String(error),
      metadata: { context }
    };
    
    this.writeToLog(this.formatLogEntry(entry));
  }

  logPromptChain(service: string, systemPrompt: string, userPrompt: string, metadata?: Record<string, any>): void {
    const entry: PromptLogEntry = {
      timestamp: this.formatTimestamp(),
      type: 'API_REQUEST',
      service,
      prompt: `SYSTEM:\n${this.trimContent(systemPrompt, 1500)}\n\nUSER:\n${this.trimContent(userPrompt, 1500)}`,
      metadata
    };
    
    this.writeToLog(this.formatLogEntry(entry));
  }
}

export const aiPromptLogger = AIPromptLogger.getInstance();