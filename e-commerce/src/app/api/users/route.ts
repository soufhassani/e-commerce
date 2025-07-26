import { NextRequest, NextResponse } from "next/server";
import schema from "@/features/users/schema";
import {
  createUser,
  findAllUsers,
  findUserByEmail,
} from "@/features/users/service";

export async function GET(request: NextRequest) {
  const users = await findAllUsers();
  return NextResponse.json({});
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = schema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.errors, { status: 400 });

  const user = await findUserByEmail(body.email);

  if (user)
    return NextResponse.json({ error: "User already exists" }, { status: 400 });

  const newUser = await createUser({ email: body.email, name: body.name });
  return NextResponse.json(newUser, { status: 201 });
}
