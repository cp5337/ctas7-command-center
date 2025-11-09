#!/usr/bin/env node
/**
 * Upload Synaptix Status Reports to Google Workspace
 * Creates Google Slides quad charts and Google Sheets tracking
 * 
 * Prerequisites:
 * - npm install googleapis
 * - Google service account credentials
 * - GOOGLE_APPLICATION_CREDENTIALS env var set
 */

const fs = require('fs').promises;
const path = require('path');

console.log('📤 UPLOADING TO GOOGLE WORKSPACE');
console.log('=' .repeat(80));
console.log('');

// Configuration
const REPORT_DIR = '/Users/cp5337/Developer/ctas7-command-center/reports';
const DATE_STAMP = new Date().toISOString().split('T')[0];
const GOOGLE_FOLDER_NAME = 'Synaptix Status Reports';

/**
 * Check if googleapis is installed
 */
async function checkGoogleApis() {
  try {
    require('googleapis');
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize Google APIs
 */
async function initializeGoogleApis() {
  console.log('🔐 Initializing Google APIs...');
  
  // Check if googleapis is installed
  const hasGoogleApis = await checkGoogleApis();
  if (!hasGoogleApis) {
    console.log('  ❌ googleapis not installed');
    console.log('     Run: npm install googleapis');
    return null;
  }
  
  const { google } = require('googleapis');
  
  // Check credentials
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credsPath) {
    console.log('  ❌ GOOGLE_APPLICATION_CREDENTIALS not set');
    console.log('');
    console.log('  Setup instructions:');
    console.log('  1. Go to: https://console.cloud.google.com');
    console.log('  2. Create/select project');
    console.log('  3. Enable APIs: Drive, Slides, Sheets');
    console.log('  4. Create Service Account');
    console.log('  5. Download JSON credentials');
    console.log('  6. Set: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/creds.json');
    console.log('');
    return null;
  }
  
  try {
    await fs.access(credsPath);
    console.log('  ✅ Credentials found');
  } catch {
    console.log(`  ❌ Credentials file not found: ${credsPath}`);
    return null;
  }
  
  // Initialize auth
  const auth = new google.auth.GoogleAuth({
    keyFile: credsPath,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/presentations'
    ]
  });
  
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });
  const slides = google.slides({ version: 'v1', auth });
  
  console.log('  ✅ Google APIs initialized');
  console.log('');
  
  return { google, auth, drive, sheets, slides };
}

/**
 * Find or create Google Drive folder
 */
async function findOrCreateFolder(drive, folderName) {
  console.log(`📁 Finding/creating folder: ${folderName}...`);
  
  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive'
  });
  
  if (response.data.files.length > 0) {
    const folderId = response.data.files[0].id;
    console.log(`  ✅ Found existing folder: ${folderId}`);
    return folderId;
  }
  
  // Create new folder
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  
  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id'
  });
  
  console.log(`  ✅ Created new folder: ${folder.data.id}`);
  return folder.data.id;
}

/**
 * Create date-specific subfolder
 */
async function createDateFolder(drive, parentFolderId, date) {
  console.log(`📁 Creating date folder: ${date}...`);
  
  const fileMetadata = {
    name: date,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId]
  };
  
  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id'
  });
  
  console.log(`  ✅ Created: ${folder.data.id}`);
  return folder.data.id;
}

/**
 * Upload CSV to Google Sheets
 */
async function uploadCsvToSheets(drive, sheets, csvPath, title, folderId) {
  console.log(`📊 Uploading CSV to Sheets: ${title}...`);
  
  // Read CSV data
  const csvData = await fs.readFile(csvPath, 'utf-8');
  const rows = csvData.split('\n').map(row => row.split(','));
  
  // Create spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: title
      },
      sheets: [{
        properties: {
          title: 'Data'
        }
      }]
    }
  });
  
  const spreadsheetId = spreadsheet.data.spreadsheetId;
  
  // Populate data
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: 'Data!A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: rows
    }
  });
  
  // Format header row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    requestBody: {
      requests: [{
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.145, green: 0.388, blue: 0.922 }, // Synaptix blue
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 12,
                bold: true
              }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      }]
    }
  });
  
  // Move to folder
  await drive.files.update({
    fileId: spreadsheetId,
    addParents: folderId,
    fields: 'id, parents'
  });
  
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  console.log(`  ✅ Created: ${url}`);
  
  return { spreadsheetId, url };
}

/**
 * Create Google Slides quad chart
 */
async function createSlidesQuadChart(drive, slides, data, folderId) {
  console.log('📊 Creating Google Slides quad chart...');
  
  // Create presentation
  const presentation = await slides.presentations.create({
    requestBody: {
      title: `Synaptix Quad Chart - ${DATE_STAMP}`
    }
  });
  
  const presentationId = presentation.data.presentationId;
  const slideId = presentation.data.slides[0].objectId;
  
  // Create quad chart layout
  const requests = [
    // Title
    {
      createShape: {
        objectId: 'title',
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 720, unit: 'EMU' }, height: { magnitude: 80, unit: 'EMU' } },
          transform: { scaleX: 5000, scaleY: 5000, translateX: 360000, translateY: 50000, unit: 'EMU' }
        }
      }
    },
    {
      insertText: {
        objectId: 'title',
        text: '🚀 SYNAPTIX STRATEGIC INITIATIVES',
        insertionIndex: 0
      }
    },
    {
      updateTextStyle: {
        objectId: 'title',
        style: {
          fontSize: { magnitude: 32, unit: 'PT' },
          bold: true,
          foregroundColor: { opaqueColor: { rgbColor: { red: 0.118, green: 0.161, blue: 0.235 } } }
        },
        fields: 'fontSize,bold,foregroundColor'
      }
    },
    
    // Core Infrastructure (top-left)
    {
      createShape: {
        objectId: 'quad1',
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 3200000, unit: 'EMU' }, height: { magnitude: 2800000, unit: 'EMU' } },
          transform: { translateX: 400000, translateY: 1200000, unit: 'EMU' }
        }
      }
    },
    {
      updateShapeProperties: {
        objectId: 'quad1',
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } }
          },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: { red: 0.145, green: 0.388, blue: 0.922 } } } },
            weight: { magnitude: 3, unit: 'PT' }
          }
        },
        fields: 'shapeBackgroundFill,outline'
      }
    },
    {
      insertText: {
        objectId: 'quad1',
        text: '🏗️ Core Infrastructure\n\nStatus: 🟡 In Progress\nProgress: 45%\n\n• Containerization: 40%\n• Service Mesh: 60%\n• Memory Fabric: 30%\n\nOwner: Marcus Chen',
        insertionIndex: 0
      }
    },
    
    // Agent Coordination (top-right)
    {
      createShape: {
        objectId: 'quad2',
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 3200000, unit: 'EMU' }, height: { magnitude: 2800000, unit: 'EMU' } },
          transform: { translateX: 3700000, translateY: 1200000, unit: 'EMU' }
        }
      }
    },
    {
      updateShapeProperties: {
        objectId: 'quad2',
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } }
          },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: { red: 0.145, green: 0.388, blue: 0.922 } } } },
            weight: { magnitude: 3, unit: 'PT' }
          }
        },
        fields: 'shapeBackgroundFill,outline'
      }
    },
    {
      insertText: {
        objectId: 'quad2',
        text: `🤖 Agent Coordination\n\nStatus: 🟢 Operational\nProgress: 65%\n\n• gRPC Mesh: Ready\n• PM2 Agents: ${data.pm2.online}/13\n• Slack: Active\n\nOwner: Natasha Volkov`,
        insertionIndex: 0
      }
    },
    
    // Primary Interfaces (bottom-left)
    {
      createShape: {
        objectId: 'quad3',
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 3200000, unit: 'EMU' }, height: { magnitude: 2800000, unit: 'EMU' } },
          transform: { translateX: 400000, translateY: 4100000, unit: 'EMU' }
        }
      }
    },
    {
      updateShapeProperties: {
        objectId: 'quad3',
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } }
          },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: { red: 0.145, green: 0.388, blue: 0.922 } } } },
            weight: { magnitude: 3, unit: 'PT' }
          }
        },
        fields: 'shapeBackgroundFill,outline'
      }
    },
    {
      insertText: {
        objectId: 'quad3',
        text: '🎨 Primary Interfaces\n\nStatus: 🟡 In Progress\nProgress: 55%\n\n• Main Ops: 70%\n• Voice Interface: 80%\n• Command Center: 50%\n\nOwner: Cove Harris',
        insertionIndex: 0
      }
    },
    
    // Universal Execution (bottom-right)
    {
      createShape: {
        objectId: 'quad4',
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 3200000, unit: 'EMU' }, height: { magnitude: 2800000, unit: 'EMU' } },
          transform: { translateX: 3700000, translateY: 4100000, unit: 'EMU' }
        }
      }
    },
    {
      updateShapeProperties: {
        objectId: 'quad4',
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } }
          },
          outline: {
            outlineFill: { solidFill: { color: { rgbColor: { red: 0.145, green: 0.388, blue: 0.922 } } } },
            weight: { magnitude: 3, unit: 'PT' }
          }
        },
        fields: 'shapeBackgroundFill,outline'
      }
    },
    {
      insertText: {
        objectId: 'quad4',
        text: '⚡ Universal Execution\n\nStatus: 🔴 Planning\nProgress: 20%\n\n• TTL Framework: 15%\n• PTCC System: 25%\n• Layer 2: 20%\n\nOwner: Elena Rodriguez',
        insertionIndex: 0
      }
    }
  ];
  
  // Apply all requests
  await slides.presentations.batchUpdate({
    presentationId: presentationId,
    requestBody: { requests }
  });
  
  // Move to folder
  await drive.files.update({
    fileId: presentationId,
    addParents: folderId,
    fields: 'id, parents'
  });
  
  const url = `https://docs.google.com/presentation/d/${presentationId}`;
  console.log(`  ✅ Created: ${url}`);
  
  return { presentationId, url };
}

/**
 * Main execution
 */
async function main() {
  try {
    // Initialize Google APIs
    const apis = await initializeGoogleApis();
    
    if (!apis) {
      console.log('');
      console.log('⚠️  Cannot proceed without Google Workspace credentials');
      console.log('');
      console.log('📋 ALTERNATIVE: Manual Upload');
      console.log('   1. Go to drive.google.com');
      console.log('   2. Create folder: "Synaptix Status Reports"');
      console.log('   3. Create subfolder: ' + DATE_STAMP);
      console.log('   4. Upload files from: ' + REPORT_DIR);
      console.log('   5. Right-click CSV → Open with → Google Sheets');
      console.log('   6. Copy/paste HTML quad chart content into Google Slides');
      console.log('');
      process.exit(1);
    }
    
    const { drive, sheets, slides } = apis;
    
    // Load report data
    const dataPath = path.join(REPORT_DIR, `${DATE_STAMP}_data.json`);
    const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
    
    // Find or create main folder
    const mainFolderId = await findOrCreateFolder(drive, GOOGLE_FOLDER_NAME);
    
    // Create date subfolder
    const dateFolderId = await createDateFolder(drive, mainFolderId, DATE_STAMP);
    
    console.log('');
    
    // Upload services CSV
    const servicesSheet = await uploadCsvToSheets(
      drive,
      sheets,
      path.join(REPORT_DIR, `${DATE_STAMP}_services.csv`),
      `Synaptix Services - ${DATE_STAMP}`,
      dateFolderId
    );
    
    // Upload initiatives CSV
    const initiativesSheet = await uploadCsvToSheets(
      drive,
      sheets,
      path.join(REPORT_DIR, `${DATE_STAMP}_initiatives.csv`),
      `Synaptix Initiatives - ${DATE_STAMP}`,
      dateFolderId
    );
    
    // Create quad chart slides
    const quadSlides = await createSlidesQuadChart(drive, slides, data, dateFolderId);
    
    console.log('');
    console.log('=' .repeat(80));
    console.log('✅ UPLOAD COMPLETE!');
    console.log('');
    console.log('📂 Google Drive Folder:');
    console.log(`   https://drive.google.com/drive/folders/${dateFolderId}`);
    console.log('');
    console.log('📊 Google Sheets:');
    console.log(`   Services: ${servicesSheet.url}`);
    console.log(`   Initiatives: ${initiativesSheet.url}`);
    console.log('');
    console.log('🎨 Google Slides:');
    console.log(`   Quad Chart: ${quadSlides.url}`);
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('   1. Open links above to view in Google Workspace');
    console.log('   2. Share folder with stakeholders');
    console.log('   3. Customize Slides branding if needed');
    console.log('   4. Set up automatic weekly regeneration');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   API Response:', error.response.data);
    }
    process.exit(1);
  }
}

main();

