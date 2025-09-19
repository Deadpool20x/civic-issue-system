const requiredEnvVars = {
    MONGODB_URI: 'MongoDB connection string',
    JWT_SECRET: 'Secret key for JWT token generation',
    CLOUDINARY_CLOUD_NAME: 'Cloudinary cloud name',
    CLOUDINARY_API_KEY: 'Cloudinary API key',
    CLOUDINARY_API_SECRET: 'Cloudinary API secret',
    OPENAI_API_KEY: 'OpenAI API key for AI features'
};

export function validateEnv() {
    const missingVars = [];

    for (const [key, description] of Object.entries(requiredEnvVars)) {
        if (!process.env[key]) {
            missingVars.push({ key, description });
        }
    }

    if (missingVars.length > 0) {
        console.error('\nMissing required environment variables:');
        missingVars.forEach(({ key, description }) => {
            console.error(`- ${key}: ${description}`);
        });
        console.error('\nPlease set these variables in your .env.local file.\n');

        throw new Error('Missing required environment variables');
    }
}

export function getEnvVar(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}