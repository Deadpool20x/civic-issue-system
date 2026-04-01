import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const ATLAS_URI = process.env.ATLAS_URI;
const LOCAL_URI = 'mongodb://localhost:27017/civic-issue-system';

if (!ATLAS_URI) {
    console.error('❌ MONGODB_URI or ATLAS_URI not found in .env.local');
    process.exit(1);
}

async function migrateData() {
    console.log('🚀 Starting Data Migration to Atlas...');
    
    let localClient;
    let atlasClient;
    
    try {
        // Connect to both databases
        console.log('=> Connecting to Local Database...', LOCAL_URI);
        localClient = await MongoClient.connect(LOCAL_URI, { serverSelectionTimeoutMS: 5000 });
        const localDb = localClient.db();
        console.log('✅ Connected to Local Database.');

        console.log('=> Connecting to Atlas Database...');
        
        let finalAtlasUri = ATLAS_URI;
        
        // If local DNS is blocking SRV records, convert standard mongodb+srv to direct nodes
        if (finalAtlasUri.startsWith('mongodb+srv://')) {
            const credentials = finalAtlasUri.split('@')[0].replace('mongodb+srv://', '');
            const params = finalAtlasUri.split('?')[1] || '';
            
            finalAtlasUri = `mongodb://${credentials}@ac-vxldxim-shard-00-00.xv4uuze.mongodb.net:27017,ac-vxldxim-shard-00-01.xv4uuze.mongodb.net:27017,ac-vxldxim-shard-00-02.xv4uuze.mongodb.net:27017/civicpulse?ssl=true&replicaSet=atlas-vxldxim-shard-0&authSource=admin&${params}`;
        }

        console.log('Using Atlas URI:', finalAtlasUri.replace(/:([^:@]+)@/, ':****@'));
        atlasClient = await MongoClient.connect(finalAtlasUri, {
            serverSelectionTimeoutMS: 15000,
        });
        const atlasDb = atlasClient.db('civicpulse');
        console.log('✅ Connected to Atlas Database.');

        // Get all collections from local DB
        const collections = await localDb.listCollections().toArray();
        const collectionNames = collections.map(c => c.name).filter(name => name !== 'system.indexes');
        
        console.log(`\n📋 Found ${collectionNames.length} collections to migrate: ${collectionNames.join(', ')}\n`);

        for (const collectionName of collectionNames) {
            console.log(`⏳ Migrating collection: [${collectionName}]...`);
            
            // Get data from local
            const localCollection = localDb.collection(collectionName);
            const docs = await localCollection.find({}).toArray();
            
            if (docs.length === 0) {
                console.log(`   -> Skipping: Collection [${collectionName}] is empty.`);
                continue;
            }

            // Drop existing collection in Atlas if exists to avoid conflicts
            const atlasCollection = atlasDb.collection(collectionName);
            try {
                await atlasCollection.drop();
                console.log(`   -> Dropped existing collection in Atlas.`);
            } catch (e) {
                // Ignore error if collection doesn't exist
            }

            // Insert into Atlas
            const result = await atlasCollection.insertMany(docs);
            console.log(`   ✅ Successfully migrated ${result.insertedCount} documents.`);
        }

        console.log('\n🎉 MIGRATION COMPLETE!');
        console.log('You can now use your ATLAS_URI in Render!');

    } catch (error) {
        console.error('\n❌ MIGRATION FAILED:', error.message);
        if(error.message.includes('10000438:SSL')) {
            console.log("\n⚠️ IMPORTANT: If you just whitelisted your IP to 0.0.0.0/0, you MUST wait ~2 minutes for Atlas to make it 'Active'. Try running the script again in a minute!");
        }
    } finally {
        if (localClient) await localClient.close();
        if (atlasClient) await atlasClient.close();
        process.exit(0);
    }
}

migrateData();
