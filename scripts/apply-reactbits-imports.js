const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'IssueCard.js');

let content = fs.readFileSync(filePath, 'utf8');
content = content.replace(
    /import Link from 'next\/link';\r?\nimport { useUser } from '@\/lib\/contexts\/UserContext';/,
    "import Link from 'next/link';\nimport SpotlightCard from './ui/SpotlightCard';\nimport StarBorderButton from './ui/StarBorderButton';\nimport { useUser } from '@/lib/contexts/UserContext';"
);

fs.writeFileSync(filePath, content);
