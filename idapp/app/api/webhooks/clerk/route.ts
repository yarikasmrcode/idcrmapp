import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (!payload || !payload.data || !payload.data.id || !payload.data.email_addresses) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const email = payload.data.email_addresses[0].email_address;
    const userId = payload.data.id; // Now stored as TEXT

    console.log("📌 Webhook received: ", userId, email);

    // Insert user into Supabase
    const { error } = await supabase.from("users").insert([
      { id: userId, email, role: "teacher" } // id is now TEXT
    ]);

    if (error) {
      console.error("🔥 Supabase Insert Error: ", error);
      throw error;
    }

    console.log("✅ User added to Supabase: ", email);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("❌ Webhook Error:", error);
  
    const message = error instanceof Error ? error.message : "Unknown error";
  
    return NextResponse.json({ error: message }, { status: 500 });
  }
  
}
