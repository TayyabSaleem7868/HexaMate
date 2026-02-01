import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { error: { message: "Unauthorized" } },
      { status: 401 },
    );

  const { id, email, name } = session as {
    id?: string;
    email?: string;
    name?: string;
  };
  return NextResponse.json({ user: { id, email, name } });
}
