import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-guard";

export async function GET() {
  const { error } = await getAuthSession();
  if (error) return error;

  return NextResponse.json({
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });
}
