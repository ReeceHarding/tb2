const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

console.log('🔍 Starting comprehensive student data anonymization...');
console.log('📁 Target directory: /Users/reeceharding/ship-fast-ts-3 copy/public/data/raw_data/');

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

const dataDir = '/Users/reeceharding/ship-fast-ts-3 copy/public/data/raw_data/';

// Global storage for all unique names and mappings
const uniqueNames = new Set();
const nameMapping = new Map();
const teacherNames = new Set();
const teacherMapping = new Map();

// Helper function to normalize names (handle different formats)
function normalizeName(name) {
    if (!name || typeof name !== 'string') return null;
    
    // Clean the name - remove extra quotes, trim whitespace
    let cleaned = name.replace(/^["']|["']$/g, '').trim();
    
    // Skip empty strings or IDs that look like student IDs (000-xxxx format)
    if (!cleaned || /^\d{3}-\d{4}$/.test(cleaned)) return null;
    
    // Skip teacher-like names (Last, First format)
    if (/^[A-Z][a-z]+,\s+[A-Z][a-z]+$/.test(cleaned)) {
        teacherNames.add(cleaned);
        return null;
    }
    
    // Convert to Title Case for consistency
    cleaned = cleaned.split(' ').map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    
    return cleaned;
}

// Helper function to combine first/last/middle names
function combineNames(first, last, middle = '') {
    if (!first && !last) return null;
    
    const parts = [];
    if (first) parts.push(normalizeName(first));
    if (middle && middle.trim()) parts.push(normalizeName(middle));
    if (last) parts.push(normalizeName(last));
    
    return parts.filter(p => p).join(' ') || null;
}

// Read a single CSV file and extract names
async function extractNamesFromFile(filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(dataDir, filename);
        const names = new Set();
        
        console.log(`📖 Reading ${filename}...`);
        
        if (!fs.existsSync(filepath)) {
            console.log(`⚠️  File not found: ${filename}`);
            resolve(names);
            return;
        }
        
        const stream = fs.createReadStream(filepath)
            .pipe(csv())
            .on('data', (row) => {
                // Extract names from different column formats
                
                // Standard "Student" column
                if (row.Student) {
                    const normalized = normalizeName(row.Student);
                    if (normalized) names.add(normalized);
                }
                
                // "fullname" column (Grade_Gap file)
                if (row.fullname) {
                    const normalized = normalizeName(row.fullname);
                    if (normalized) names.add(normalized);
                }
                
                // Separate name columns (StudentsBySchool.csv)
                if (row.StudentFirstName || row.StudentLastName) {
                    const combined = combineNames(row.StudentFirstName, row.StudentLastName, row.StudentMI);
                    if (combined) names.add(combined);
                }
                
                // Teacher names
                if (row.TeacherName) {
                    const normalized = normalizeName(row.TeacherName);
                    if (normalized && /^[A-Z][a-z]+,\s+[A-Z][a-z]+$/.test(normalized)) {
                        teacherNames.add(normalized);
                    }
                }
            })
            .on('end', () => {
                console.log(`✅ Found ${names.size} unique student names in ${filename}`);
                resolve(names);
            })
            .on('error', (error) => {
                console.error(`❌ Error reading ${filename}:`, error);
                reject(error);
            });
    });
}

// Generate anonymous identifiers
function createAnonymousMapping() {
    console.log('\n🎭 Creating anonymous name mappings...');
    
    const sortedNames = Array.from(uniqueNames).sort();
    const sortedTeachers = Array.from(teacherNames).sort();
    
    // Create student name mappings
    sortedNames.forEach((name, index) => {
        const anonId = `Anon#${String(index + 1).padStart(3, '0')}`;
        nameMapping.set(name, anonId);
        console.log(`🔄 ${name} → ${anonId}`);
    });
    
    // Create teacher name mappings
    sortedTeachers.forEach((name, index) => {
        const anonId = `Teacher#${String(index + 1).padStart(2, '0')}`;
        teacherMapping.set(name, anonId);
        console.log(`👨‍🏫 ${name} → ${anonId}`);
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   • ${nameMapping.size} student names mapped`);
    console.log(`   • ${teacherMapping.size} teacher names mapped`);
}

// Replace names in a single file
async function anonymizeFile(filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(dataDir, filename);
        const backupPath = path.join(dataDir, `backup_${filename}`);
        
        console.log(`\n🔄 Anonymizing ${filename}...`);
        
        if (!fs.existsSync(filepath)) {
            console.log(`⚠️  File not found: ${filename}`);
            resolve();
            return;
        }
        
        // Create backup
        fs.copyFileSync(filepath, backupPath);
        console.log(`💾 Backup created: backup_${filename}`);
        
        const rows = [];
        let headers = [];
        
        fs.createReadStream(filepath)
            .pipe(csv())
            .on('headers', (headerList) => {
                headers = headerList;
            })
            .on('data', (row) => {
                // Replace student names in different columns
                if (row.Student && nameMapping.has(row.Student)) {
                    console.log(`   🔄 Replacing: ${row.Student} → ${nameMapping.get(row.Student)}`);
                    row.Student = nameMapping.get(row.Student);
                }
                
                if (row.fullname && nameMapping.has(row.fullname)) {
                    console.log(`   🔄 Replacing: ${row.fullname} → ${nameMapping.get(row.fullname)}`);
                    row.fullname = nameMapping.get(row.fullname);
                }
                
                // Handle separate name columns
                if (row.StudentFirstName || row.StudentLastName) {
                    const originalCombined = combineNames(row.StudentFirstName, row.StudentLastName, row.StudentMI);
                    if (originalCombined && nameMapping.has(originalCombined)) {
                        const anonName = nameMapping.get(originalCombined);
                        const parts = anonName.split('#');
                        console.log(`   🔄 Replacing: ${originalCombined} → ${anonName}`);
                        row.StudentFirstName = parts[0] + '#' + parts[1];
                        row.StudentLastName = '';
                        row.StudentMI = '';
                    }
                }
                
                // Replace teacher names
                if (row.TeacherName && teacherMapping.has(row.TeacherName)) {
                    console.log(`   👨‍🏫 Replacing teacher: ${row.TeacherName} → ${teacherMapping.get(row.TeacherName)}`);
                    row.TeacherName = teacherMapping.get(row.TeacherName);
                }
                
                rows.push(row);
            })
            .on('end', () => {
                // Write the anonymized data back
                if (rows.length > 0 && headers.length > 0) {
                    const csvWriter = createCsvWriter({
                        path: filepath,
                        header: headers.map(h => ({ id: h, title: h }))
                    });
                    
                    csvWriter.writeRecords(rows)
                        .then(() => {
                            console.log(`✅ Successfully anonymized ${filename}`);
                            resolve();
                        })
                        .catch(reject);
                } else {
                    console.log(`⚠️  No data to write for ${filename}`);
                    resolve();
                }
            })
            .on('error', reject);
    });
}

// Main execution function
async function main() {
    try {
        console.log('🚀 Phase 1: Extracting all names from CSV files...\n');
        
        // Extract names from all files
        for (const filename of csvFiles) {
            const namesInFile = await extractNamesFromFile(filename);
            namesInFile.forEach(name => uniqueNames.add(name));
        }
        
        console.log(`\n📈 Total unique student names found: ${uniqueNames.size}`);
        console.log(`📈 Total unique teacher names found: ${teacherNames.size}`);
        
        // Create anonymous mappings
        createAnonymousMapping();
        
        // Save mapping to file for reference
        const mappingData = {
            students: Object.fromEntries(nameMapping),
            teachers: Object.fromEntries(teacherMapping),
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(dataDir, 'name_mapping.json'), 
            JSON.stringify(mappingData, null, 2)
        );
        console.log(`\n💾 Name mapping saved to name_mapping.json`);
        
        console.log('\n🚀 Phase 2: Anonymizing all CSV files...\n');
        
        // Anonymize all files
        for (const filename of csvFiles) {
            await anonymizeFile(filename);
        }
        
        console.log('\n🎉 Anonymization complete!');
        console.log('📋 Summary:');
        console.log(`   • ${csvFiles.length} files processed`);
        console.log(`   • ${nameMapping.size} student names anonymized`);
        console.log(`   • ${teacherMapping.size} teacher names anonymized`);
        console.log(`   • Backups created with "backup_" prefix`);
        console.log(`   • Mapping saved to name_mapping.json`);
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
main();