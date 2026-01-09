type BaseLessonCard = {
  correctFeedback?: string;
  incorrectFeedback?: string;
};

export type InfoLessonCard = BaseLessonCard & {
  type: "info";
  title?: string;
  text?: string;
};

export type MultipleChoiceLessonCard = BaseLessonCard & {
  type: "mcq";
  question: string;
  options: string[];
  answer: number;
};

export type SequenceOption = {
  id: string;
  label: string;
  image?: any;
};

export type SequenceLessonCard = BaseLessonCard & {
  type: "sequence";
  question: string;
  orderOptions: SequenceOption[];
  correctOrder: string[];
  prompt?: string;
};

export type LessonCard =
  | InfoLessonCard
  | MultipleChoiceLessonCard
  | SequenceLessonCard;
