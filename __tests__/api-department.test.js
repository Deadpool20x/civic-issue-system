const { expect, describe, it, beforeEach, afterAll, beforeAll } = require('@jest/globals');
const mockQuery = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn()
};

// Mock modules BEFORE requiring the dependent code
jest.mock('@/lib/auth', () => ({
    getTokenData: jest.fn(),
    authMiddleware: jest.fn(),
    roleMiddleware: jest.fn()
}));

jest.mock('@/lib/mongodb', () => ({
    connectDB: jest.fn()
}));

jest.mock('@/models/Issue', () => {
    return {
        __esModule: true,
        default: {
            find: jest.fn(() => mockQuery),
            findOne: jest.fn(() => mockQuery),
            findById: jest.fn(() => mockQuery)
        }
    };
});

const { GET } = require('@/app/api/issues/department/route');
const mongoose = require('mongoose');
const mockAuth = require('@/lib/auth');
const mockMongodb = require('@/lib/mongodb');
const Issue = require('@/models/Issue').default;

describe('Department Issues API - GET', () => {
    let mockUser;
    let mockReq;

    const mockUserFindById = jest.fn();

    beforeAll(() => {
        jest.spyOn(mongoose, 'model').mockImplementation((modelName) => {
            if (modelName === 'User') {
                return {
                    findById: mockUserFindById
                };
            }
            return {};
        });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockMongodb.connectDB.mockResolvedValue();
        mockAuth.getTokenData.mockResolvedValue({ userId: '123', role: 'department' });

        mockUser = {
            _id: '123',
            department: { _id: 'dept123', name: 'Roads Dept' },
            ward: 'Ward 1'
        };

        mockUserFindById.mockReturnValue({
            populate: jest.fn().mockResolvedValue(mockUser)
        });

        const mockIssues = [
            { _id: 'issue1', title: 'Pothole', status: 'pending', resolutionTime: null, sla: { deadline: new Date() } },
            { _id: 'issue2', title: 'Streetlight', status: 'resolved', resolutionTime: 24, feedback: { rating: 5 } }
        ];

        mockQuery.lean.mockResolvedValue(mockIssues);

        mockReq = {
            nextUrl: { pathname: '/api/issues/department', searchParams: new URLSearchParams() },
            url: 'http://localhost:3000/api/issues/department'
        };
    });

    it('should return 401 if unauthenticated', async () => {
        mockAuth.getTokenData.mockResolvedValue(null);

        const response = await GET(mockReq);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized - No authentication token');
    });

    it('should return 403 if role is not department', async () => {
        mockAuth.getTokenData.mockResolvedValue({ userId: '123', role: 'citizen' });

        const response = await GET(mockReq);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Department access required');
    });

    it('should return empty list if user has no department', async () => {
        mockUser.department = null;

        const response = await GET(mockReq);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.issues).toEqual([]);
        expect(data.message).toBe('No department assigned to your account');
    });

    it('should query issues with department and ward filters', async () => {
        const response = await GET(mockReq);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.departmentName).toBe('Roads Dept');
        expect(data.wardName).toBe('Ward 1');

        expect(Issue.find).toHaveBeenCalledWith({
            assignedDepartment: 'dept123',
            ward: 'Ward 1'
        });

        expect(mockQuery.select).toHaveBeenCalledWith(
            expect.stringContaining('reportId title description category subcategory status priority location ward sla resolutionTime feedback createdAt updatedAt upvotes')
        );
    });

    it('should apply optional status filter from query string', async () => {
        mockReq.url = 'http://localhost:3000/api/issues/department?status=resolved';

        await GET(mockReq);

        expect(Issue.find).toHaveBeenCalledWith({
            assignedDepartment: 'dept123',
            ward: 'Ward 1',
            status: 'resolved'
        });
    });

    it('should query issues without ward filter if user has no ward', async () => {
        mockUser.ward = null;

        await GET(mockReq);

        expect(Issue.find).toHaveBeenCalledWith({
            assignedDepartment: 'dept123'
        });
    });
});
