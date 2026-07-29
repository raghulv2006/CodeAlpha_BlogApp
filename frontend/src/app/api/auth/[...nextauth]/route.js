import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Firebase Authentication is active" });
}

export async function POST() {
  return NextResponse.json({ message: "Firebase Authentication is active" });
}