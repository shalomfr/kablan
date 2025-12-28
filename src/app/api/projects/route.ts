import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrganization } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireOrganization();

    const projects = await prisma.project.findMany({
      where: {
        organizationId: user.organizationId!,
      },
      include: {
        rooms: true,
        _count: {
          select: {
            workItems: true,
            quotes: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireOrganization();
    const body = await request.json();

    const { name, description, clientName, clientPhone, clientEmail, address } = body;

    if (!name || !clientName) {
      return NextResponse.json(
        { success: false, error: 'Name and client name are required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        clientName,
        clientPhone,
        clientEmail,
        address,
        organizationId: user.organizationId!,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}


