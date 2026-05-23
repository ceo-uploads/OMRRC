export interface OMRQuestion {
  index: number;
  studentAnswer: string; // "A", "B", "C", "D", or "" (blank)
  actualAnswer: string;   // "A", "B", "C", "D"
  isCorrect: boolean;
}

export interface OMRScanResult {
  id: string;
  timestamp: string;
  headerText: string;
  studentName: string;
  rollNumber: string;
  otherInfo: string;
  questions: OMRQuestion[];
  totalNumOfQuestions: number;
  totalAnswered: number;
  correctAnswers: number;
  obtainedMark: number; // calculated as correctAnswers
  maxMark: number;      // total questions count
  studentImageSnippet?: string; // a high-contrast base64 or small preview thumb
}

export interface AnswerPreset {
  id: string;
  name: string;
  questionCount: number;
  answers: { [key: number]: string }; // e.g. { 1: "A", 2: "C", ... }
}

export type AppTab = "scanner" | "results" | "history" | "settings";

export type AppLanguage = "en" | "bn";

export interface Translations {
  appName: string;
  bottomNavScanner: string;
  bottomNavResults: string;
  bottomNavHistory: string;
  bottomNavSettings: string;
  uploadSectionTitle: string;
  uploadRefText: string;
  uploadExaminedText: string;
  formatNote: string;
  orUsePreset: string;
  createPresetBtn: string;
  presetSelectPlaceholder: string;
  runAnalysisBtn: string;
  noInternetWarning: string;
  mismatchAlert: string;
  invalidFileFormat: string;
  presetsTitle: string;
  numQuestions: string;
  savePreset: string;
  optionLabel: string;
  resultViewMode: string;
  resultViewDocs: string;
  resultViewTable: string;
  studentNameLabel: string;
  rollNumberLabel: string;
  otherInfoLabel: string;
  tableHeaderIndex: string;
  tableHeaderStudent: string;
  tableHeaderActual: string;
  tableHeaderStatus: string;
  correct: string;
  incorrect: string;
  blank: string;
  totalQuestions: string;
  totalAnswered: string;
  obtainedMarkLabel: string;
  obtainedMarkScore: string;
  downloadPdfBtn: string;
  previousResults: string;
  noHistory: string;
  pageText: string;
  settingsTitle: string;
  languageLabel: string;
  termsTitle: string;
  termsContent: string;
  securityTitle: string;
  securityContent: string;
  socialFollow: string;
  adsenseTitle: string;
  clickLimitAd: string;
  mockAdText: string;
}
