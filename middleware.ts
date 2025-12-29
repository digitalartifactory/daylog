import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (request.method !== 'GET') {
    const originHeader = request.headers.get('Origin');
    const hostHeader = request.headers.get('Host');
    if (originHeader === null || hostHeader === null) {
      return new NextResponse(null, {
        status: 403,
      });
    }
    let origin: URL;
    try {
      origin = new URL(originHeader);
    } catch {
      return new NextResponse(null, {
        status: 403,
      });
    }
    if (origin.host !== hostHeader) {
      return new NextResponse(null, {
        status: 403,
      });
    }
  }

  // Allow static files, Next.js internals and the auth API through
  if (
    pathname.startsWith('/api/v1/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Validate if admin user exists (for initial registration flow)
  if (pathname !== '/register/init') {
    const adminResponse = await fetch(
      `${request.nextUrl.origin}/api/v1/auth/admin`,
      {
        cache: 'force-cache',
      }
    );
    if (!adminResponse.ok) {
      return NextResponse.next();
    }
    const adminData = await adminResponse.json();
    const adminExists = adminData.exists;
    if (!adminExists) {
      return NextResponse.redirect(new URL('/register/init', request.url));
    }
  } else {
    const adminResponse = await fetch(
      `${request.nextUrl.origin}/api/v1/auth/admin`,
      {
        cache: 'force-cache',
      }
    );
    if (!adminResponse.ok) {
      return NextResponse.next();
    }
    const adminData = await adminResponse.json();
    const adminExists = adminData.exists;
    if (adminExists) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/login') {
    const token = request.cookies.get('session')?.value;
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/v1/auth/session?token=${token}`,
      {
        cache: 'force-cache',
      }
    );
    if (!sessionResponse.ok) {
      return NextResponse.next();
    }
    const sessionData = await sessionResponse.json();
    const isLoggedIn = sessionData.session !== null;
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Handle home page - redirect if not logged in
  if (pathname === '/') {
    const token = request.cookies.get('session')?.value;
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/v1/auth/session?token=${token}`,
      {
        cache: 'force-cache',
        // Revalidate user session cache every hour
        next: { revalidate: 3600 },
      }
    );
    if (!sessionResponse.ok) {
      return NextResponse.next();
    }
    const sessionData = await sessionResponse.json();
    const isLoggedIn = sessionData.session !== null;
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/register') {
    // Validate if user registration is allowed
    const allowResponse = await fetch(
      `${request.nextUrl.origin}/api/v1/auth/register`
    );
    if (!allowResponse.ok) {
      return NextResponse.next();
    }
    const allowData = await allowResponse.json();
    const allowRegistration = allowData.allowed;
    if (!allowRegistration) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Session exists — allow the request
  return NextResponse.next();
}
