import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const res = await fetch(
      `${BACKEND}/api/paypal/capture-order/${params.orderId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
