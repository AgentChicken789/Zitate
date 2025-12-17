export interface Quote {
  id: string;
  name: string;
  text: string;
  type: "Teacher" | "Student";
  timestamp: number; // Unix timestamp
}
