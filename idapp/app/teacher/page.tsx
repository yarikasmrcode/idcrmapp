"use client"; // Add this at the top

import { useAuth } from "@/lib/auth";

export default function TeacherDashboard() {
  const { user, role } = useAuth();

  if (role !== "teacher") {
    return <div>Access Denied</div>;
  }

  return <div>Teacher Dashboard - Hello, {user?.fullName}!</div>;
}
