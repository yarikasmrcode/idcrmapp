"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { Student } from "@/lib/types";

const STUDENTS_PER_PAGE = 8; // ✅ Max students per page


export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editableStudent, setEditableStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: "",
    username: "",
    level: "",
    description: "",
    isregular: false,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Controls delete modal

  // New state for pagination and filter
  const [currentPage, setCurrentPage] = useState(1);
  const [regularFilter, setRegularFilter] = useState("all"); // "all", "regular", "not_regular"

  const [searchQuery, setSearchQuery] = useState("");

      {/* 🔹 State for Errors */}
      const [errors, setErrors] = useState({ full_name: "", username: "", level: "", description: "" });

  // Open delete confirmation dialog
  function handleDeleteClick(student : Student) {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  }

  useEffect(() => {
    async function fetchStudents() {
      const response = await fetch("/api/students");
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
      
      setCurrentPage(1); // ✅ Reset pagination to first page on filter change
    }
    fetchStudents();
  }, [searchQuery, regularFilter]); // ✅ Dependency array - triggers re-fetching
  

  /** 🔹 Filter Students Based on Search & Regular Status */
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
    searchQuery === "" ||
    (student.username ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase());
  
    
    const matchesRegular =
      regularFilter === "all" ||
      (regularFilter === "regular" && student.isregular) ||
      (regularFilter === "not_regular" && !student.isregular);
    
    return matchesSearch && matchesRegular;
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

  async function handleAddStudent() {
    // ✅ Validation - Check for Empty Fields
    const newErrors = {
      full_name: newStudent.full_name.trim() ? "" : "Full Name is required",
      username: newStudent.username.trim() ? "" : "Username is required",
      level: newStudent.level.trim() ? "" : "Level is required",
      description: newStudent.description.trim() ? "" : "Description is required",
    };
  
    setErrors(newErrors);
  
    // 🚨 If any error exists, stop execution
    if (Object.values(newErrors).some((error) => error !== "")) {
      console.error("❌ Missing Fields: Fix errors before submission!");
      return;
    }
  
    // ✅ Proceed with API call if no errors
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });
  
    if (response.ok) {
      const createdStudent = await response.json();
      
      // ✅ Close the dialog
      setAddDialogOpen(false);
      
      // ✅ Update UI with new student
      setStudents((prevStudents) => [...prevStudents, createdStudent]);
  
      // ✅ Clear input fields after successful addition
      setNewStudent({ full_name: "", username: "", level: "", description: "", isregular: false });
  
    } else {
      console.error("❌ Error adding student:", await response.json());
    }
  }
  

  async function handleEditStudent() {
    if (!selectedStudent) return;
  
    console.log("📤 Sending update request:", selectedStudent);
  
    const response = await fetch(`/api/students`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedStudent.id,
        full_name: selectedStudent.full_name,
        username : selectedStudent.username,
        level: selectedStudent.level,
        description: selectedStudent.description,
        isregular: selectedStudent.isregular, // ✅ Ensure boolean is correctly sent
      }),
    });
  
    const updatedStudent = await response.json();
    console.log("🟢 API Response:", updatedStudent);
  
    if (response.ok) {
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student
        )
      );
      setEditDialogOpen(false);
    } else {
      console.error("❌ Error updating student:", updatedStudent);
    }
  }

  async function handleDeleteStudent(studentId : string) {
    console.log("🗑️ Deleting student:", studentId);
  
    const response = await fetch(`/api/students`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: studentId }), // ✅ Send student ID in the body
    });
  
    if (response.ok) {
      console.log("✅ Student deleted successfully");
      setStudents((prev) => prev.filter((student) => student.id !== studentId)); // ✅ Remove from UI immediately
    } else {
      console.error("❌ Error deleting student:", await response.json());
    }
  }

  // Handles actual deletion
  async function handleConfirmDelete() {
    if (!studentToDelete) return;

    console.log("🗑️ Deleting student:", studentToDelete.id);

    const response = await fetch(`/api/students`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: studentToDelete.id }),
    });

    if (response.ok) {
      console.log("✅ Student deleted successfully");
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setDeleteDialogOpen(false);
    } else {
      console.error("❌ Error deleting student:", await response.json());
    }
  }
  

  function handleEditClick(student: Student) {
    setSelectedStudent({
      id: student.id,
      full_name: student.full_name || "",
      username: student.username || "",
      level: student.level || "",
      description: student.description || "",
      isregular: student.isregular ?? false,
      teacher_id: student.teacher_id || "", // ✅ Fix added here
    });
  
    setEditDialogOpen(true);
  }
  
   {
     {
      
      return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
          {/* Add Student Button */}
          <Button 
            className="mb-6 sm:mb-8 lg:mb-10 w-full sm:w-auto" 
            onClick={() => setAddDialogOpen(true)}
          >
            + Add Student
          </Button>
      
          {/* 🔍 Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <Input
              type="text"
              placeholder="🔍 Search by name or username..."
              className="p-2 sm:p-3 border rounded-lg w-full sm:w-64 lg:w-72"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={regularFilter} onValueChange={setRegularFilter}>
              <SelectTrigger className="w-full sm:w-36 lg:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="regular">Regular Only</SelectItem>
                <SelectItem value="not_regular">Not Regular Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
      
          <div className="w-full">
            {/* Student Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {paginatedStudents.map((student, index) => (
                <Card
                  key={student.id || `temp-${index}`}
                  className="p-4 rounded-lg shadow-lg border flex flex-col justify-between w-full min-h-[180px] sm:min-h-[200px]"
                >
                  <CardHeader className="p-0">
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold flex items-center gap-2">
                      <span className="text-black truncate">{student.full_name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 text-gray-700 space-y-2 text-xs sm:text-sm lg:text-base flex-grow">
                    <p><strong>Username:</strong> {student.username || "Not set"}</p>
                    <p><strong>Level:</strong> {student.level || "Not set"}</p>
                    <p className="line-clamp-2"><strong>Description:</strong> {student.description || "No description"}</p>
                    <p><strong>Regular:</strong> {student.isregular ? "Yes" : "No"}</p>
                  </CardContent>
                  <DialogFooter className="flex justify-between mt-4 gap-2">
                    <Button
                      variant="outline"
                      className="p-1 sm:p-2 rounded-md w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                      onClick={() => handleEditClick(student)}
                    >
                      <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      className="p-1 sm:p-2 rounded-md hover:bg-red-600 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
                      onClick={() => handleDeleteClick(student)}
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DialogFooter>
                </Card>
              ))}
            </div>
      
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent className="w-11/12 max-w-xs sm:max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-sm sm:text-base lg:text-lg">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-red-600">
                      {studentToDelete?.full_name}
                    </span>?
                  </DialogTitle>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    className="w-16 sm:w-20 text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    className="w-16 sm:w-20 text-xs sm:text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
      
            {/* Add Student Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogContent className="w-11/12 max-w-xs sm:max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-sm sm:text-lg">Add Student</DialogTitle>
                </DialogHeader>


                {/* ✅ Input Fields */}
                <div className="space-y-3 sm:space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={newStudent.full_name}
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, full_name: e.target.value });
                      setErrors({ ...errors, full_name: "" });
                    }}
                    className="w-full text-xs sm:text-sm"
                  />
                  {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name}</p>}

                  <Input
                    placeholder="Username"
                    value={newStudent.username}
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, username: e.target.value });
                      setErrors({ ...errors, username: "" });
                    }}
                    className="w-full text-xs sm:text-sm"
                  />
                  {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}

                  <Input
                    placeholder="Level"
                    value={newStudent.level}
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, level: e.target.value });
                      setErrors({ ...errors, level: "" });
                    }}
                    className="w-full text-xs sm:text-sm"
                  />
                  {errors.level && <p className="text-red-500 text-xs">{errors.level}</p>}

                  <Input
                    placeholder="Description"
                    value={newStudent.description}
                    onChange={(e) => {
                      setNewStudent({ ...newStudent, description: e.target.value });
                      setErrors({ ...errors, description: "" });
                    }}
                    className="w-full text-xs sm:text-sm"
                  />
                  {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                </div>

                {/* ✅ Save Button - Disabled If Fields Are Empty */}
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleAddStudent} 
                    className="text-xs sm:text-sm"
                    disabled={
                      !newStudent.full_name.trim() ||
                      !newStudent.username.trim() ||
                      !newStudent.level.trim() ||
                      !newStudent.description.trim()
                    } // ✅ Button only enabled when all fields are filled
                  >
                    Save
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

      
            {/* Student Details Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="w-11/12 max-w-xs sm:max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-sm sm:text-lg font-semibold">
                    Student Details
                  </DialogTitle>
                </DialogHeader>
                {selectedStudent && (
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm lg:text-base text-gray-700">
                    <p><strong>Name:</strong> {selectedStudent.full_name}</p>
                    <p><strong>Level:</strong> {selectedStudent.level}</p>
                    <p><strong>Description:</strong> {selectedStudent.description || "No description"}</p>
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        selectedStudent.isregular ? "text-green-600" : "text-blue-600"
                      }`}
                    >
                      {selectedStudent.isregular ? "Regular Student" : "Trial Student"}
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={() => handleDeleteStudent(studentToDelete?.id || "")}
                  className="text-xs sm:text-sm"
                >
                  Delete
                </Button>

                  <Button
                    onClick={() => {
                      setEditableStudent(selectedStudent);
                      setEditDialogOpen(true);
                    }}
                    className="text-xs sm:text-sm"
                  >
                    Edit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
      
            {/* Edit Student Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="w-11/12 max-w-xs sm:max-w-md p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-sm sm:text-lg">Edit Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4">
                  <Input
                    type="text"
                    value={selectedStudent?.full_name || ""}
                    onChange={(e) =>
                      setSelectedStudent((prev) =>
                        prev
                          ? { ...prev, full_name: e.target.value }
                          : {
                              id: "", // Provide defaults if `prev` is null (shouldn't happen in this case)
                              teacher_id: "",
                              full_name: e.target.value,
                              username: "",
                              level: "",
                              description: "",
                              isregular: false,
                            }
                      )
                    }
                    className="w-full text-xs sm:text-sm"
                  />
                  <Input
                    type="text"
                    value={selectedStudent?.username || ""}
                    onChange={(e) =>
                      setSelectedStudent((prev) =>
                        prev
                          ? { ...prev, username: e.target.value }
                          : {
                              id: "",
                              teacher_id: "",
                              full_name: "",
                              username: e.target.value,
                              level: "",
                              description: "",
                              isregular: false,
                            }
                      )
                    }
                                        className="w-full text-xs sm:text-sm"
                  />
                  <Input
                  type="text"
                  value={selectedStudent?.level || ""}
                  onChange={(e) =>
                    setSelectedStudent((prev) =>
                      prev
                        ? { ...prev, level: e.target.value }
                        : {
                            id: "",
                            teacher_id: "",
                            full_name: "",
                            username: "",
                            level: e.target.value,
                            description: "",
                            isregular: false,
                          }
                    )
                  }
                  className="w-full text-xs sm:text-sm"
                />

                <Input
                  type="text"
                  value={selectedStudent?.description || ""}
                  onChange={(e) =>
                    setSelectedStudent((prev) =>
                      prev
                        ? { ...prev, description: e.target.value }
                        : {
                            id: "",
                            teacher_id: "",
                            full_name: "",
                            username: "",
                            level: "",
                            description: e.target.value,
                            isregular: false,
                          }
                    )
                  }
                  className="w-full text-xs sm:text-sm"
                />

                <Select
                  value={selectedStudent?.isregular?.toString() || "false"}
                  onValueChange={(value) =>
                    setSelectedStudent((prev) =>
                      prev
                        ? { ...prev, isregular: value === "true" }
                        : {
                            id: "",
                            teacher_id: "",
                            full_name: "",
                            username: "",
                            level: "",
                            description: "",
                            isregular: value === "true",
                          }
                    )
                  }
                >
                  <SelectTrigger className="w-full text-xs sm:text-sm">
                    <SelectValue placeholder="Is Regular?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>

                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    className="text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEditStudent} className="text-xs sm:text-sm">
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
  }
}
