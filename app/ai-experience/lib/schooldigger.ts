/**
 * SchoolDigger API Integration - High Performance Search Implementation
 */

const SCHOOLDIGGER_BASE_URL = 'https://api.schooldigger.com';
const SCHOOLDIGGER_VERSION = 'v2.3';

interface SchoolDiggerConfig {
  appId: string;
  appKey: string;
}

// Get credentials from environment variables
export function getSchoolDiggerConfig(): SchoolDiggerConfig {
  const appId = process.env.SCHOOLDIGGER_APP_ID;
  const appKey = process.env.SCHOOLDIGGER_API_KEY;
  
  if (!appId || !appKey) {
    throw new Error('SchoolDigger credentials not configured. Please set SCHOOLDIGGER_APP_ID and SCHOOLDIGGER_API_KEY in .env.local');
  }
  
  return { appId, appKey };
}

// Enhanced interfaces following the performance guide
export interface SchoolTestScores {
  satReading?: number;
  satMath?: number;
  satTotal?: number;
  satTestTakers?: number;
  stateReading?: number;
  stateMath?: number;
  stateScience?: number;
  year?: string;
  trend?: 'improving' | 'declining' | 'stable';
}

export interface SchoolData {
  id: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  phone?: string;
  level: 'Elementary' | 'Middle' | 'High' | 'K-12';
  grades?: string;
  testScores: SchoolTestScores;
  rating: number;
  rank: number;
  rankTotal: number;
  enrollment?: number;
  studentTeacherRatio?: number;
  isCharter: boolean;
  isPrivate: boolean;
  isMagnet: boolean;
  searchSource?: string;
  relevanceScore?: number;
}

// Legacy interfaces for backward compatibility
export interface SchoolAutocompleteMatch {
  schoolid: string;
  schoolName: string;
  city: string;
  state: string;
  zip: string;
  schoolLevel: string;
  lowGrade: string;
  highGrade: string;
  latitude: number;
  longitude: number;
  rank?: number;
  rankOf?: number;
  rankStars?: number;
}

export interface SchoolAutocompleteResponse {
  schoolMatches: SchoolAutocompleteMatch[];
}

// School detail types (legacy - for backward compatibility)
export interface SchoolDetail {
  schoolid: string;
  schoolName: string;
  phone?: string;
  url?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    stateFull: string;
    zip: string;
  };
  lowGrade: string;
  highGrade: string;
  schoolLevel: string;
  isCharterSchool?: string;
  isMagnetSchool?: string;
  district?: {
    districtID: string;
    districtName: string;
  };
  rankHistory?: Array<{
    year: number;
    rank?: number;
    rankOf?: number;
    rankStars?: number;
    rankStatewidePercentage?: number;
  }>;
  testScores?: Array<{
    test: string;
    subject: string;
    year: number;
    grade: string;
    schoolTestScore?: {
      percentMetStandard?: number;
    };
    districtTestScore?: {
      percentMetStandard?: number;
    };
    stateTestScore?: {
      percentMetStandard?: number;
    };
  }>;
  schoolYearlyDetails?: Array<{
    year: number;
    numberOfStudents?: number;
    percentFreeDiscLunch?: number;
    pupilTeacherRatio?: number;
  }>;
}

// API Cache Implementation
interface CacheEntry {
  data: any;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes - Longer cache to reduce API calls

// Rate limiting implementation - Updated for PAID PLAN
// BASIC Plan: 2,000 calls per month = ~66 calls per day = ~1 call per minute sustained
// PRO/ENTERPRISE: Much higher limits available
// Conservative rate limiting to ensure we don't hit API limits
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window  
const RATE_LIMIT_MAX_CALLS = parseInt(process.env.SCHOOLDIGGER_RATE_LIMIT_PER_MINUTE || '20'); // Configurable via env var
const RATE_LIMIT_DELAY = parseInt(process.env.SCHOOLDIGGER_RATE_DELAY_MS || '100'); // 100ms delay between individual calls within batch

// Log current rate limiting configuration
console.log(`[SchoolDigger] Rate limiting configured: ${RATE_LIMIT_MAX_CALLS} calls per minute, ${RATE_LIMIT_DELAY}ms delay between calls`);
let apiCallTimestamps: number[] = [];
let lastApiCallTime = 0;

// Rate limiting function
async function enforceRateLimit() {
  const now = Date.now();
  
  // Remove timestamps older than the rate limit window
  apiCallTimestamps = apiCallTimestamps.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  // Check if we're at the rate limit
  if (apiCallTimestamps.length >= RATE_LIMIT_MAX_CALLS) {
    const oldestCall = apiCallTimestamps[0];
    const waitTime = RATE_LIMIT_WINDOW - (now - oldestCall);
    
    console.log(`[SchoolDigger] Rate limit reached. Waiting ${waitTime}ms before next API call`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Add minimum delay between calls
  const timeSinceLastCall = now - lastApiCallTime;
  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastCall));
  }
  
  // Record this API call
  apiCallTimestamps.push(Date.now());
  lastApiCallTime = Date.now();
}

// Utility Functions
function normalizeSchoolLevel(level: string): 'Elementary' | 'Middle' | 'High' | 'K-12' {
  if (!level) return 'K-12';
  const normalized = level.toLowerCase();
  if (normalized.includes('elem') || normalized.includes('primary')) return 'Elementary';
  if (normalized.includes('middle') || normalized.includes('junior')) return 'Middle';  
  if (normalized.includes('high') || normalized.includes('senior')) return 'High';
  return 'K-12';
}

// Data Extraction Function - Handle API field variations
export function extractSchoolData(rawSchool: any): SchoolData {
  console.log('[SchoolDigger] Extracting data for school:', rawSchool.schoolName || rawSchool.name);
  
  // Handle API field variations
  const schoolName = rawSchool.schoolName || 
                    rawSchool.name || 
                    rawSchool.school_name || 
                    'Unknown School';
                    
  const city = rawSchool.city || 
               rawSchool.location?.city || 
               rawSchool.address?.city ||
               'Unknown City';
               
  const state = rawSchool.state || 
                rawSchool.st || 
                rawSchool.location?.state || 
                rawSchool.address?.state ||
                'Unknown State';

  // Extract test scores with fallbacks
  const testScores: SchoolTestScores = {
    satReading: rawSchool.avgSatReading || 
               rawSchool.sat?.reading || 
               rawSchool.testScores?.satReading,
               
    satMath: rawSchool.avgSatMath || 
            rawSchool.sat?.math || 
            rawSchool.testScores?.satMath,
            
    satTotal: rawSchool.avgSatTotal || 
             rawSchool.sat?.total || 
             (rawSchool.avgSatReading && rawSchool.avgSatMath ? 
              rawSchool.avgSatReading + rawSchool.avgSatMath : undefined),
              
    stateReading: rawSchool.stateTestProficiency?.reading || 
                 rawSchool.forwardExam?.reading || 
                 rawSchool.proficiency?.ela,
                 
    stateMath: rawSchool.stateTestProficiency?.math || 
              rawSchool.forwardExam?.math || 
              rawSchool.proficiency?.math,
              
    year: rawSchool.testScoreYear || 
          rawSchool.academicYear || 
          new Date().getFullYear().toString()
  };

  // Build grades string
  const grades = rawSchool.lowGrade && rawSchool.highGrade ? 
    `${rawSchool.lowGrade}-${rawSchool.highGrade}` : 
    rawSchool.grades || 'K-12';

  return {
    id: rawSchool.schoolid || rawSchool.id || rawSchool.schoolId || '',
    name: schoolName,
    city,
    state,
    address: rawSchool.address?.street || rawSchool.street || undefined,
    phone: rawSchool.phone || rawSchool.phoneNumber || undefined,
    level: normalizeSchoolLevel(rawSchool.schoolLevel || rawSchool.level),
    grades,
    testScores,
    rating: rawSchool.schoolDiggerRating || rawSchool.rating || rawSchool.rankStars || 0,
    rank: rawSchool.schoolDiggerRank || rawSchool.rank || 0,
    rankTotal: rawSchool.schoolDiggerRankOf || rawSchool.rankOf || rawSchool.totalSchools || 0,
    enrollment: rawSchool.enrollment || rawSchool.numberOfStudents || rawSchool.studentCount,
    studentTeacherRatio: rawSchool.studentTeacherRatio || rawSchool.pupilTeacherRatio || rawSchool.str,
    isCharter: rawSchool.isCharter || rawSchool.charter || rawSchool.isCharterSchool === 'Yes' || false,
    isPrivate: rawSchool.isPrivate || rawSchool.private || rawSchool.schoolType === 'Private' || false,
    isMagnet: rawSchool.isMagnet || rawSchool.magnet || rawSchool.isMagnetSchool === 'Yes' || false
  };
}

// API Call with Caching
async function makeApiCallCached(endpoint: string, params: Record<string, string>) {
  const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
  const cached = apiCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('[SchoolDigger] Cache hit for:', cacheKey);
    return cached.data;
  }
  
  const config = getSchoolDiggerConfig();
  const apiParams = new URLSearchParams({
    ...params,
    appID: config.appId,
    appKey: config.appKey,
  });
  
  console.log('[SchoolDigger] API call to:', endpoint, 'with params:', params);
  
  // Enforce rate limiting before making the actual API call
  await enforceRateLimit();
  
  const response = await fetch(`${SCHOOLDIGGER_BASE_URL}/${SCHOOLDIGGER_VERSION}${endpoint}?${apiParams}`);
  
  if (!response.ok) {
    console.error('[SchoolDigger] API error:', response.status, response.statusText);
    
    // Try to get more detailed error information
    let errorDetails = '';
    try {
      const errorBody = await response.text();
      errorDetails = errorBody ? ` - Details: ${errorBody}` : '';
      console.error('[SchoolDigger] Error response body:', errorBody);
    } catch (e) {
      console.error('[SchoolDigger] Could not read error response body');
    }
    
    // Provide specific error messages for common issues
    let errorMessage = `SchoolDigger API error: ${response.status}${errorDetails}`;
    if (response.status === 400) {
      errorMessage += ' - Bad Request: Check API parameters and query format';
    } else if (response.status === 401) {
      errorMessage += ' - Unauthorized: Check API credentials (SCHOOLDIGGER_APP_ID and SCHOOLDIGGER_API_KEY)';
    } else if (response.status === 403) {
      errorMessage += ' - Forbidden: API key may not have access to this endpoint or region';
    } else if (response.status === 429) {
      errorMessage += ' - Rate limit exceeded: Too many requests';
    }
    
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  apiCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}

// Legacy function for backward compatibility - now uses advanced algorithm
// function combineAndRankResults(parallelResults: any[]): SchoolData[] {
//   console.log('[SchoolDigger] Using legacy combineAndRankResults - delegating to advanced algorithm');
  
//   // For legacy compatibility, use a default query for ranking
//   return combineAndRankResultsAdvanced(parallelResults, 'school search').slice(0, 10);
// }

// Enhanced Search Utilities for Industry Best Practices
function calculateStringDistance(str1: string, str2: string): number {
  // Levenshtein distance for fuzzy matching
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function calculateTextSimilarity(query: string, text: string): number {
  console.log(`[calculateTextSimilarity] Comparing query: "${query}" with text: "${text}"`);
  
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase().trim();
  
  // Exact match gets highest score
  if (textLower === queryLower) {
    console.log(`[calculateTextSimilarity] Exact match: 100`);
    return 100;
  }
  
  // CRITICAL: "Starts with" matching gets very high priority
  if (textLower.startsWith(queryLower)) {
    const startsWithScore = 95 - (textLower.length - queryLower.length) * 0.5;
    console.log(`[calculateTextSimilarity] Text starts with query! Score: ${startsWithScore}`);
    return Math.max(startsWithScore, 85); // Minimum 85 for starts-with matches
  }
  
  // Check if any word in the text starts with the query
  const textWords = textLower.split(/\s+/);
  for (const word of textWords) {
    if (word.startsWith(queryLower)) {
      const wordStartScore = 80 - (word.length - queryLower.length) * 0.5;
      console.log(`[calculateTextSimilarity] Word "${word}" starts with query! Score: ${wordStartScore}`);
      return Math.max(wordStartScore, 70); // Minimum 70 for word starts-with
    }
  }
  
  // Tokenize query and text for better partial matching
  const queryTokens = tokenizeSearchText(queryLower);
  const textTokens = tokenizeSearchText(textLower);
  
  console.log(`[calculateTextSimilarity] Query tokens: [${queryTokens.join(', ')}]`);
  console.log(`[calculateTextSimilarity] Text tokens: [${textTokens.join(', ')}]`);
  
  // Calculate token-based matching score
  let exactMatches = 0;
  let partialMatches = 0;
  let totalQueryTokens = queryTokens.length;
  
  // CRITICAL BUG FIX: Handle empty token arrays to prevent NaN
  if (totalQueryTokens === 0) {
    console.log(`[calculateTextSimilarity] No valid query tokens found, returning 0 score`);
    return 0;
  }
  
  for (const queryToken of queryTokens) {
    let bestMatch = 0;
    
    for (const textToken of textTokens) {
      if (textToken === queryToken) {
        // Exact token match
        exactMatches++;
        bestMatch = 1;
        console.log(`[calculateTextSimilarity] Exact token match: "${queryToken}"`);
        break;
      } else if (textToken.includes(queryToken) || queryToken.includes(textToken)) {
        // Partial token match
        const similarity = Math.max(queryToken.length, textToken.length) / 
                          Math.min(queryToken.length, textToken.length);
        bestMatch = Math.max(bestMatch, 0.7 * similarity);
        console.log(`[calculateTextSimilarity] Partial token match: "${queryToken}" ~ "${textToken}" (${(bestMatch * 100).toFixed(1)}%)`);
      } else {
        // Fuzzy matching for typos
        const distance = calculateStringDistance(queryToken, textToken);
        const maxLength = Math.max(queryToken.length, textToken.length);
        const similarity = ((maxLength - distance) / maxLength);
        
        if (similarity > 0.7) { // 70% similarity threshold
          bestMatch = Math.max(bestMatch, 0.5 * similarity);
          console.log(`[calculateTextSimilarity] Fuzzy token match: "${queryToken}" ~ "${textToken}" (${(similarity * 100).toFixed(1)}%)`);
        }
      }
    }
    
    if (bestMatch < 1 && bestMatch > 0) {
      partialMatches++;
    }
  }
  
  // Calculate final score based on token matches (now safe from division by zero)
  const exactScore = (exactMatches / totalQueryTokens) * 100;
  const partialScore = (partialMatches / totalQueryTokens) * 60;
  const finalScore = exactScore + partialScore;
  
  console.log(`[calculateTextSimilarity] Exact matches: ${exactMatches}/${totalQueryTokens}, Partial: ${partialMatches}, Score: ${finalScore}`);
  
  return Math.min(finalScore, 100); // Cap at 100
}

// Helper function to tokenize search text with common normalizations
function tokenizeSearchText(text: string): string[] {
  // Normalize common abbreviations and variations
  const normalized = text
    .replace(/\belem\b|\belementary\b/g, 'elementary')
    .replace(/\bmiddle\b|\bjr\b|\bjunior\b/g, 'middle')
    .replace(/\bhigh\b|\bsr\b|\bsenior\b/g, 'high')
    .replace(/\bst\b/g, 'saint')
    .replace(/\bmt\b/g, 'mount')
    .replace(/\bsch\b|\bschool\b/g, '')
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Split into tokens and filter out short/common words
  const stopWords = new Set(['the', 'of', 'for', 'at', 'in', 'on', 'and', 'or']);
  return normalized
    .split(/\s+/)
    .filter(token => token.length > 1 && !stopWords.has(token))
    .map(token => token.toLowerCase());
}

// extractSearchTerms function removed - no longer used in optimized sequential search

function calculateRelevanceScore(school: SchoolData, query: string, searchSource: string): number {
  console.log(`[SchoolDigger] ====== Calculating relevance for ${school.name} (${school.city}, ${school.state}) from ${searchSource} ======`);
  
  let score = 0;
  const queryLower = query.toLowerCase().trim();
  
  // Parse query into geographic and school name components
  const queryComponents = parseQueryComponents(queryLower);
  console.log(`[SchoolDigger] Query components:`, queryComponents);
  
  // Enhanced name matching (40% base weight, but can be boosted)
  const nameScore = calculateTextSimilarity(queryComponents.schoolTerms, school.name);
  let nameWeight = isNaN(nameScore) ? 0 : nameScore * 0.4;
  score += nameWeight;
  console.log(`[SchoolDigger] Name score: ${nameScore} * 0.4 = ${nameWeight}`);
  
  // City matching (30% weight if city is in query, with boosts for perfect matches)
  let cityWeight = 0;
  let cityScore = 0;
  
  // ENHANCED: Check if query could be a city prefix even if not detected as a city component
  const queryWords = queryLower.split(/\s+/);
  const firstWord = queryWords[0];
  
  // Calculate city score for detected city OR for potential city prefix
  if (queryComponents.city) {
    cityScore = calculateTextSimilarity(queryComponents.city, school.city);
    cityWeight = isNaN(cityScore) ? 0 : cityScore * 0.3;
    score += cityWeight;
    console.log(`[SchoolDigger] City score (detected): ${cityScore} * 0.3 = ${cityWeight}`);
  } else if (firstWord && firstWord.length >= 2) {
    // Check if the first word could be a city prefix
    const potentialCityScore = calculateTextSimilarity(firstWord, school.city);
    if (!isNaN(potentialCityScore) && potentialCityScore >= 70) { // High score indicates likely city match
      cityScore = potentialCityScore;
      cityWeight = cityScore * 0.35; // Give even more weight to undetected city matches
      score += cityWeight;
      console.log(`[SchoolDigger] Potential city prefix match! "${firstWord}" -> "${school.city}" Score: ${cityScore} * 0.35 = ${cityWeight}`);
    }
  }
  
  // State matching (20% weight if state is in query)
  let stateWeight = 0;
  if (queryComponents.state) {
    const stateScore = calculateTextSimilarity(queryComponents.state, school.state);
    stateWeight = isNaN(stateScore) ? 0 : stateScore * 0.2;
    score += stateWeight;
    console.log(`[SchoolDigger] State score: ${stateScore} * 0.2 = ${stateWeight}`);
  }
  
  // CRITICAL IMPROVEMENT: Combined city+name bonus for local school searches
  if (queryComponents.city && cityScore > 80 && nameScore > 50) {
    const localBonus = 25; // Significant bonus for local schools with name match
    score += localBonus;
    console.log(`[SchoolDigger] Local school bonus (city match + name match): ${localBonus}`);
  }
  
  // SUPER BOOST: If city starts with query, give massive bonus
  if (firstWord && school.city.toLowerCase().startsWith(firstWord)) {
    const startsWithBonus = 40; // Huge bonus for city prefix matches
    score += startsWithBonus;
    console.log(`[SchoolDigger] CITY STARTS WITH QUERY BONUS! "${school.city}" starts with "${firstWord}": +${startsWithBonus}`);
  }
  
  // School level matching bonus (exact level matches get significant boost)
  let levelBonus = 0;
  if (queryLower.includes('elementary') && school.level === 'Elementary') levelBonus = 15;
  if (queryLower.includes('middle') && school.level === 'Middle') levelBonus = 15;
  if (queryLower.includes('high') && school.level === 'High') levelBonus = 15;
  score += levelBonus;
  if (levelBonus > 0) {
    console.log(`[SchoolDigger] Level bonus: ${levelBonus}`);
  }
  
  // Geographic proximity bonus (if both city and state match)
  let geoBonus = 0;
  if (queryComponents.city && queryComponents.state && cityWeight > 20 && stateWeight > 15) {
    geoBonus = 20; // Strong geographic match
    score += geoBonus;
    console.log(`[SchoolDigger] Geographic proximity bonus: ${geoBonus}`);
  }
  
  // Data quality bonus (scaled down to be less influential)
  let qualityBonus = 0;
  if (school.testScores.satTotal || school.testScores.stateReading) qualityBonus += 8;
  if (school.rating >= 8) qualityBonus += 6;
  if (school.enrollment && school.enrollment > 100) qualityBonus += 3;
  score += qualityBonus;
  if (qualityBonus > 0) {
    console.log(`[SchoolDigger] Data quality bonus: ${qualityBonus}`);
  }
  
  // Source priority bonus (reduced impact)
  const sourceBonuses: Record<string, number> = {
    'city-specific': 25,  // Highest priority for city-specific matches
    'last-word-city': 22, // High priority for last word as city pattern
    'full-query': 20,     // Good priority for full query matches
    'first-word-city': 18, // Medium-high for first word as city
    'exact-match': 15,
    'autocomplete': 12,
    'city-search': 8,
    'fuzzy-search': 6,
    'broad-search': 3
  };
  const sourceBonus = sourceBonuses[searchSource] || 0;
  score += sourceBonus;
  if (sourceBonus > 0) {
    console.log(`[SchoolDigger] Source bonus (${searchSource}): ${sourceBonus}`);
  }
  
  // CRITICAL BUG FIX: Defensive check to prevent NaN values from propagating
  if (isNaN(score) || !isFinite(score)) {
    console.log(`[SchoolDigger] WARNING: Score calculation resulted in ${score}, returning 0 instead`);
    return 0;
  }
  
  console.log(`[SchoolDigger] FINAL SCORE for ${school.name}: ${score.toFixed(1)} (name: ${nameWeight.toFixed(1)}, city: ${cityWeight.toFixed(1)}, state: ${stateWeight.toFixed(1)}, level: ${levelBonus}, geo: ${geoBonus}, quality: ${qualityBonus}, source: ${sourceBonus})`);
  return score;
}

// Helper function to parse query into components
function parseQueryComponents(query: string): {
  schoolTerms: string;
  city?: string;
  state?: string;
} {
  console.log(`[parseQueryComponents] Parsing query: "${query}"`);
  
  // Common US states and their abbreviations
  const statePatterns = new Map([
    ['wisconsin', 'wi'], ['california', 'ca'], ['texas', 'tx'], ['florida', 'fl'],
    ['new york', 'ny'], ['pennsylvania', 'pa'], ['illinois', 'il'], ['ohio', 'oh'],
    ['georgia', 'ga'], ['north carolina', 'nc'], ['michigan', 'mi'], ['new jersey', 'nj'],
    ['virginia', 'va'], ['washington', 'wa'], ['arizona', 'az'], ['massachusetts', 'ma'],
    ['tennessee', 'tn'], ['indiana', 'in'], ['missouri', 'mo'], ['maryland', 'md'],
    ['minnesota', 'mn'], ['colorado', 'co'], ['alabama', 'al'], ['louisiana', 'la'],
    ['kentucky', 'ky'], ['oregon', 'or'], ['oklahoma', 'ok'], ['connecticut', 'ct'],
    ['iowa', 'ia'], ['mississippi', 'ms'], ['arkansas', 'ar'], ['kansas', 'ks'],
    ['utah', 'ut'], ['nevada', 'nv'], ['new mexico', 'nm'], ['west virginia', 'wv'],
    ['nebraska', 'ne'], ['idaho', 'id'], ['hawaii', 'hi'], ['new hampshire', 'nh'],
    ['maine', 'me'], ['montana', 'mt'], ['rhode island', 'ri'], ['delaware', 'de'],
    ['south dakota', 'sd'], ['north dakota', 'nd'], ['alaska', 'ak'], ['vermont', 'vt'],
    ['wyoming', 'wy']
  ]);
  
  let remainingQuery = query;
  let state: string | undefined;
  let city: string | undefined;
  
  // Extract state (check both full names and abbreviations)
  const stateEntries = Array.from(statePatterns.entries());
  for (const [fullName, abbrev] of stateEntries) {
    // Check for state at the end of query with comma or just space
    const stateRegex = new RegExp(`[,\\s]+${fullName}$|[,\\s]+${abbrev}$`, 'i');
    const match = remainingQuery.match(stateRegex);
    if (match) {
      state = fullName;
      remainingQuery = remainingQuery.replace(stateRegex, '').trim();
      break;
    }
  }
  
  // Check if query contains explicit city separator (comma)
  const commaIndex = remainingQuery.indexOf(',');
  if (commaIndex > -1) {
    // Format: "School Name, City"
    const beforeComma = remainingQuery.substring(0, commaIndex).trim();
    const afterComma = remainingQuery.substring(commaIndex + 1).trim();
    
    // If after comma looks like a city (not a school keyword), extract it
    const schoolKeywords = ['elementary', 'middle', 'high', 'school', 'academy', 'institute'];
    const isSchoolKeyword = schoolKeywords.some(keyword => 
      afterComma.toLowerCase().includes(keyword)
    );
    
    if (!isSchoolKeyword && afterComma.length > 0) {
      city = afterComma;
      remainingQuery = beforeComma;
    }
  }
  
  // NEW: If no city was found, check if the last word could be a city name
  if (!city) {
    const words = remainingQuery.split(/\s+/);
    if (words.length > 1) {
      const lastWord = words[words.length - 1];
      
      // Common city indicators - if the last word doesn't look like a school term,
      // it might be a city name
      const schoolTermIndicators = ['school', 'elementary', 'middle', 'high', 'academy', 
                                    'institute', 'center', 'campus', 'prep', 'charter'];
      
      // Common direction/position words that are often part of school names
      const directionWords = ['north', 'south', 'east', 'west', 'central', 'upper', 'lower',
                              'new', 'old', 'greater', 'metro', 'downtown'];
      
      const lastWordLower = lastWord.toLowerCase();
      const isLikelySchoolTerm = schoolTermIndicators.some(term => 
        lastWordLower.includes(term)
      );
      
      const isDirectionWord = directionWords.includes(lastWordLower);
      
      // If the last word is 3+ characters and doesn't look like a school term or direction,
      // treat it as a potential city
      if (lastWord.length >= 3 && !isLikelySchoolTerm && !isDirectionWord) {
        city = lastWord;
        remainingQuery = words.slice(0, -1).join(' ');
        console.log(`[parseQueryComponents] Detected potential city at end: "${city}"`);
      }
    }
  }
  
  // What's left should be school terms
  const schoolTerms = remainingQuery.replace(/\s+/g, ' ').trim();
  
  console.log(`[parseQueryComponents] Result: schoolTerms="${schoolTerms}", city="${city}", state="${state}"`);
  return { schoolTerms, city, state };
}

// Advanced Search Strategy Implementation
// Old SearchStrategy interface - REMOVED
// Sequential search approach no longer uses strategy pattern

// Optimized Parallel Search Strategy - Reduces API calls from 8 to 2-3 smart strategies
function createOptimizedStrategies(query: string, state?: string): Array<{
  name: string;
  priority: number;
  execute: () => Promise<{ results: SchoolData[]; source: string; priority: number }>;
}> {
  const queryComponents = parseQueryComponents(query);
  const words = query.toLowerCase().trim().split(/\s+/);
  const strategies = [];
  
  console.log('[SchoolDigger] Creating optimized strategies for query:', query);
  
  // STRATEGY 1: Smart Autocomplete (Always included - fastest and most comprehensive)
  strategies.push({
    name: 'smart-autocomplete',
    priority: 30,
    execute: async () => {
      console.log('[SchoolDigger] Executing Smart Autocomplete strategy');
      try {
        const data = await makeApiCallCached('/autocomplete/schools', {
          q: query,
          qSearchCityStateName: 'true', // Include city/state in search
          ...(state && { st: state }),
          returnCount: '20'
        });
        
        const results = (data.schoolMatches || []).map(extractSchoolData);
        console.log(`[SchoolDigger] Smart Autocomplete found ${results.length} results`);
        
        return {
          results,
          source: 'smart-autocomplete',
          priority: 30
        };
      } catch (error) {
        console.error('[SchoolDigger] Smart Autocomplete failed:', error);
        return { results: [], source: 'smart-autocomplete', priority: 30 };
      }
    }
  });
  
  // STRATEGY 2: Intelligent Targeted Search (Based on query structure)
  if (queryComponents.city) {
    // City detected - use city-specific search
    strategies.push({
      name: 'city-specific',
      priority: 25,
      execute: async () => {
        console.log(`[SchoolDigger] Executing City-Specific search: q="${queryComponents.schoolTerms}", city="${queryComponents.city}"`);
        try {
          const data = await makeApiCallCached('/schools', {
            q: queryComponents.schoolTerms,
            city: queryComponents.city,
            ...(state && { st: state }),
            perPage: '15',
            sortBy: 'rank'
          });
          
          const results = (data.schoolList || []).map(extractSchoolData);
          console.log(`[SchoolDigger] City-Specific found ${results.length} results`);
          
          return {
            results,
            source: 'city-specific',
            priority: 25
          };
        } catch (error) {
          console.error('[SchoolDigger] City-Specific search failed:', error);
          return { results: [], source: 'city-specific', priority: 25 };
        }
      }
    });
  } else if (words.length >= 2) {
    // Multi-word query - try last word as city (common pattern)
    const lastWord = words[words.length - 1];
    const schoolTerms = words.slice(0, -1).join(' ');
    
    strategies.push({
      name: 'last-word-city',
      priority: 22,
      execute: async () => {
        console.log(`[SchoolDigger] Executing Last-Word-City search: q="${schoolTerms}", city="${lastWord}"`);
        try {
          const data = await makeApiCallCached('/schools', {
            q: schoolTerms,
            city: lastWord,
            ...(state && { st: state }),
            perPage: '15'
          });
          
          const results = (data.schoolList || []).map(extractSchoolData);
          console.log(`[SchoolDigger] Last-Word-City found ${results.length} results`);
          
          return {
            results,
            source: 'last-word-city',
            priority: 22
          };
        } catch (error) {
          console.error('[SchoolDigger] Last-Word-City search failed:', error);
          return { results: [], source: 'last-word-city', priority: 22 };
        }
      }
    });
  } else {
    // Single word or simple query - use exact name search
    strategies.push({
      name: 'exact-name',
      priority: 20,
      execute: async () => {
        console.log('[SchoolDigger] Executing Exact Name search');
        try {
          const data = await makeApiCallCached('/schools', {
            q: query,
            qSearchSchoolNameOnly: 'true',
            ...(state && { st: state }),
            perPage: '15',
            sortBy: 'schoolname'
          });
          
          const results = (data.schoolList || []).map(extractSchoolData);
          console.log(`[SchoolDigger] Exact Name found ${results.length} results`);
          
          return {
            results,
            source: 'exact-name',
            priority: 20
          };
        } catch (error) {
          console.error('[SchoolDigger] Exact Name search failed:', error);
          return { results: [], source: 'exact-name', priority: 20 };
        }
      }
    });
  }
  
  console.log(`[SchoolDigger] Created ${strategies.length} optimized strategies:`, strategies.map(s => s.name));
  return strategies;
}

async function executeOptimizedSearch(query: string, state?: string, options: {
  maxResults?: number;
  enableFuzzySearch?: boolean;
  enableGeographicSearch?: boolean;
} = {}): Promise<SchoolData[]> {
  const { maxResults = 15 } = options;
  
  console.log('[SchoolDigger] Starting optimized parallel search for:', query);
  
  // Create smart strategies (2-3 max based on query)
  const strategies = createOptimizedStrategies(query, state);
  
  // Execute strategies in parallel (much faster than sequential)
  console.log(`[SchoolDigger] Executing ${strategies.length} strategies in parallel`);
  const searchPromises = strategies.map(strategy => strategy.execute());
  const searchResults = await Promise.all(searchPromises);
  
  // Combine and rank results with advanced algorithm
  return rankAndLimitResults(searchResults, query, maxResults);
}

// Enhanced result combination for parallel results
function rankAndLimitResults(parallelResults: Array<{ results: SchoolData[]; source: string; priority: number }>, originalQuery: string, maxResults: number): SchoolData[] {
  console.log('[SchoolDigger] Ranking results from', parallelResults.length, 'parallel strategies');
  
  const seenSchools = new Map<string, SchoolData>();
  
  // Process results from all strategies
  parallelResults
    .filter(result => result.results.length > 0)
    .sort((a, b) => b.priority - a.priority) // Process higher priority sources first
    .forEach(({ results, source }) => {
      console.log('[SchoolDigger] Processing', results.length, 'results from', source);
      
      results.forEach((school: SchoolData) => {
        const schoolKey = `${school.name.toLowerCase().trim()}-${school.city.toLowerCase().trim()}-${school.state.toLowerCase().trim()}`;
        
        // Calculate relevance score for this result
        const relevanceScore = calculateRelevanceScore(school, originalQuery, source);
        
        // Only include schools with decent relevance scores
        if (relevanceScore < 10) {
          return;
        }
        
        const existingSchool = seenSchools.get(schoolKey);
        
        if (!existingSchool || relevanceScore > (existingSchool.relevanceScore || 0)) {
          // Keep the version with higher relevance score
          seenSchools.set(schoolKey, {
            ...school,
            searchSource: source,
            relevanceScore
          });
        }
      });
    });
  
  // Convert to array and sort by relevance
  const finalResults = Array.from(seenSchools.values())
    .filter(school => (school.relevanceScore || 0) > 10) // Filter low-relevance results
    .sort((a, b) => {
      // Primary sort: relevance score
      if (b.relevanceScore !== a.relevanceScore) {
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      }
      
      // Secondary sort: rating and ranking
      const aQuality = (a.rating || 0) * 10 + (a.rank ? (1000 - a.rank) / 100 : 0);
      const bQuality = (b.rating || 0) * 10 + (b.rank ? (1000 - b.rank) / 100 : 0);
      return bQuality - aQuality;
    })
    .slice(0, maxResults);
  
  console.log(`[SchoolDigger] Returning ${finalResults.length} ranked results`);
  finalResults.forEach((school, index) => {
    console.log(`[SchoolDigger] ${index + 1}. ${school.name} (${school.city}, ${school.state}) - Score: ${school.relevanceScore?.toFixed(1)} - Source: ${school.searchSource}`);
  });
  
  return finalResults;
}

// Old duplicate function removed - using the enhanced parallel version above

// Old parallel ranking function - REMOVED
// This function has been replaced by rankAndLimitResults() in the sequential approach

// High-Performance Optimized Parallel Search Implementation - 2-3 Smart Strategies
export async function searchSchoolsOptimized(query: string, state?: string, options: {
  maxResults?: number;
  enableFuzzySearch?: boolean;
  enableGeographicSearch?: boolean;
} = {}): Promise<SchoolData[]> {
  if (!query.trim() || query.length < 2) {
    console.log('[SchoolDigger] Query too short, returning empty results');
    return [];
  }
  
  const {
    maxResults = 15,
    enableFuzzySearch = true,
    enableGeographicSearch = true
  } = options;
  
  console.log('[SchoolDigger] Starting optimized parallel search for:', query.trim());
  console.log('[SchoolDigger] Search options:', { state, maxResults, enableFuzzySearch, enableGeographicSearch });
  
  try {
    const startTime = performance.now();
    
    // Use the new optimized parallel search algorithm (2-3 strategies max)
    const results = await executeOptimizedSearch(query.trim(), state, {
      maxResults,
      enableFuzzySearch,
      enableGeographicSearch
    });
    
    const endTime = performance.now();
    console.log(`[SchoolDigger] Optimized parallel search completed in ${(endTime - startTime).toFixed(2)}ms`);
    
    return results;
    
  } catch (error) {
    console.error('[SchoolDigger] Optimized parallel search error:', error);
    return [];
  }
}

/**
 * Legacy search function for backward compatibility
 */
export async function searchSchools(
  query: string,
  state?: string,
  limit: number = 10
): Promise<SchoolAutocompleteMatch[]> {
  try {
    console.log('[SchoolDigger] Legacy search for:', query, 'with limit:', limit);
    
    // Use the new advanced search algorithm
    const optimizedResults = await searchSchoolsOptimized(query, state, { 
      maxResults: limit * 2, // Get more results to ensure we have enough after filtering
      enableFuzzySearch: true,
      enableGeographicSearch: true
    });
    
    // Convert back to legacy format with enhanced data
    const legacyResults = optimizedResults.slice(0, limit).map(school => ({
      schoolid: school.id,
      schoolName: school.name,
      city: school.city,
      state: school.state,
      zip: '', // Legacy format doesn't have zip in our enhanced data
      schoolLevel: school.level,
      lowGrade: school.grades?.split('-')[0] || 'K',
      highGrade: school.grades?.split('-')[1] || '12',
      latitude: 0, // Legacy format - coordinates not used in current implementation
      longitude: 0,
      rank: school.rank,
      rankOf: school.rankTotal,
      rankStars: school.rating
    }));
    
    console.log('[SchoolDigger] Legacy search returning', legacyResults.length, 'results');
    return legacyResults;
  } catch (error) {
    console.error('[SchoolDigger] Legacy search error:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific school (enhanced)
 */
export async function getSchoolDetailsOptimized(schoolId: string): Promise<SchoolData> {
  try {
    console.log('[SchoolDigger] Fetching optimized details for school:', schoolId);
    const data = await makeApiCallCached(`/schools/${schoolId}`, {});
    return extractSchoolData(data);
  } catch (error) {
    console.error('[SchoolDigger] Get optimized details error:', error);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function getSchoolDetails(schoolId: string): Promise<SchoolDetail> {
  try {
    console.log('[SchoolDigger] Legacy get details for school:', schoolId);
    const data = await makeApiCallCached(`/schools/${schoolId}`, {});
    return data;
  } catch (error) {
    console.error('[SchoolDigger] Legacy get details error:', error);
    throw error;
  }
}

/**
 * Format test scores for display
 */
export function formatTestScoreDisplay(school: SchoolData): string {
  const scores = [];
  
  if (school.testScores.satTotal) {
    scores.push(`SAT: ${school.testScores.satTotal}`);
  }
  if (school.testScores.stateReading) {
    scores.push(`Reading: ${school.testScores.stateReading}%`);
  }
  if (school.testScores.stateMath) {
    scores.push(`Math: ${school.testScores.stateMath}%`);
  }
  
  return scores.length > 0 ? scores.join(' | ') : 'Test scores not available';
}

/**
 * Enhanced school summary formatting
 */
export function formatSchoolSummary(school: SchoolDetail | SchoolData): string {
  const parts = [];
  
  if ('schoolName' in school) {
    // Legacy SchoolDetail format
  parts.push(`${school.schoolName} (${school.schoolLevel})`);
  parts.push(`Grades ${school.lowGrade}-${school.highGrade}`);
  parts.push(`${school.address.city}, ${school.address.state}`);
  
  const latestRank = school.rankHistory?.[0];
  if (latestRank && latestRank.rank && latestRank.rankOf) {
    parts.push(`Ranked ${latestRank.rank} of ${latestRank.rankOf} (${latestRank.rankStars} stars)`);
    if (latestRank.rankStatewidePercentage) {
      parts.push(`Top ${(100 - latestRank.rankStatewidePercentage).toFixed(1)}% in state`);
    }
  }
  
  const latestDetails = school.schoolYearlyDetails?.[0];
  if (latestDetails) {
    if (latestDetails.numberOfStudents) {
      parts.push(`${latestDetails.numberOfStudents} students`);
    }
    if (latestDetails.pupilTeacherRatio) {
      parts.push(`${latestDetails.pupilTeacherRatio}:1 student/teacher ratio`);
      }
    }
  } else {
    // New SchoolData format
    parts.push(`${school.name} (${school.level})`);
    if (school.grades) {
      parts.push(`Grades ${school.grades}`);
    }
    parts.push(`${school.city}, ${school.state}`);
    
    if (school.rank && school.rankTotal) {
      parts.push(`Ranked ${school.rank} of ${school.rankTotal} (${school.rating} stars)`);
      const percentile = ((school.rankTotal - school.rank) / school.rankTotal) * 100;
      parts.push(`Top ${percentile.toFixed(1)}% in state`);
    }
    
    if (school.enrollment) {
      parts.push(`${school.enrollment} students`);
    }
    if (school.studentTeacherRatio) {
      parts.push(`${school.studentTeacherRatio}:1 student/teacher ratio`);
    }
  }
  
  return parts.join(' • ');
}

/**
 * Get key performance metrics for AI context (enhanced)
 */
export function getSchoolMetrics(school: SchoolDetail | SchoolData) {
  if ('schoolName' in school) {
    // Legacy format - use existing logic
  const latestRank = school.rankHistory?.[0];
  const latestDetails = school.schoolYearlyDetails?.[0];
  
  const testScoresBySubject: Record<string, any> = {};
  school.testScores?.forEach(score => {
    const key = `${score.subject}_${score.grade}`;
    if (!testScoresBySubject[key] || score.year > testScoresBySubject[key].year) {
      testScoresBySubject[key] = score;
    }
  });
  
  return {
    ranking: latestRank ? {
      rank: latestRank.rank,
      outOf: latestRank.rankOf,
      stars: latestRank.rankStars,
      percentile: latestRank.rankStatewidePercentage ? 100 - latestRank.rankStatewidePercentage : null
    } : null,
    
    demographics: latestDetails ? {
      totalStudents: latestDetails.numberOfStudents,
      studentTeacherRatio: latestDetails.pupilTeacherRatio,
      percentFreeReducedLunch: latestDetails.percentFreeDiscLunch
    } : null,
    
    testScores: Object.values(testScoresBySubject).map(score => ({
      subject: score.subject,
      grade: score.grade,
      year: score.year,
      schoolProficiency: score.schoolTestScore?.percentMetStandard,
      districtProficiency: score.districtTestScore?.percentMetStandard,
      stateProficiency: score.stateTestScore?.percentMetStandard
    }))
  };
  } else {
    // New format - enhanced metrics
    return {
      ranking: school.rank ? {
        rank: school.rank,
        outOf: school.rankTotal,
        stars: school.rating,
        percentile: school.rankTotal ? ((school.rankTotal - school.rank) / school.rankTotal) * 100 : null
      } : null,
      
      demographics: {
        totalStudents: school.enrollment,
        studentTeacherRatio: school.studentTeacherRatio,
        isCharter: school.isCharter,
        isPrivate: school.isPrivate,
        isMagnet: school.isMagnet
      },
      
      testScores: {
        sat: {
          total: school.testScores.satTotal,
          reading: school.testScores.satReading,
          math: school.testScores.satMath,
          testTakers: school.testScores.satTestTakers
        },
        state: {
          reading: school.testScores.stateReading,
          math: school.testScores.stateMath,
          science: school.testScores.stateScience
        },
        year: school.testScores.year,
        trend: school.testScores.trend
      }
    };
  }
}
