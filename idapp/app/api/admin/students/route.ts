import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  // ✅ Fetch all students from the database
  const { data, error } = await supabase
    .from("students")
    .select("*"); // Get all student records

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
