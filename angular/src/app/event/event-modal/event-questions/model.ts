export interface QuestionModel {
  questionText: string;
  order?: number;
  answer: string[];
  dataType: number
  obligatory: boolean
}
