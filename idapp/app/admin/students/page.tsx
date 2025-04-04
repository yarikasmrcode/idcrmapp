"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student, Teacher } from "@/lib/types";

const STUDENTS_PER_PAGE = 8; // ✅ Max students per page

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // New state for pagination and filter
  const [currentPage, setCurrentPage] = useState(1);
  const [regularFilter, setRegularFilter] = useState("all"); // "all", "regular", "not_regular"

  const [searchQuery, setSearchQuery] = useState("");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState(""); // Stores the selected teacher's ID


  /** 🔹 Filter Students Based on Search & Regular Status */
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
    searchQuery === "" ||
    student.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  
    
    const matchesRegular =
      regularFilter === "all" ||
      (regularFilter === "regular" && student.isregular) ||
      (regularFilter === "not_regular" && !student.isregular);
    
    const matchesTeacher = selectedTeacher === "" || student.teacher_id === selectedTeacher;

    return matchesSearch && matchesRegular && matchesTeacher;
  });

  

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

  // Handlers (keeping your existing ones, just adding pagination-related ones)
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ✅ Fetch ALL students (for admin view)
  useEffect(() => {
    async function fetchStudents() {
      const res = await fetch("/api/admin/students"); // ✅ Fetch all students
      const data = await res.json();
      setStudents(data);
    }

    async function fetchTeachers() {
      const res = await fetch("/api/admin/teachers"); // ✅ Fetch all teachers
      const data = await res.json();
      setTeachers(data);
    }

    fetchStudents();
    fetchTeachers();
  }, []);

  // ✅ Open edit dialog
  function handleEditClick(student : Student) {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  }

  // ✅ Open delete confirmation dialog
  function handleDeleteClick(student : Student) {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  }

  // ✅ Handle editing student
  async function handleEditStudent() {
    if (!selectedStudent) return;

    try {
      const response = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedStudent),
      });

      if (!response.ok) throw new Error("Failed to update student");

      const updatedStudent = await response.json();

      setStudents((prev) =>
        prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
      );

      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  }

  // ✅ Handle deleting student
  async function handleConfirmDelete() {
    if (!studentToDelete) return;

    try {
      const response = await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentToDelete.id }),
      });

      if (!response.ok) throw new Error("Failed to delete student");

      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  }

  return (
    <div className="p-6">

<div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* 🔍 Search Input */}
        <Input 
          type="text" 
          placeholder="Search by Name or Username" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* 🔹 Regular Status Filter */}
        <Select onValueChange={setRegularFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Regular Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="regular">Regular Students</SelectItem>
            <SelectItem value="not_regular">Non-Regular Students</SelectItem>
          </SelectContent>
        </Select>

        {/* 🧑‍🏫 Teacher Filter */}
        <Select onValueChange={setSelectedTeacher}>
            <SelectTrigger>
                <SelectValue placeholder="Filter by Teacher" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem> {/* ✅ FIXED */}
                {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.full_name}
                </SelectItem>
                ))}
            </SelectContent>
        </Select>

      </div>
        
        {/* 🔹 STUDENTS GRID */}
        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {paginatedStudents.map((student, index) => (
            <Card 
            key={student.id || `temp-${index}`} 
            className="p-3 sm:p-4 md:p-6 rounded-lg shadow-lg border flex flex-col justify-between bg-gray-50 hover:shadow-md transition"
            >
            <CardHeader className="mb-1 sm:mb-2 p-2 sm:p-3">
                <CardTitle className="text-lg sm:text-xl font-semibold text-center text-gray-900">
                {student.full_name}
                </CardTitle>
            </CardHeader>
            
            <CardContent className="text-gray-700 space-y-2 sm:space-y-3 p-2 sm:p-3">
                {/* 🔹 Student Details Table */}
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                {/* Level */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">📌</span>
                    <p className="font-semibold text-gray-600">Level:</p>
                    <p className="text-gray-900 truncate">{student.level || "Not set"}</p>
                </div>

                {/* Username */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">📌</span>
                    <p className="font-semibold text-gray-600">Username:</p>
                    <p className="text-gray-900 truncate">{student.username || "Not set"}</p>
                </div>

                {/* Description (MULTILINE FIX ✅) */}
                <div className="flex gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base flex-shrink-0">📝</span>
                    <div className="w-full">
                    <p className="font-semibold text-gray-600">Description:</p>
                    <p className="text-gray-900 whitespace-normal line-clamp-3 sm:line-clamp-4">
                        {student.description || "No description provided"}
                    </p>
                    </div>
                </div>

                {/* Regular Student Status */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">📍</span>
                    <p className="font-semibold text-gray-600">Regular Student:</p>
                    <p className={`font-semibold ${student.isregular ? "text-green-600" : "text-blue-600"}`}>
                    {student.isregular ? "Yes" : "No"}
                    </p>
                </div>
                </div>
            </CardContent>
            </Card>
        ))}
        </div>

         {/* Pagination Controls */}
         {filteredStudents.length > 0 && (
            <div className="flex mt-16 flex-col sm:flex-row justify-between items-center mt-6 gap-4 sm:gap-0">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Previous
              </Button>
              <span className="text-xs sm:text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Next
              </Button>
            </div>
          )}
    </div>

  );
}
