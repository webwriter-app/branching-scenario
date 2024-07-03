export interface QuizBranch {
  drawflowNodeId: number;
  title: string;
  question: string;
  answers: Answer[];
  answerLinks: [number, Link][];
}

export interface Answer {
  id: number;
  text: string;
  targetPageId: string;
  //targetPageInputClass: string;
  isCorrect: boolean;
}

export interface Page {
  drawflowNodeId: number;
  title: string;
  links: Link[];
}

export interface Link {
  targetPageId: number;
}

//TODO: change this from tuple array to better structure
export class Gamebook {
  title: string;
}
