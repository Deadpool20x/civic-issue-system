// fix-dynamic-routes.js
const fs = require('fs');
const path = require('path');

const dynamicConfig = `export const dynamic = 'force-dynamic';\nexport const runtime = 'nodejs';\n\n`;

function addDynamicConfig(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            addDynamicConfig(filePath);
        } else if (file === 'route.js') {
            let content = fs.readFileSync(filePath, 'utf8');

            // Check if already has dynamic config
            if (!content.includes('export const dynamic')) {
                // Add at the beginning after imports
                const lines = content.split('\n');
                let insertIndex = 0;

                // Find last import statement
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].trim().startsWith('import ')) {
                        insertIndex = i + 1;
                    }
                }

                lines.splice(insertIndex, 0, '', dynamicConfig.trim());
                content = lines.join('\n');

                fs.writeFileSync(filePath, content);
                console.log(`✅ Updated: ${filePath}`);
            }
        }
    });
}

// Run on app/api directory
addDynamicConfig(path.join(__dirname, 'app', 'api'));
console.log('\n✅ All API routes updated!');
