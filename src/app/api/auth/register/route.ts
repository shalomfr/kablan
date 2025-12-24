import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, companyName } = await request.json();

    // Validate input
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: 'כל השדות הם חובה' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
        { status: 400 }
      );
    }

    // Check if database is available
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'מסד הנתונים אינו זמין. אנא וודא שהוגדר DATABASE_URL ושהטבלאות נוצרו (npm run db:push)' },
        { status: 503 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'משתמש עם אימייל זה כבר קיים' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: companyName,
        plan: 'FREE',
        settings: JSON.stringify({
          currency: 'ILS',
          language: 'he',
          taxRate: 0.17,
          defaultWasteFactor: 0.1,
          defaultContingency: 0.1,
          companyInfo: {},
        }),
      },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        organizationId: organization.id,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    // Check for specific Prisma errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('P1001') || errorMessage.includes('connect')) {
      return NextResponse.json(
        { error: 'לא ניתן להתחבר למסד הנתונים. אנא וודא שהוגדר DATABASE_URL' },
        { status: 503 }
      );
    }
    
    if (errorMessage.includes('P2002')) {
      return NextResponse.json(
        { error: 'משתמש עם אימייל זה כבר קיים' },
        { status: 400 }
      );
    }
    
    if (errorMessage.includes('P2021') || errorMessage.includes('does not exist')) {
      return NextResponse.json(
        { error: 'הטבלאות לא קיימות. הרץ: npm run db:push' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: `אירעה שגיאה בהרשמה: ${errorMessage}` },
      { status: 500 }
    );
  }
}

