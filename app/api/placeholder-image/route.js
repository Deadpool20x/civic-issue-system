export async function GET() {
    // Create a simple placeholder image using SVG
    const svg = `
        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="150" fill="#e5e7eb"/>
            <text x="100" y="75" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
                Placeholder Image
            </text>
            <text x="100" y="95" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">
                (Cloudinary not configured)
            </text>
        </svg>
    `;

    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400'
        }
    });
}