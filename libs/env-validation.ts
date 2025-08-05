/**
 * Environment Variable Validation Utility
 * Validates required environment variables at application startup
 */

interface EnvValidationRule {
  key: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  validator?: (value: string) => boolean;
  dependsOn?: string[];
}

const ENV_VALIDATION_RULES: EnvValidationRule[] = [
  // Core NextJS/NextAuth Configuration
  {
    key: 'NEXTAUTH_URL',
    required: true,
    description: 'NextAuth base URL for authentication'
  },
  {
    key: 'NEXTAUTH_SECRET',
    required: true,
    description: 'NextAuth secret for JWT encryption'
  },

  // OAuth Configuration
  {
    key: 'GOOGLE_ID',
    required: true,
    description: 'Google OAuth client ID'
  },
  {
    key: 'GOOGLE_SECRET',
    required: true,
    description: 'Google OAuth client secret'
  },

  // Supabase Configuration (Public)
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    validator: (value) => value.includes('.supabase.co') || value.includes('localhost')
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key'
  },

  // Supabase Configuration (Server)
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    required: false,
    description: 'Supabase service role key for admin operations'
  },

  // AI Services (AWS Bedrock for Claude)
  {
    key: 'AWS_ACCESS_KEY_ID',
    required: true,
    description: 'AWS Access Key ID for Bedrock Claude API',
    validator: (value) => value.startsWith('AKIA')
  },
  {
    key: 'AWS_SECRET_ACCESS_KEY',
    required: true,
    description: 'AWS Secret Access Key for Bedrock Claude API',
    validator: (value) => value.length >= 20
  },
  {
    key: 'AWS_REGION',
    required: false,
    description: 'AWS Region for Bedrock (defaults to us-east-1)',
    validator: (value) => /^[a-z0-9-]+$/.test(value)
  },

  // External APIs
  {
    key: 'SCHOOLDIGGER_APP_ID',
    required: true,
    description: 'SchoolDigger API application ID'
  },
  {
    key: 'SCHOOLDIGGER_API_KEY',
    required: true,
    description: 'SchoolDigger API key'
  },
  {
    key: 'GENDER_API_KEY',
    required: false,
    description: 'Gender API key for name-based gender detection'
  },

  // Database (Optional for Magic Links)
  {
    key: 'MONGODB_URI',
    required: false,
    description: 'MongoDB connection string for Magic Links and user storage',
    validator: (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://')
  },

  // Payment (Optional)
  {
    key: 'STRIPE_PUBLIC_KEY',
    required: false,
    description: 'Stripe publishable key for payments'
  },
  {
    key: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe secret key for payments'
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    description: 'Stripe webhook secret for payment verification',
    dependsOn: ['STRIPE_SECRET_KEY']
  },

  // Email (Optional)
  {
    key: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for transactional emails'
  }
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  invalidValues: string[];
}

export function validateEnvironmentVariables(): ValidationResult {
  console.log('[EnvValidation] Starting environment variable validation...');
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];
  const invalidValues: string[] = [];

  ENV_VALIDATION_RULES.forEach(rule => {
    const value = process.env[rule.key];
    
    if (!value) {
      if (rule.required) {
        const error = `Missing required environment variable: ${rule.key}`;
        errors.push(error);
        missingRequired.push(rule.key);
        console.error(`[EnvValidation] ❌ ${error} - ${rule.description}`);
      } else {
        const warning = `Optional environment variable not set: ${rule.key}`;
        warnings.push(warning);
        console.warn(`[EnvValidation] ⚠️ ${warning} - ${rule.description}`);
      }
      return;
    }

    // Validate value format if validator is provided
    if (rule.validator && !rule.validator(value)) {
      const error = `Invalid format for environment variable: ${rule.key}`;
      errors.push(error);
      invalidValues.push(rule.key);
      console.error(`[EnvValidation] ❌ ${error} - ${rule.description}`);
      return;
    }

    // Check dependencies
    if (rule.dependsOn) {
      const missingDeps = rule.dependsOn.filter(dep => !process.env[dep]);
      if (missingDeps.length > 0) {
        const error = `Environment variable ${rule.key} requires: ${missingDeps.join(', ')}`;
        errors.push(error);
        console.error(`[EnvValidation] ❌ ${error}`);
        return;
      }
    }

    console.log(`[EnvValidation] ✅ ${rule.key} is valid`);
  });

  const isValid = errors.length === 0;
  
  if (isValid) {
    console.log(`[EnvValidation] ✅ Environment validation completed successfully`);
    if (warnings.length > 0) {
      console.log(`[EnvValidation] Found ${warnings.length} optional variables that could be configured`);
    }
  } else {
    console.error(`[EnvValidation] ❌ Environment validation failed with ${errors.length} errors`);
  }

  return {
    isValid,
    errors,
    warnings,
    missingRequired,
    invalidValues
  };
}

export function getEnvironmentValidationReport(): string {
  const result = validateEnvironmentVariables();
  
  let report = '\n=== ENVIRONMENT CONFIGURATION REPORT ===\n\n';
  
  if (result.isValid) {
    report += '✅ All required environment variables are properly configured!\n\n';
  } else {
    report += '❌ Environment configuration issues found:\n\n';
    
    if (result.missingRequired.length > 0) {
      report += 'MISSING REQUIRED VARIABLES:\n';
      result.missingRequired.forEach(key => {
        const rule = ENV_VALIDATION_RULES.find(r => r.key === key);
        report += `  • ${key}: ${rule?.description || 'Required for application functionality'}\n`;
      });
      report += '\n';
    }
    
    if (result.invalidValues.length > 0) {
      report += 'INVALID VALUES:\n';
      result.invalidValues.forEach(key => {
        const rule = ENV_VALIDATION_RULES.find(r => r.key === key);
        report += `  • ${key}: ${rule?.description || 'Check the format of this value'}\n`;
      });
      report += '\n';
    }
  }
  
  if (result.warnings.length > 0) {
    report += 'OPTIONAL CONFIGURATIONS:\n';
    result.warnings.forEach(warning => {
      const key = warning.split(': ')[1];
      const rule = ENV_VALIDATION_RULES.find(r => r.key === key);
      if (rule) {
        report += `  • ${key}: ${rule.description}\n`;
      }
    });
    report += '\n';
  }
  
  report += 'For setup instructions, see your .env.local.example file.\n';
  report += '==========================================\n';
  
  return report;
}

export function validateOrThrow(): void {
  const result = validateEnvironmentVariables();
  
  if (!result.isValid) {
    const report = getEnvironmentValidationReport();
    console.error(report);
    throw new Error(
      `Environment validation failed! ${result.errors.length} critical issues found. ` +
      `Check the console output above for details.`
    );
  }
}