import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/types/auth';

// In-memory active user registry to track live logged-in user count
interface ActiveSession {
  userId: string;
  name: string;
  identifier: string; // mobile or email
  type: 'email' | 'mobile';
  lastActive: number;
}

const activeSessions = new Map<string, ActiveSession>();
// Dynamic base count to simulate active regional network watchers
const BASE_ACTIVE_USERS = 138;

// Clean up sessions older than 30 minutes
function cleanOldSessions() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, session] of activeSessions.entries()) {
    if (session.lastActive < cutoff) {
      activeSessions.delete(id);
    }
  }
}

export async function GET() {
  cleanOldSessions();
  const totalCount = BASE_ACTIVE_USERS + activeSessions.size;
  return NextResponse.json({
    activeUserCount: totalCount,
    serverTime: Date.now(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, identifier, logout } = body;

    cleanOldSessions();

    // Logout request
    if (logout) {
      const { userId } = body;
      if (userId && activeSessions.has(userId)) {
        activeSessions.delete(userId);
      }
      return NextResponse.json({
        success: true,
        activeUserCount: BASE_ACTIVE_USERS + activeSessions.size,
      });
    }

    // Validation
    const cleanName = (name || '').trim();
    const cleanId = (identifier || '').trim();

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ error: 'Please provide a valid name (at least 2 characters).' }, { status: 400 });
    }

    if (!cleanId) {
      return NextResponse.json({ error: 'Please provide a valid Mobile Number or Email ID.' }, { status: 400 });
    }

    const isEmail = cleanId.includes('@') && cleanId.includes('.');
    const isMobile = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(cleanId.replace(/\s+/g, ''));

    if (!isEmail && !isMobile) {
      return NextResponse.json(
        { error: 'Please enter a valid Mobile Number (e.g. +91 98765 43210) or Email ID.' },
        { status: 400 }
      );
    }

    // Create or update session
    const userId = `usr_${Buffer.from(cleanId.toLowerCase()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
    
    activeSessions.set(userId, {
      userId,
      name: cleanName,
      identifier: cleanId,
      type: isEmail ? 'email' : 'mobile',
      lastActive: Date.now(),
    });

    const userProfile: UserProfile = {
      id: userId,
      name: cleanName,
      email: isEmail ? cleanId : undefined,
      mobile: isMobile ? cleanId : undefined,
      isLoggedIn: true,
      lastLogin: Date.now(),
    };

    return NextResponse.json({
      success: true,
      user: userProfile,
      activeUserCount: BASE_ACTIVE_USERS + activeSessions.size,
    });
  } catch (error: any) {
    console.error('Auth API error:', error);
    return NextResponse.json({ error: 'Failed to authenticate user.' }, { status: 500 });
  }
}
