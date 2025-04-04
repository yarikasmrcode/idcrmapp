"use client";

import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs"; // ✅ Import Clerk Hooks
import { Button } from "@/components/ui/button";
import { Home, Calendar, Users, LogOut, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  const { user } = useUser(); // ✅ Get User
  const { signOut } = useClerk(); // ✅ Get `signOut` function

  return (
    <nav className="h-screen w-64 bg-white shadow-lg fixed flex flex-col p-6 border-r border-gray-200">
      
      {/* ✅ If user is logged in - Show Email & Role */}
      {user ? (
        <>
          <p className="text-gray-900 text-sm">
            {user.primaryEmailAddress?.emailAddress} <br />
            <span className="font-semibold text-blue-600">
  {typeof user.publicMetadata?.role === "string" ? user.publicMetadata.role : "Loading..."}
</span>
          </p>

          <h1 className="text-2xl mb-18 font-bold text-gray-900 mt-12">ID English CRM</h1>

          <div className="space-y-8 flex-1">
            <Link href={user.publicMetadata?.role === "admin" ? "/admin/students" : "/teacher/students"}>
              <Button variant="ghost" className="w-full flex mb-14 justify-start gap-4 text-gray-700 text-lg p-4 hover:bg-gray-100 rounded-lg transition">
                <Users size={24} /> Students
              </Button>
            </Link>

            <Link href={user.publicMetadata?.role === "admin" ? "/admin/lessons" : "/teacher/lessons"}>
              <Button variant="ghost" className="w-full flex justify-start gap-4 text-gray-700 text-lg p-4 hover:bg-gray-100 rounded-lg transition">
                <Calendar size={24} /> Lessons
              </Button>
            </Link>
          </div>

          {/* 🔴 Logout Button */}
          <Button
            variant="destructive"
            className="mt-auto flex justify-start gap-4 w-full text-lg p-4 rounded-lg transition hover:bg-red-600"
            onClick={() => signOut()} // ✅ Calls Clerk's `signOut` function
          >
            <LogOut size={24} /> Logout
          </Button>
        </>
      ) : (
        // ✅ If user is NOT logged in - Show Sign In & Sign Up Buttons
        <div className="flex flex-col space-y-4 mt-auto">
          <Link href="/sign-in">
            <Button variant="outline" className="w-full flex justify-start gap-4 text-gray-700 text-lg p-4 hover:bg-gray-100 rounded-lg transition">
              <LogIn size={24} /> Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="default" className="w-full flex justify-start gap-4 text-white bg-blue-600 text-lg p-4 hover:bg-blue-700 rounded-lg transition">
              <UserPlus size={24} /> Sign Up
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
