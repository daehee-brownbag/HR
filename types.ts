
export interface GrowthLog {
  week: number;
  date: string;
  employee: string;
  goal: string;
  behavior: string;
  metrics: string[];
  score: number;
  feedback: string;
  opinion: string;
}

export interface Metric {
  id: string;
  label: string;
  header: string; // Google Sheet header name
}