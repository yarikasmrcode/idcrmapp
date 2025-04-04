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
    username: string;
  };
  teacher?: {
    full_name: string;
  }; // optional if you're planning to display teacher names
}
export interface Teacher {
  id: string;
  full_name: string;
}
