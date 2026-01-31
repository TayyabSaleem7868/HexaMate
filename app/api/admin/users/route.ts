import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [{ getSession }, { prisma }] = await Promise.all([
      import("@/lib/auth"),
      import("@/lib/prisma"),
    ]);

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { chats: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const safeUsers = users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      role: u.role,
      createdAt: u.createdAt,
      chatCount: u._count?.chats ?? 0,
    }));

    return NextResponse.json(safeUsers);
  } catch (error: any) {
    const message = error?.message || String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
