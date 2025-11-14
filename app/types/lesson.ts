export interface LessonCard {
  type: "info" | "mcq";
  title?: string;
  text?: string;
  question?: string;
  options?: string[];
  answer?: number;
  correctFeedback?: string;
  incorrectFeedback?: string;
}

