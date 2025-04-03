import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

// 🟢 GET: Fetch lessons for the logged-in teacher
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    student:students(full_name, username)
  `)
  .eq("teacher_id", userId);


  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  console.log("🟢 Lessons Fetched:", data);
  return NextResponse.json(data);
}


// 🟢 POST: Add a new lesson
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { student_id, type, lessonlink,duration, timeSlot, status, paymentStatus } = await req.json();

    console.log("📥 Received lesson data:", { student_id, type, lessonlink,duration, timeSlot, status, paymentStatus });

    if (!student_id) {
      console.error("❌ Student ID is missing!");
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("lessons")
      .insert([{ teacher_id: userId, student_id, type,lessonlink,duration, time_slot: timeSlot, status, payment_status: paymentStatus }])
      .select();

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Successfully added lesson:", data[0]);
    return NextResponse.json(data[0]);

  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🟢 PUT: Update lesson
export async function PUT(req : Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, student_id, type,duration, time_slot, status, payment_status, reasonforcancellation } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing lesson ID" }, { status: 400 });
    }

    console.log("📤 Updating Lesson with data:", {
      id,
      student_id,
      type,
      duration,
      time_slot,
      status,
      payment_status,
      reasonforcancellation // ✅ Store reason only if cancelled
    });

    const { data, error } = await supabase
      .from("lessons")
      .update({
        student_id: student_id || null,
        type: type || null,
        duration: duration ? parseInt(duration) : null,
        time_slot: time_slot || null,
        status: status || null,
        payment_status: payment_status || null,
        reasonforcancellation: reasonforcancellation || null
      })
      .eq("id", id)
      .select("*"); // ✅ Ensure all fields are selected

    if (error) {
      console.error("❌ Supabase Update Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("🟢 Updated Lesson:", data[0]);

    return NextResponse.json(data[0]); // ✅ Return updated lesson
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



// 🟢 DELETE: Remove lesson
export async function DELETE(req:Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json(); // ✅ Extract lesson ID from request body
    if (!id) return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });

    // 🔹 Delete from database
    const { error } = await supabase.from("lessons").delete().eq("id", id).eq("teacher_id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
