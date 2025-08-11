import { NextResponse } from 'next/server';

const MOCK_USERS = [
  { username: 'admin', password: 'admin123', id: 1, name: 'Administrator' },
  { username: 'user', password: 'user123', id: 2, name: 'Regular User' }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}