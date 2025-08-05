import { NextRequest, NextResponse } from 'next/server';
import { searchSchoolsOptimized, searchSchools } from '@/app/ai-experience/lib/schooldigger';

// Force this API route to be dynamic since it uses request.url for query params
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const state = searchParams.get('st') || searchParams.get('state');
    const city = searchParams.get('city');
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '15');
    const optimized = searchParams.get('optimized') !== 'false'; // Default to optimized search
    
    // Advanced search options
    const enableFuzzySearch = searchParams.get('fuzzy') !== 'false';
    const enableGeographicSearch = searchParams.get('geographic') !== 'false';
    const includeTestScores = searchParams.get('includeTestScores') === 'true';
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, name, rating

    // Common single-letter prefixes that should allow search
    const allowedSingleCharPrefixes = ['w', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'l', 'm', 'n', 'p', 'r', 's', 't'];
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }
    
    const trimmedQuery = query.trim().toLowerCase();
    
    // Allow single character searches for common prefixes
    if (trimmedQuery.length === 1 && !allowedSingleCharPrefixes.includes(trimmedQuery)) {
      return NextResponse.json(
        { error: 'Single character searches are only allowed for common city prefixes' },
        { status: 400 }
      );
    }
    
    if (trimmedQuery.length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    console.log('[API] Enhanced school search request:', { 
      query, 
      state, 
      city, 
      level, 
      limit, 
      optimized,
      enableFuzzySearch,
      enableGeographicSearch,
      includeTestScores,
      sortBy
    });

    if (optimized) {
      // Use new optimized search with enhanced data and advanced options
      console.log('[API] Using advanced optimized search algorithm');
      
      // Build search query with additional context
      let enhancedQuery = query.trim();
      if (city && !enhancedQuery.toLowerCase().includes(city.toLowerCase())) {
        enhancedQuery += ` ${city}`;
      }
      if (level && !enhancedQuery.toLowerCase().includes(level.toLowerCase())) {
        enhancedQuery += ` ${level}`;
      }

      const schools = await searchSchoolsOptimized(enhancedQuery, state || undefined, {
        maxResults: limit * 2, // Get more results for better filtering
        enableFuzzySearch,
        enableGeographicSearch
      });

      // Apply additional filtering if specified
      let filteredSchools = schools;
      
      // Filter by school level if specified
      if (level) {
        const levelLower = level.toLowerCase();
        filteredSchools = filteredSchools.filter(school => {
          const schoolLevel = school.level.toLowerCase();
          return schoolLevel.includes(levelLower) || 
                 (levelLower === 'elementary' && schoolLevel.includes('elem')) ||
                 (levelLower === 'middle' && (schoolLevel.includes('middle') || schoolLevel.includes('jr'))) ||
                 (levelLower === 'high' && (schoolLevel.includes('high') || schoolLevel.includes('sr')));
        });
      }

      // Filter by city if specified and not already in query
      if (city && !query.toLowerCase().includes(city.toLowerCase())) {
        filteredSchools = filteredSchools.filter(school => 
          school.city.toLowerCase().includes(city.toLowerCase())
        );
      }

      // Apply sorting
      if (sortBy === 'name') {
        filteredSchools.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'rating') {
        filteredSchools.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      // Default is relevance which is already sorted by the search algorithm

      const finalResults = filteredSchools.slice(0, limit);
      
      console.log('[API] Advanced search pipeline:', {
        totalFound: schools.length,
        afterFiltering: filteredSchools.length,
        finalResults: finalResults.length
      });
      
      // Enhanced logging for debugging city searches
      if (query.length <= 3) {
        console.log('[API] Short query search - Top 5 results with scores:');
        finalResults.slice(0, 5).forEach((school, index) => {
          console.log(`[API] ${index + 1}. ${school.name} (${school.city}, ${school.state})`, {
            relevanceScore: school.relevanceScore?.toFixed(1),
            searchSource: school.searchSource,
            level: school.level
          });
        });
      }
      
      return NextResponse.json({ 
        schoolMatches: finalResults,
        searchType: 'advanced-optimized',
        searchMetrics: {
          originalQuery: query,
          enhancedQuery,
          totalFound: schools.length,
          afterFiltering: filteredSchools.length,
          finalResults: finalResults.length,
          strategies: finalResults.map(s => s.searchSource).filter(Boolean),
          avgRelevanceScore: finalResults.reduce((acc, s) => acc + (s.relevanceScore || 0), 0) / finalResults.length
        },
        searchOptions: {
          enableFuzzySearch,
          enableGeographicSearch,
          includeTestScores,
          sortBy,
          appliedFilters: {
            state: !!state,
            city: !!city,
            level: !!level
          }
        }
      });
    } else {
      // Use legacy search for backward compatibility
      console.log('[API] Using legacy search for backward compatibility');
      const schools = await searchSchools(query, state || undefined, limit);
      console.log('[API] Returning', schools.length, 'legacy school results');
      return NextResponse.json({ 
        schoolMatches: schools,
        searchType: 'legacy' 
      });
    }
    
  } catch (error) {
    console.error('[API] School search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search schools',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}