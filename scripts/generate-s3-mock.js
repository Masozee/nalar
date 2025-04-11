// This script prepares local JSON files for S3 deployment
// It reads files from the data folder and outputs them to a structure 
// that mimics what we'd expect from S3

const fs = require('fs');
const path = require('path');

// Configuration
const dataDir = path.join(__dirname, '../data');
const outputDir = path.join(__dirname, '../s3-mock');
const s3BaseUrl = 'https://s3-csis-web.s3.ap-southeast-1.amazonaws.com';

// Make sure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read all JSON files from data directory
const dataFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

// Process each file
dataFiles.forEach(file => {
  try {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Create directory structure if needed
    const outputFilePath = path.join(outputDir, file);
    
    // Write the processed data to output
    fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
    
    console.log(`Processed ${file} -> ${outputFilePath}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

// Create an index file that links to all available data endpoints
const endpoints = dataFiles.map(file => {
  const name = file.replace('.json', '');
  return {
    name,
    endpoint: `${s3BaseUrl}/${file}`,
    description: `${name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')} data`
  };
});

fs.writeFileSync(
  path.join(outputDir, 'index.json'), 
  JSON.stringify({ endpoints }, null, 2)
);

console.log('\nMock S3 data generation completed!');
console.log(`Files generated in: ${outputDir}`);
console.log(`To use: Set S3_BUCKET_URL to the local file path in development`);
console.log(`For production: Files should be uploaded to ${s3BaseUrl}`); 