export interface Lesson {
  id: string;
  type: string;
  lessonlink: string;
  duration: number;
  time_slot: string;
  status: string;
  payment_status: string;
  reasonforcancellation?: string;
  student_id: string;
  teacher_id: string;
  student?: {
    full_name: string;
    username?: string; // ✅ Add this line!
  };
  teacher?: {
    full_name: string;
  };
}
