require('dotenv').config({path: '.env.local'});
require('./lib/mongodb').connectDB().then(async () => {
    const Issue = require('./models/Issue').default;
    const count1 = await Issue.countDocuments({ 'location.coordinates.coordinates': { $exists: true, $ne: null } });
    console.log('Public length with filter:', count1);
    
    // Check without filter
    const totalCount = await Issue.countDocuments();
    console.log('Total length without filter:', totalCount);
    
    process.exit(0);
}).catch(console.error);
