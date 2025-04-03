"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lesson } from "@/lib/types";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]); // ✅ Add type here
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]); // ✅ Initialize teachers state

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(null);
    const [selectedLessonStatus, setSelectedLessonStatus] = useState(null);
      
      
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLessons = lessons.filter((lesson) => {
    const matchesTeacher = !selectedTeacher || lesson.teacher_id === selectedTeacher;
    const matchesStudent = !selectedStudent || lesson.student_id === selectedStudent;
    const matchesPayment = !selectedPaymentStatus || lesson.payment_status === selectedPaymentStatus;
    const matchesStatus = !selectedLessonStatus || lesson.status === selectedLessonStatus;
  
    const matchesSearch =
      searchQuery === "" ||
      (lesson.student?.username && lesson.student.username.toLowerCase().includes(searchQuery.toLowerCase()));
  
    return matchesTeacher && matchesStudent && matchesPayment && matchesStatus && matchesSearch;
  });

  function handleEditClick(lesson: Lesson) {
    const studentInfo = students.find((s) => s.id === lesson.student_id);
  
    setSelectedLesson({
      ...lesson,
      student_id: lesson.student?.id || lesson.student_id || "",
      student: studentInfo ? studentInfo : { id: "", full_name: "Select Student" }
    });
  
    setEditDialogOpen(true);
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
        teacher_id: selectedLesson.teacher_id, // Add teacher_id to the request
        type: selectedLesson.type,
        duration: parseInt(selectedLesson.duration),
        time_slot: selectedLesson.time_slot ? new Date(selectedLesson.time_slot).toISOString() : null,
        status: selectedLesson.status,
        payment_status: selectedLesson.payment_status,
        reasonforcancellation: selectedLesson.status === "Cancelled" ? selectedLesson.reasonforcancellation : null,
      }),
    });
  
    const updatedLesson = await response.json();
    console.log("🟢 API Response:", updatedLesson);
  
    if (response.ok) {
      // 🔥 Find the student name from the students array
      const studentInfo = students.find((s) => s.id === updatedLesson.student_id);
  
      // 🔥 Find the teacher name from the teachers array
      const teacherInfo = teachers.find((t) => t.id === updatedLesson.teacher_id);
  
      // 🔥 Update the lesson state immediately with correct student and teacher names
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.id === updatedLesson.id
            ? {
                ...updatedLesson,
                student: studentInfo ? studentInfo : { full_name: "Unknown" },
                teacher: teacherInfo ? teacherInfo : { full_name: "Unknown" }, // Add teacher object
              }
            : lesson
        )
      );
  
      setEditDialogOpen(false);
    } else {
      console.error("❌ Error updating lesson:", updatedLesson);
    }
  }
  // ✅ Fetch lessons from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
  
        const [studentsRes, lessonsRes, teachersRes] = await Promise.all([
          fetch("/api/admin/students"),
          fetch("/api/admin/lessons"),
          fetch("/api/admin/teachers")
        ]);
  
        const [studentsData, lessonsData, teachersData] = await Promise.all([
          studentsRes.json(),
          lessonsRes.json(),
          teachersRes.json()
        ]);
  
        setStudents(studentsData);
        setLessons(lessonsData);
        setTeachers(teachersData || []);
        
        console.log("🟢 Students Fetched:", studentsData);
        console.log("🟢 Lessons Fetched:", lessonsData);
        console.log("🟢 Teachers Fetched:", teachersData);
  
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, []); // ✅ Keep empty dependency array (Runs only once)
  
  

  if (loading) return <p className="text-center">Loading lessons...</p>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center sm:text-left">
          All Lessons (Admin View)
        </h2>
  
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by student username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-200 transition-all"
          />
  
          {/* Filter by Teacher */}
          <Select
            value={selectedTeacher || "all"}
            onValueChange={(value) => setSelectedTeacher(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-64 p-3 bg-white border border-gray-300 rounded-lg">
              <SelectValue placeholder="Filter by Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
  
          {/* Filter by Student */}
          <Select
            value={selectedStudent || "all"}
            onValueChange={(value) => setSelectedStudent(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-64 p-3 bg-white border border-gray-300 rounded-lg">
              <SelectValue placeholder="Filter by Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
  
          {/* Filter by Payment Status */}
          <Select
            value={selectedPaymentStatus || "all"}
            onValueChange={(value) => setSelectedPaymentStatus(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-64 p-3 bg-white border border-gray-300 rounded-lg">
              <SelectValue placeholder="Filter by Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Not Paid">Not Paid</SelectItem>
            </SelectContent>
          </Select>
  
          {/* Filter by Lesson Status */}
          <Select
            value={selectedLessonStatus || "all"}
            onValueChange={(value) => setSelectedLessonStatus(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-64 p-3 bg-white border border-gray-300 rounded-lg">
              <SelectValue placeholder="Filter by Lesson Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
  
        {/* Lessons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLessons.map((lesson, index) => (
            <Card
              key={lesson.id || `temp-${index}`}
              className="flex flex-col justify-between p-2 rounded-lg shadow-sm border border-gray-300 hover:shadow-md hover:border-gray-300 transition-all duration-200 w-full aspect-square" // Square aspect ratio
            >
              {/* Student & Teacher Name */}
              <CardHeader className="flex flex-col items-center text-center">
                <CardTitle className="text-sm font-semibold text-gray-900 flex flex-col items-center gap-1">
                  <span>🎓 {lesson.student?.full_name || "Unknown"}</span>
                  <span className="text-xs text-gray-500">
                    with {lesson.teacher?.full_name || "Unknown"}
                  </span>
                </CardTitle>
              </CardHeader>
  
              {/* Lesson Details */}
              <CardContent className="flex flex-col space-y-1 text-left text-sm">
                <p className="text-gray-700">
                  <strong className="text-gray-900">Type:</strong> {lesson.type}
                </p>
                <p className="text-gray-700 break-words">
                  <strong className="text-gray-900">Lesson Link:</strong>{" "}
                  {lesson.lessonlink}
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Duration:</strong>{" "}
                  {lesson.duration} mins
                </p>
                <p className="text-gray-700 break-all">
                  <strong className="text-gray-900">Time:</strong>{" "}
                  {lesson.time_slot
                    ? new Date(lesson.time_slot).toLocaleString()
                    : "Not set"}
                </p>
                <p
                  className={`font-semibold ${
                    lesson.status === "Cancelled"
                      ? "text-red-600"
                      : lesson.status === "Completed"
                      ? "text-green-600"
                      : "text-gray-900"
                  }`}
                >
                  <strong>Status:</strong> {lesson.status}
                </p>
  
                {/* Reason for Cancellation */}
                {lesson.status === "Cancelled" && lesson.reasonforcancellation && (
                  <p className="text-xs font-semibold text-red-500 bg-red-100 p-1 rounded">
                    <strong>Reason:</strong> {lesson.reasonforcancellation}
                  </p>
                )}
  
                <p
                  className={`font-semibold ${
                    lesson.payment_status === "Not Paid"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  <strong>Payment:</strong> {lesson.payment_status}
                </p>
              </CardContent>
  
              {/* Edit & Delete Buttons */}
              <DialogFooter className="flex justify-start gap-2 mt-2">
                <Button
                  variant="outline"
                  className="p-1 border-gray-300 hover:bg-gray-100"
                  onClick={() => handleEditClick(lesson)}
                >
                  <Pencil className="h-5 w-5 text-gray-700" />
                </Button>
              </DialogFooter>
            </Card>
          ))}
        </div>
  
        {/* Edit Lesson Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-lg p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Edit Lesson
              </DialogTitle>
            </DialogHeader>
            {selectedLesson && (
              <div className="space-y-4">
                {/* Select Student */}
                <Select
                  value={selectedLesson?.student_id || ""}
                  onValueChange={(value) => {
                    const studentInfo = students.find((s) => s.id === value);
                    setSelectedLesson((prev) => ({
                      ...prev,
                      student_id: value,
                      student: studentInfo || { id: "", full_name: "Unknown" },
                    }));
                  }}
                >
                  <SelectTrigger className="w-full p-3 border-gray-300 rounded-lg">
                    <SelectValue>
                      {students.find((s) => s.id === selectedLesson?.student_id)
                        ?.full_name || "Select Student"}
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
  
                {/* Lesson Type */}
                <Select
                  value={selectedLesson.type}
                  onValueChange={(value) =>
                    setSelectedLesson({ ...selectedLesson, type: value })
                  }
                >
                  <SelectTrigger className="w-full p-3 border-gray-300 rounded-lg">
                    <SelectValue placeholder="Lesson Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trial">Trial</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
  
                {/* Duration */}
                <Select
                  value={selectedLesson.duration.toString()}
                  onValueChange={(value) =>
                    setSelectedLesson({
                      ...selectedLesson,
                      duration: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="w-full p-3 border-gray-300 rounded-lg">
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 mins</SelectItem>
                    <SelectItem value="45">45 mins</SelectItem>
                    <SelectItem value="60">60 mins</SelectItem>
                  </SelectContent>
                </Select>
  
                {/* Time Slot */}
                <input
                  type="datetime-local"
                  value={
                    selectedLesson.time_slot
                      ? new Date(selectedLesson.time_slot)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedLesson({ ...selectedLesson, time_slot: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
  
                {/* Status */}
                <Select
                  value={selectedLesson.status}
                  onValueChange={(value) =>
                    setSelectedLesson((prev) => ({
                      ...prev,
                      status: value,
                      reasonforcancellation:
                        value === "Cancelled" ? prev.reasonforcancellation || "" : "",
                    }))
                  }
                >
                  <SelectTrigger className="w-full p-3 border-gray-300 rounded-lg">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
  
                {/* Reason for Cancellation */}
                {selectedLesson.status === "Cancelled" && (
                  <Select
                    value={selectedLesson.reasonforcancellation || ""}
                    onValueChange={(value) =>
                      setSelectedLesson({
                        ...selectedLesson,
                        reasonforcancellation: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full p-3 border-gray-300 rounded-lg">
                      <SelectValue placeholder="Select Cancellation Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student No Show">Student No Show</SelectItem>
                      <SelectItem value="Teacher Unavailable">
                        Teacher Unavailable
                      </SelectItem>
                      <SelectItem value="Technical Issues">Technical Issues</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
  
                {/* Payment Status */}
                <Select
                  value={selectedLesson.payment_status}
                  onValueChange={(value) =>
                    setSelectedLesson({ ...selectedLesson, payment_status: value })
                  }
                >
                  <SelectTrigger className="w-full p-3 border-gray-300 rounded-lg">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Not Paid">Not Paid</SelectItem>
                  </SelectContent>
                </Select>
  
                {/* Dialog Footer */}
                <DialogFooter className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="px-4 py-2 border-gray-300 hover:bg-gray-100"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="px-4 py-2 bg-gray-400 text-white hover:bg-gray-500"
                    onClick={handleEditLesson}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
