"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import { Lesson } from "@/lib/types";

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [newLesson, setNewLesson] = useState({ student: "", type: "", lessonlink : "",duration: "", timeSlot: "", status: "", paymentStatus: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    type: [],
    status: [],
    payment: [],
  });
  
  useEffect(() => {
    async function fetchLessons() {
      try {
        const response = await fetch("/api/lessons");
        if (!response.ok) throw new Error("Failed to fetch lessons");
        const lessonsData = await response.json();
  
        // ✅ Sort lessons from earliest to latest based on time_slot
        const sortedLessons = lessonsData.sort(
          (a, b) => new Date(a.time_slot) - new Date(b.time_slot)
        );
  
        setLessons(sortedLessons);
      } catch (error) {
        console.error("❌ Error fetching lessons:", error);
      }
    }
    fetchLessons();
  }, []);


  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch("/api/students");
        if (!response.ok) throw new Error("Failed to fetch students");
        const studentsData = await response.json();
        setStudents(studentsData);
      } catch (error) {
        console.error("❌ Error fetching students:", error);
      }
    }
    fetchStudents();
  }, []);

  function handleEditClick(lesson: Lesson) {
    const studentInfo = students.find((s) => s.id === lesson.student_id);
  
    setSelectedLesson({
      ...lesson,
      student_id: lesson.student?.id || lesson.student_id || "",
      student: studentInfo ? studentInfo : { id: "", full_name: "Select Student" }
    });
  
    setEditDialogOpen(true);
  }

  async function handleAddLesson() {
    if (!newLesson.student) {
      console.error("❌ No student selected!");
      return;
    }
  
    console.log("📤 Sending new lesson:", newLesson);
  
    const response = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: newLesson.student,  
        type: newLesson.type,
        lessonlink : newLesson.lessonlink,
        duration: newLesson.duration,
        timeSlot: new Date(newLesson.timeSlot).toISOString(), // ✅ Convert to UTC
        status: newLesson.status,
        paymentStatus: newLesson.paymentStatus,
      }),
    });
  
    const responseData = await response.json();
    console.log("🟢 API Response:", responseData);
  
    if (response.ok) {
      const studentInfo = students.find((s) => s.id === newLesson.student);
  
      // ✅ Insert new lesson in the right order
      setLessons((prev) => [...prev, {
        ...responseData,
        student: {
          full_name: studentInfo?.full_name || "Unknown",
          username: studentInfo?.username || "unknown_user", // ✅ Fix the build!
        },        
      }].sort((a, b) => new Date(a.time_slot) - new Date(b.time_slot))); 
  
      setDialogOpen(false);
      setNewLesson({ student: "", type: "", lessonlink: "",duration: "", timeSlot: "", status: "", paymentStatus: "" });
    } else {
      console.error("❌ Error adding lesson:", responseData);
    }
  }
  
  
  async function handleEditLesson() {
    if (!selectedLesson) return;
  
    console.log("📤 Sending update request:", selectedLesson);
  
    const response = await fetch(`/api/lessons`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedLesson.id,
        student_id: selectedLesson.student_id, 
        type: selectedLesson.type,
        duration: parseInt(selectedLesson.duration), 
        time_slot: selectedLesson.time_slot ? new Date(selectedLesson.time_slot).toISOString() : null,
        status: selectedLesson.status,
        payment_status: selectedLesson.payment_status,
        reasonforcancellation: selectedLesson.status === "Cancelled" ? selectedLesson.reasonforcancellation : null // ✅ Send only if cancelled
      }),
    });
  
    const updatedLesson = await response.json();
    console.log("🟢 API Response:", updatedLesson);
  
    if (response.ok) {
      // 🔥 Find the student name from the students array
      const studentInfo = students.find((s) => s.id === updatedLesson.student_id);
  
      // 🔥 Update the lesson state immediately with correct student name
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.id === updatedLesson.id
            ? {
                ...updatedLesson,
                student: studentInfo ? studentInfo : { full_name: "Unknown" },
              }
            : lesson
        )
      );
  
      setEditDialogOpen(false);
    } else {
      console.error("❌ Error updating lesson:", updatedLesson);
    }
  }
  
  
  async function handleDeleteLesson(lessonId) {
    console.log("🗑️ Deleting lesson:", lessonId);
  
    const response = await fetch(`/api/lessons`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lessonId }), // ✅ Send lesson ID in request body
    });
  
    if (response.ok) {
      console.log("✅ Lesson deleted successfully");
      setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId)); // ✅ Remove lesson from UI immediately
    } else {
      console.error("❌ Error deleting lesson:", await response.json());
    }
  }

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      searchQuery === "" ||
      (lesson.student?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedFilters.type.length === 0 || selectedFilters.type.includes(lesson.type);
    const matchesStatus =
      selectedFilters.status.length === 0 || selectedFilters.status.includes(lesson.status);
    const matchesPayment =
      selectedFilters.payment.length === 0 ||
      selectedFilters.payment.includes(lesson.payment_status);

    return matchesSearch && matchesType && matchesStatus && matchesPayment;
  });

  /** ✅ Handle filter toggles */
  const handleFilterChange = (category, value) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (updatedFilters[category].includes(value)) {
        updatedFilters[category] = updatedFilters[category].filter((item) => item !== value);
      } else {
        updatedFilters[category] = [...updatedFilters[category], value];
      }
      return updatedFilters;
    });
  };

  const lessonsPerPage = 6;
  const totalPages = Math.ceil(filteredLessons.length / lessonsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  
  const indexOfLastLesson = currentPage * lessonsPerPage;
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
  const currentLessons = filteredLessons.slice(indexOfFirstLesson, indexOfLastLesson);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="p-4 sm:p-6 max-w-screen-lg mx-auto">

            {/* 🔍 Search Bar, Filters, and ➕ Add Lesson Button (Aligned) */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-6 w-full">
        {/* 🔍 Search Input */}
        <div className="relative w-full sm:w-1/3">
          <Input
            type="text"
            placeholder="🔍 Search by student name..."
            className="p-3 border rounded-full shadow-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
        </div>

        {/* ➕ Add Lesson Button */}
        <Button onClick={() => setDialogOpen(true)} className="px-6 py-3 rounded-lg shadow-md sm:ml-auto">
          + Add Lesson
        </Button>
      </div>

      {/* ✅ FILTER CHECKBOXES (Centered & Aligned) */}
      <div className="grid grid-cols-1 mb-14 mt-14 sm:grid-cols-3 gap-6 w-full text-center">
        {/* Type Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-gray-800">Lesson Type</h4>
          <div className="flex flex-col items-start mt-2">
            <div className="flex items-center gap-2">
              <Checkbox onCheckedChange={() => handleFilterChange("type", "Trial")} />
              <span>Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox onCheckedChange={() => handleFilterChange("type", "Regular")} />
              <span>Regular</span>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-gray-800">Status</h4>
          <div className="flex flex-col items-start mt-2">
            <div className="flex items-center gap-2">
              <Checkbox onCheckedChange={() => handleFilterChange("status", "Upcoming")} />
              <span>Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox onCheckedChange={() => handleFilterChange("status", "Cancelled")} />
              <span>Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox onCheckedChange={() => handleFilterChange("status", "Completed")} />
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Payment Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-gray-800">Payment</h4>
          <div className="flex flex-col items-start mt-2">
            <div className="flex items-center gap-2">
              <Checkbox onCheckedChange={() => handleFilterChange("payment", "Paid")} />
              <span>Paid</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox onCheckedChange={() => handleFilterChange("payment", "Not Paid")} />
              <span>Not Paid</span>
            </div>
          </div>
        </div>
      </div>

   

      {/* 🔹 RENDER FILTERED LESSONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentLessons.map((lesson, index) => (
      <Card 
        key={lesson.id || `temp-${index}`} 
        className="aspect-square flex flex-col justify-between p-6 rounded-lg shadow-sm border bg-white transition-all duration-200 hover:shadow-md hover:border-gray-300">
      {/* ✅ Student Name - CENTERED */}
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2 text-center">
          🎓 {lesson.student?.full_name || "Unknown"}
        </CardTitle>
      </CardHeader>
      
      {/* ✅ Lesson Details - LEFT ALIGNED */}
      <CardContent className="flex flex-col space-y-2 text-left">
        <p className="text-gray-700">
          <strong className="text-gray-900">Type:</strong> {lesson.type}
        </p>
        <p className="text-gray-700">
          <strong className="text-gray-900">Lesson Link:</strong> {lesson.lessonlink}
        </p>
        <p className="text-gray-700">
          <strong className="text-gray-900">Duration:</strong> {lesson.duration} mins
        </p>
        <p className="text-gray-700">
          <strong className="text-gray-900">Time:</strong> {lesson.time_slot 
            ? new Date(lesson.time_slot).toLocaleString() 
            : "Not set"}
        </p>
         <p className={`font-semibold ${
          lesson.status === "Cancelled" 
            ? "text-red-600" 
            : lesson.status === "Completed" 
            ? "text-green-600" 
            : "text-gray-900"
        }`}>
          <strong>Status:</strong> {lesson.status}
        </p>
        {/* 🔥 Reason for Cancellation (ONLY when status is "Cancelled") */}
        {lesson.status === "Cancelled" && lesson.reasonforcancellation && (
          <p className="text-sm font-semibold text-red-500 bg-red-100 p-2 rounded-lg">
            <strong>Reason:</strong> {lesson.reasonforcancellation}
          </p>
        )}

        <p className={`font-semibold ${lesson.payment_status === "Not Paid" ? "text-red-600" : "text-green-600"}`}>
          <strong>Payment:</strong> {lesson.payment_status}
        </p>
      </CardContent>
      
      {/* ✅ Icons for Edit & Delete */}
      <DialogFooter className="flex justify-start gap-2 mt-4">
        <Button 
          variant="outline" 
          className="p-2 border-gray-300 hover:bg-gray-100"
          onClick={() => handleEditClick(lesson)}
        >
          <Pencil className="h-5 w-5 text-gray-700" /> {/* ✏️ Pencil Icon */}
        </Button>
        <Button 
          className="p-2 text-white hover:bg-red-600"
          onClick={() => handleDeleteLesson(lesson.id)}
        >
          <Trash2 className="h-5 w-5" /> {/* 🗑️ Trash Icon */}
        </Button>
      </DialogFooter>
    </Card>
  ))}
      </div>


      {/* ✅ Fixed Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ⬅ Previous
        </Button>
      
        <span className="px-4 py-2 border rounded-md">
          Page {currentPage} of {totalPages}
        </span>
      
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next ➡
        </Button>
      </div>
      
      )}

    </div>
      
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold">Add Lesson</DialogTitle>
    </DialogHeader>

    {/* 🔹 Select Student */}
    <Select
      onValueChange={(value) => setNewLesson({ ...newLesson, student: value })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Student" />
      </SelectTrigger>
      <SelectContent>
        {students.map((student) => (
          <SelectItem key={student.id} value={student.id}>
            {student.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* 🔹 Select Lesson Type */}
    <Select
      onValueChange={(value) => setNewLesson({ ...newLesson, type: value })}
    >
      <SelectTrigger className="border p-3 rounded-lg w-full">
        <SelectValue placeholder="Select Lesson Type" />
      </SelectTrigger>
      <SelectContent className="bg-white shadow-md rounded-lg">
        <SelectItem value="Trial">Trial</SelectItem>
        <SelectItem value="Regular">Regular</SelectItem>
      </SelectContent>
    </Select>

    {/* 🔹 Lesson Link */}
    <Input
      type="text"
      placeholder="Paste Lesson Link"
      value={newLesson.lessonlink || ""}
      onChange={(e) => setNewLesson({ ...newLesson, lessonlink: e.target.value })}
      className="border p-3 rounded-lg w-full"
    />

    {/* 🔹 Select Duration */}
    <Select
      onValueChange={(value) => setNewLesson({ ...newLesson, duration: value })}
    >
      <SelectTrigger className="border p-3 rounded-lg w-full">
        <SelectValue placeholder="Select Duration" />
      </SelectTrigger>
      <SelectContent className="bg-white shadow-md rounded-lg">
        <SelectItem value="30">30 mins</SelectItem>
        <SelectItem value="45">45 mins</SelectItem>
        <SelectItem value="60">60 mins</SelectItem>
      </SelectContent>
    </Select>

    {/* 🔹 Time Slot */}
    <Input
      placeholder="Time Slot"
      type="datetime-local"
      onChange={(e) => setNewLesson({ ...newLesson, timeSlot: e.target.value })}
    />

    {/* 🔹 Select Status */}
    <Select
      onValueChange={(value) => setNewLesson({ ...newLesson, status: value })}
    >
      <SelectTrigger className="border p-3 rounded-lg w-full">
        <SelectValue placeholder="Select Status" />
      </SelectTrigger>
      <SelectContent className="bg-white shadow-md rounded-lg">
        <SelectItem value="Upcoming">Upcoming</SelectItem>
        <SelectItem value="Cancelled">Cancelled</SelectItem>
        <SelectItem value="Completed">Completed</SelectItem>
      </SelectContent>
    </Select>

    {/* 🔹 Payment Status */}
    <Select
      onValueChange={(value) => setNewLesson({ ...newLesson, paymentStatus: value })}
    >
      <SelectTrigger className="border p-3 rounded-lg w-full">
        <SelectValue placeholder="Payment Status" />
      </SelectTrigger>
      <SelectContent className="bg-white shadow-md rounded-lg">
        <SelectItem value="Paid">Paid</SelectItem>
        <SelectItem value="Not Paid">Not Paid</SelectItem>
      </SelectContent>
    </Select>

    {/* ✅ Disable "Save" Until All Fields Are Filled */}
    <DialogFooter>
      <Button
        className="bg-black text-white rounded-lg"
        onClick={handleAddLesson}
        disabled={
          !newLesson.student ||
          !newLesson.type ||
          !newLesson.lessonlink ||
          !newLesson.duration ||
          !newLesson.timeSlot ||
          !newLesson.status ||
          !newLesson.paymentStatus
        } // ✅ Button only enabled when all fields are filled
      >
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          {selectedLesson && (
            <>
              {/* 🔹 Select Student */}
              <Select
                value={selectedLesson?.student_id || ""}
                onValueChange={(value) => {
                  const studentInfo = students.find((s) => s.id === value);
                  setSelectedLesson((prev) => ({
                    ...prev,
                    student_id: value,
                    student: studentInfo ? studentInfo : { id: "", full_name: "Unknown" }
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue>
                    {students.find((s) => s.id === selectedLesson?.student_id)?.full_name || "Select Student"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 🔹 Lesson Type */}
              <Select
                value={selectedLesson.type}
                onValueChange={(value) => setSelectedLesson({ ...selectedLesson, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lesson Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                </SelectContent>
              </Select>

              {/* 🔹 Duration */}
              <Select
                value={selectedLesson.duration.toString()}
                onValueChange={(value) => setSelectedLesson({ ...selectedLesson, duration: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 mins</SelectItem>
                  <SelectItem value="45">45 mins</SelectItem>
                  <SelectItem value="60">60 mins</SelectItem>
                </SelectContent>
              </Select>

              {/* 🔹 Time Slot */}
              <Input
                type="datetime-local"
                value={selectedLesson.time_slot ? new Date(selectedLesson.time_slot).toISOString().slice(0, 16) : ""}
                onChange={(e) => setSelectedLesson({ ...selectedLesson, time_slot: e.target.value })}
              />

              {/* 🔹 Status */}
              <Select
                value={selectedLesson.status}
                onValueChange={(value) => setSelectedLesson((prev) => ({
                  ...prev,
                  status: value,
                  reasonforcancellation: value === "Cancelled" ? prev.reasonforcancellation || "" : "" // Reset reason if not cancelled
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              {/* 🔹 Show "Reason for Cancellation" Only When Status is Cancelled */}
              {selectedLesson.status === "Cancelled" && (
                <Select
                  value={selectedLesson.reasonforcancellation || ""}
                  onValueChange={(value) => setSelectedLesson({ ...selectedLesson, reasonforcancellation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Cancellation Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student No Show">Student No Show</SelectItem>
                    <SelectItem value="Teacher Unavailable">Teacher Unavailable</SelectItem>
                    <SelectItem value="Technical Issues">Technical Issues</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* 🔹 Payment Status */}
              <Select
                value={selectedLesson.payment_status}
                onValueChange={(value) => setSelectedLesson({ ...selectedLesson, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Not Paid">Not Paid</SelectItem>
                </SelectContent>
              </Select>

              {/* 🔹 Save Button */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditLesson}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

       
    </div>
  );
}