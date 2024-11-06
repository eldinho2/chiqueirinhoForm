import { NextResponse } from 'next/server';
import prisma from "@/services/prisma";

export async function GET() {
  try {
    const getUsers = await prisma.users.findMany();
    return NextResponse.json(getUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { username, password, role } = await request.json();
  const createUser = await prisma.users.create({ data: { username, password, role } });
  return NextResponse.json(createUser);
}
