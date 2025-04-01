"use client";


import { useAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function AdminDashboard() {
  const { user, role } = useAuth();

  if (role !== "admin") {
    redirect("/");
  }

  return <div>Admin Dashboard - Welcome, {user?.fullName}!</div>;
}
