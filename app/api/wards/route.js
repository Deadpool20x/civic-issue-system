import { WARD_MAP, DEPARTMENTS } from '@/lib/wards';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const northZone = [];
        const southZone = [];

        Object.entries(WARD_MAP).forEach(([wardId, data]) => {
            const wardInfo = {
                wardId,
                wardName: `Ward ${data.wardNumber} - ${DEPARTMENTS[data.departmentId].name}`,
                zone: data.zone
            };

            if (data.zone === 'north') {
                northZone.push(wardInfo);
            } else {
                southZone.push(wardInfo);
            }
        });

        return Response.json({
            success: true,
            northZone,
            southZone
        });
    } catch (error) {
        console.error('Error fetching wards:', error);
        return Response.json({ error: 'Failed to fetch wards' }, { status: 500 });
    }
}
