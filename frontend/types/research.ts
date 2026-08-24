export interface CreateResearchResponse {
  job_id: string;
  status: string;
  message: string;
}

export interface ResearchJob {
  job_id: string;
  query: string;
  status: string;
  progress: number;
  current_step: string;
  summary: string;
  report: string;
  error: string;
}