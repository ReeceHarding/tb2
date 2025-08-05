#!/usr/bin/env ts-node

/**
 * Easy Authentication Setup using OAuth2
 * 
 * This approach is simpler than service accounts - just requires browser login
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as http from 'http';
import * as url from 'url';
import open from 'open';

const FOLDER_ID = '1OGl7MAzktOVbjKozzwcXE63YjJaM0Ulg';
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}`;

// Simple OAuth2 client for demo purposes
const CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
const CLIENT_SECRET = 'your-client-secret';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

async function simpleOAuthFlow() {
  console.log('🚀 Starting Simple OAuth2 Flow...');
  console.log('This will open your browser for Google authentication');
  
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🌐 Opening browser for authentication...');
  console.log('If browser doesn\'t open, visit:', authUrl);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const query = url.parse(req.url!, true).query;
        
        if (query.code) {
          const { tokens } = await oauth2Client.getToken(query.code as string);
          oauth2Client.setCredentials(tokens);

          res.end('✅ Authentication successful! You can close this window.');
          server.close();
          
          // Save tokens for future use
          fs.writeFileSync('./oauth-tokens.json', JSON.stringify(tokens, null, 2));
          console.log('✅ Authentication successful! Tokens saved.');
          
          resolve(oauth2Client);
        } else {
          res.end('❌ Authentication failed');
          server.close();
          reject(new Error('No authorization code received'));
        }
      } catch (error) {
        res.end('❌ Authentication error');
        server.close();
        reject(error);
      }
    });

    server.listen(PORT);
    
    // Open browser
    open(authUrl).catch(() => {
      console.log('Could not open browser automatically. Please visit the URL above manually.');
    });
  });
}

async function testWithSavedTokens() {
  if (!fs.existsSync('./oauth-tokens.json')) {
    return null;
  }

  try {
    const tokens = JSON.parse(fs.readFileSync('./oauth-tokens.json', 'utf8'));
    
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    
    oauth2Client.setCredentials(tokens);
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Test access
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 3
    });

    console.log('✅ Using saved authentication tokens');
    console.log(`📁 Found ${response.data.files?.length || 0} items in folder`);
    
    return oauth2Client;
  } catch (error) {
    console.log('⚠️  Saved tokens expired, need to re-authenticate');
    return null;
  }
}

async function main() {
  console.log('🔑 Easy Google Drive API Authentication\n');

  // Try saved tokens first
  let auth = await testWithSavedTokens();
  
  if (!auth) {
    // Need to authenticate
    console.log('🔐 Authentication required...');
    auth = await simpleOAuthFlow();
  }

  // Test folder access
  console.log('\n🔍 Testing folder access...');
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
      pageSize: 10
    });

    const files = response.data.files || [];
    console.log(`\n✅ Successfully accessed the Google Drive folder!`);
    console.log(`📊 Found ${files.length} school directories:`);
    
    files.forEach((file, index) => {
      const type = file.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄';
      console.log(`  ${index + 1}. ${type} ${file.name}`);
    });

    console.log('\n🎉 Ready to extract all marketing materials!');
    console.log('▶️  Run: npm run extract-drive');
    
  } catch (error: any) {
    console.error('❌ Failed to access folder:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}