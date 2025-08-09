#!/usr/bin/env node

/**
 * Script to geocode all school addresses and save coordinates
 * Run with: npx ts-node scripts/geocode-schools.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface School {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  grades?: string;
  type?: string;
}

interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

// Simple geocoding function for the script
async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Google Maps API key not found in environment variables');
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address
      };
    } else {
      console.error(`Failed to geocode address: ${address} - Status: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error geocoding address: ${address}`, error);
    return null;
  }
}

async function main() {
  console.log('🗺️  Starting school geocoding process...\n');

  // Load comprehensive school data
  const comprehensiveDataPath = path.join(process.cwd(), 'comprehensive-data-cleanup.js');
  let comprehensiveAddresses: Record<string, any> = {};

  try {
    const fileContent = fs.readFileSync(comprehensiveDataPath, 'utf8');
    const match = fileContent.match(/const comprehensiveAddresses = ({[\s\S]*?});/);
    if (match) {
      // Parse the JavaScript object
      eval(`comprehensiveAddresses = ${match[1]}`);
    }
  } catch (error) {
    console.error('Error loading comprehensive addresses:', error);
  }

  // Load current school index
  const indexPath = path.join(process.cwd(), 'public/schools/brand-safe-marketing-index.json');
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const schools: School[] = indexData.schools || [];

  console.log(`📊 Found ${schools.length} schools to process\n`);

  // Process each school
  let processed = 0;
  let geocoded = 0;
  let failed = 0;

  for (const school of schools) {
    processed++;
    
    // Skip if already has coordinates
    if (school.lat && school.lng) {
      console.log(`✅ ${school.name} - Already has coordinates`);
      continue;
    }

    // Get full address from comprehensive data if available
    const comprehensiveData = comprehensiveAddresses[school.id];
    if (comprehensiveData && comprehensiveData.address) {
      school.address = comprehensiveData.address;
      school.phone = comprehensiveData.phone;
      school.email = comprehensiveData.email;
      school.website = comprehensiveData.website;
      school.grades = comprehensiveData.grades;
    }

    // Build full address for geocoding
    let fullAddress = '';
    if (school.address) {
      fullAddress = school.address;
      if (school.city && school.state) {
        fullAddress += `, ${school.city}, ${school.state}`;
      }
      if (school.zipCode) {
        fullAddress += ` ${school.zipCode}`;
      }
    } else if (school.city && school.state) {
      // Fall back to city/state if no street address
      fullAddress = `${school.name}, ${school.city}, ${school.state}`;
    } else {
      console.log(`⚠️  ${school.name} - No address information available`);
      failed++;
      continue;
    }

    console.log(`🔍 Geocoding ${school.name}...`);
    console.log(`   Address: ${fullAddress}`);

    const result = await geocodeAddress(fullAddress);
    
    if (result) {
      school.lat = result.lat;
      school.lng = result.lng;
      geocoded++;
      console.log(`   ✅ Success: ${result.lat}, ${result.lng}`);
      console.log(`   📍 Formatted: ${result.formattedAddress}\n`);
    } else {
      failed++;
      console.log(`   ❌ Failed to geocode\n`);
    }

    // Add delay to respect Google's rate limits (50 requests per second)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Save updated school data
  const updatedPath = path.join(process.cwd(), 'public/schools/schools-with-coordinates.json');
  fs.writeFileSync(updatedPath, JSON.stringify(schools, null, 2));

  // Also update the main index file
  fs.writeFileSync(indexPath, JSON.stringify(schools, null, 2));

  console.log('\n📊 Geocoding Summary:');
  console.log(`   Total schools: ${schools.length}`);
  console.log(`   Already had coordinates: ${schools.length - geocoded - failed}`);
  console.log(`   Successfully geocoded: ${geocoded}`);
  console.log(`   Failed to geocode: ${failed}`);
  console.log(`\n✅ Updated school data saved to:`);
  console.log(`   - ${indexPath}`);
  console.log(`   - ${updatedPath}`);
}

// Run the script
main().catch(console.error);