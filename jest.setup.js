// Jest test environment setup

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/civic-test';
process.env.NODE_ENV = 'test';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.ROBOFLOW_API_KEY = 'test-roboflow-key';
process.env.RESEND_API_KEY = 'test-resend-key';

// Mock global Response for API route tests
if (typeof Response === 'undefined') {
    global.Response = class Response {
        constructor(body, init = {}) {
            this._body = body;
            this.status = init.status || 200;
            this.headers = new Map(Object.entries(init.headers || {}));
        }
        async json() {
            return JSON.parse(this._body);
        }
        async text() {
            return this._body;
        }
    };
}
