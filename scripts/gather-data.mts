import { getCareerDetails } from '../src/lib/career-typical-days';
import { getProgrammesForCareer, getCareerRequirements, getCertificationPath } from '../src/lib/education/index';
import { getPensionNote, getSectorForCareer } from '../src/lib/career-pathways';

const careerId = 'pharmacist';
const careerTitle = 'Pharmacist';

console.log('=== PHARMACIST - TYPICAL DAY ===');
const details = getCareerDetails(careerId);
console.log(JSON.stringify(details, null, 2));

console.log('\n=== PHARMACIST - PROGRAMMES (NO) ===');
const programmes = getProgrammesForCareer(careerId, { country: 'NO' });
console.log(`Found ${programmes.length} programmes`);
if (programmes.length > 0) {
  console.log(JSON.stringify(programmes[0], null, 2));
}

console.log('\n=== PHARMACIST - REQUIREMENTS ===');
const requirements = getCareerRequirements(careerId);
console.log(JSON.stringify(requirements, null, 2));

console.log('\n=== PHARMACIST - CERTIFICATION PATH ===');
const certPath = getCertificationPath(careerId, careerTitle);
console.log(JSON.stringify(certPath, null, 2));

console.log('\n=== PHARMACIST - SECTOR & PENSION NOTE ===');
const sector = getSectorForCareer(careerId);
const pensionNote = getPensionNote(sector);
console.log(`Sector: ${sector}`);
console.log(`Pension Note: ${pensionNote}`);
