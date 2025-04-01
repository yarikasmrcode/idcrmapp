import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // ✅ Ensure this points to Supabase client

export async function GET() {
  // ✅ Fetch all teachers from the "users" table where role is "teacher"
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("role", "teacher");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
