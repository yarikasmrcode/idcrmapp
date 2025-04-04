"use client";

import { useState, useEffect } from "react";
import { addDays, format, startOfWeek, parseISO, addHours } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trash2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Lesson, Student } from "@/lib/types";

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

type Slot = {
  day: string;
  time: string;
  lesson: Lesson | null;
};


export default function TeacherSchedule() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [newLesson, setNewLesson] = useState({ student: "", type: "", duration: "" });

  useEffect(() => {
    async function fetchLessons() {
      try {
        const response = await fetch("/api/lessons");
        if (!response.ok) throw new Error("Failed to fetch lessons");
        const lessonsData = await response.json();
        setLessons(lessonsData);
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

  const handleSlotClick = (
    day: string,
    time: string,
    lesson: Lesson | null = null
  ) => {
    setSelectedSlot({ day, time, lesson });
  };
  

  async function handleAddLesson() {
    if (!newLesson.student || !newLesson.type || !newLesson.duration || !selectedSlot) return;
    
    const formattedDate = format(new Date(selectedSlot.day), "yyyy-MM-dd");
    const formattedHour = selectedSlot.time.padStart(5, "0");
    const timeSlot = new Date(`${formattedDate}T${formattedHour}:00Z`).toISOString();
  
    const response = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: newLesson.student,
        type: newLesson.type,
        duration: parseInt(newLesson.duration),
        time_slot: timeSlot,
      }),
    });
  
    if (response.ok) {
      const newLessonData = await response.json();
      setLessons((prev) => [...prev, newLessonData]);
      setSelectedSlot(null);
      setNewLesson({ student: "", type: "", duration: "" });
    } else {
      console.error("❌ Error adding lesson:", await response.json());
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-8 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-3 text-center font-bold">Time</div>
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="bg-gray-100 p-3 text-center font-bold">
            {format(day, "EEE dd")}
          </div>
        ))}
        {hours.map((hour) => (
          <div key={hour} className="contents">
            <div className="border border-gray-200 p-3 text-center font-bold">{hour}</div>
            {weekDays.map((day) => {
              const slotKey = `${day.toISOString()}-${hour}`;
              return (
                <div
                  key={slotKey}
                  className="border border-gray-200 p-2 h-12 flex items-center justify-center cursor-pointer rounded-md hover:bg-gray-100"
                  onClick={() => handleSlotClick(day.toISOString(), hour)}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add Lesson</DialogTitle>
          </DialogHeader>
          <Select onValueChange={(value) => setNewLesson({ ...newLesson, student: value })}>
            <SelectTrigger className="border p-3 rounded-lg w-full">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md rounded-lg">
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>{student.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setNewLesson({ ...newLesson, type: value })}>
            <SelectTrigger className="border p-3 rounded-lg w-full">
              <SelectValue placeholder="Select Lesson Type" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-md rounded-lg">
              <SelectItem value="Trial">Trial</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Group">Group</SelectItem>
              <SelectItem value="Speaking Club">Speaking Club</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Duration (minutes)" type="number" onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })} />
          <DialogFooter>
            <Button className="bg-black text-white rounded-lg" onClick={handleAddLesson}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}