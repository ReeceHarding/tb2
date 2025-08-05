const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

console.log('🔧 Fixing remaining non-anonymized names...');

const dataDir = '/Users/reeceharding/ship-fast-ts-3 copy/public/data/raw_data/';

// Read the name mapping
const mappingData = JSON.parse(fs.readFileSync(path.join(dataDir, 'name_mapping.json'), 'utf8'));
const nameMapping = new Map(Object.entries(mappingData.students));

// Create case-insensitive mapping for remaining names
const caseInsensitiveMapping = new Map();
for (const [originalName, anonName] of nameMapping) {
    caseInsensitiveMapping.set(originalName.toLowerCase(), anonName);
}

// Specific problematic names we need to fix
const problematicNames = [
    "D'sean Harden II",
    "Roman-Parker Davis",
    "Roman-parker Davis",  // Different case variations
    "d'sean harden ii",
    "ROMAN-PARKER DAVIS"
];

console.log('🔍 Problematic names to fix:', problematicNames);

// Helper function to find anonymous name
function findAnonymousName(name) {
    if (!name || typeof name !== 'string') return null;
    
    // Try exact match first
    if (nameMapping.has(name)) {
        return nameMapping.get(name);
    }
    
    // Try case-insensitive match
    const lowerName = name.toLowerCase();
    if (caseInsensitiveMapping.has(lowerName)) {
        return caseInsensitiveMapping.get(lowerName);
    }
    
    // Try common variations
    const variations = [
        name,
        name.toLowerCase(),
        name.toUpperCase(),
        name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '), // Title Case
        name.replace(/'/g, "'"), // Different apostrophe types
        name.replace(/'/g, "'")
    ];
    
    for (const variation of variations) {
        if (nameMapping.has(variation)) {
            return nameMapping.get(variation);
        }
        if (caseInsensitiveMapping.has(variation.toLowerCase())) {
            return caseInsensitiveMapping.get(variation.toLowerCase());
        }
    }
    
    return null;
}

// All CSV files to process
const csvFiles = [
    'Accuracy_by_Campus,__1753464206375.csv',
    'Active_Test_Assignme_1753464222092.csv',
    'Age_Grade_vs._Lowest_1753464223974.csv',
    'All_Metrics_1753464090176.csv',
    'App_roster_1753464033225.csv',
    'AssessmentResults.csv',
    'ClassAssignments.csv',
    'Essential_Lessons_Ma_1753464190277.csv',
    'Essential_Lessons_Ma_1753464193408.csv',
    'Essential_Lessons_Ma_1753464195758.csv',
    'Essential_Lessons_Ma_1753464209093.csv',
    'Estimated_Waste_1753464054094.csv',
    'Grade_Gap!_Age_Grade_1753464230127.csv',
    'Knowledge_Grade_comp_1753464031026.csv',
    'Learning_Metrics_per_1753464025980.csv',
    'Lessons_1753464080260.csv',
    'Lessons_mastered_and_1753464019244.csv',
    'Minutes!Session_by_C_1753464203876.csv',
    'Sessions_1753464085392.csv',
    'Spring 2024-2025  MAP Snapshot - ModelSpring2425.csv',
    'StudentsBySchool.csv',
    'Time_Commitment_1753464042725.csv'
];

// Fix names in a single file
async function fixNamesInFile(filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(dataDir, filename);
        
        console.log(`\n🔧 Fixing remaining names in ${filename}...`);
        
        if (!fs.existsSync(filepath)) {
            console.log(`⚠️  File not found: ${filename}`);
            resolve();
            return;
        }
        
        const rows = [];
        let headers = [];
        let fixedCount = 0;
        
        fs.createReadStream(filepath)
            .pipe(csv())
            .on('headers', (headerList) => {
                headers = headerList;
            })
            .on('data', (row) => {
                let rowFixed = false;
                
                // Check all columns for names that need fixing
                for (const [column, value] of Object.entries(row)) {
                    if (value && typeof value === 'string') {
                        const anonName = findAnonymousName(value);
                        if (anonName && !value.startsWith('Anon#')) {
                            console.log(`   🔄 Fixed: ${value} → ${anonName} in column "${column}"`);
                            row[column] = anonName;
                            rowFixed = true;
                        }
                    }
                }
                
                if (rowFixed) fixedCount++;
                rows.push(row);
            })
            .on('end', () => {
                if (fixedCount > 0) {
                    // Write the fixed data back
                    const csvWriter = createCsvWriter({
                        path: filepath,
                        header: headers.map(h => ({ id: h, title: h }))
                    });
                    
                    csvWriter.writeRecords(rows)
                        .then(() => {
                            console.log(`✅ Fixed ${fixedCount} names in ${filename}`);
                            resolve();
                        })
                        .catch(reject);
                } else {
                    console.log(`✅ No additional names needed fixing in ${filename}`);
                    resolve();
                }
            })
            .on('error', reject);
    });
}

// Main execution function
async function main() {
    try {
        console.log('🚀 Starting fix for remaining names...\n');
        
        let totalFixed = 0;
        
        // Fix all files
        for (const filename of csvFiles) {
            await fixNamesInFile(filename);
        }
        
        console.log('\n🎉 Name fixing complete!');
        
    } catch (error) {
        console.error('❌ Error during name fixing:', error);
        process.exit(1);
    }
}

// Run the script
main();