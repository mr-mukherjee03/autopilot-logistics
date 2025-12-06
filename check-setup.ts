const fs = require('fs');
const path = require('path');

const requiredFiles = [
    '.env',
    'src/config/database.ts',
    'src/controllers/AuthController.ts',
    'src/controllers/DashboardController.ts',
    'src/models/User.ts',
    'src/models/RfqModel.ts',
    'src/models/Schemas.ts',
    'src/middlewares/AuthMiddleware.ts',
    'src/services/BiddingEngine.ts',
    'src/services/GoCometService.ts',
    'src/server.ts',
    'src/routes.ts',
    'public/dashboard.html',
    'public/dashboard.js',
    'public/login.html',
    'public/login.js'
];

console.log('🔍 Checking Autopilot Project Structure...\n');

let missingCount = 0;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ Found: ${file}`);
    } else {
        console.log(`❌ MISSING: ${file}`);
        missingCount++;
    }
});

console.log('\n----------------------------------------');
if (missingCount === 0) {
    console.log('🎉 All system files are present. Ready to build!');
    console.log('👉 Run: npm run dev');
} else {
    console.log(`⚠️  ${missingCount} files are missing. Please create them before starting.`);
}