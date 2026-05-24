import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, shopName } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await createUser(name, email, password, shopName);
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
  }
}
