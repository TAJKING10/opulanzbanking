import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Used by Azure App Service to verify application health
 *
 * Endpoint: /api/health
 * Returns: 200 OK with application status
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'opulanz-frontend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
    { status: 200 }
  );
}

// Enable edge runtime for faster responses (optional)
export const runtime = 'nodejs';
