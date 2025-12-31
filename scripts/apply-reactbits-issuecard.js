const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'IssueCard.js');
let content = fs.readFileSync(filePath, 'utf8');

const importPattern = /import Link from 'next\/link';\s*import \{ useUser \} from '@\/lib\/contexts\/UserContext';/;
const importReplacement = [
  "import Link from 'next/link';",
  "import SpotlightCard from './ui/SpotlightCard';",
  "import StarBorderButton from './ui/StarBorderButton';",
  "import { useUser } from '@/lib/contexts/UserContext';"
].join('\n');

content = content.replace(importPattern, importReplacement);

const openingDivPattern = /<div className="bg-white[^>]+group">/;
content = content.replace(openingDivPattern, '<SpotlightCard className="group rounded-3xl border border-gray-200 bg-white/95 p-0 shadow-lg transition-shadow duration-300 hover:shadow-2xl">');

content = content.replace(/<\/div>\s*$/m, '</SpotlightCard>');

content = content.replace(
  /<Link\s*\n\s*href={`\/issues\/\$\{issue._id\}`}\s*\n\s*className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors border border-gray-300"\s*>\s*\n\s*Edit\s*\n\s*<\/Link>/,
  '<StarBorderButton\n                                as={Link}\n                                href={`/issues/${issue._id}/edit`}\n                                className="text-xs"\n                                thickness={0}\n                                color="#6366f1"\n                            >\n                                Edit Issue\n                            </StarBorderButton>'
);

fs.writeFileSync(filePath, content);
