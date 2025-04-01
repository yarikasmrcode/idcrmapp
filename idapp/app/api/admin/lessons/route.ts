import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Import Supabase client

export async function GET() {
  const { data, error } = await supabase
  .from("lessons")
  .select(`
    id,
    type,
    lessonlink,
    duration,
    time_slot,
    status,
    payment_status,
    reasonforcancellation,
    student_id,
    teacher_id,
    student:students(full_name, username),
    teacher:users(full_name)
  `);


if (error) {
  console.error("❌ Error fetching lessons:", error.message);
  return NextResponse.json({ error: error.message }, { status: 500 });
}

console.log("🟢 Admin Lessons Fetched:", data);
return NextResponse.json(data);

}
