export interface CandidateOption {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  latest_cv_id: string | null;
  created_at: string;
  created_by: string | null;
  created_by_name: string | null;
  updated_at: string;
  updated_by: string | null;
  updated_by_name: string | null;
  personas: {
    persona_id: string;
    persona_name: string;
  }[] | null;
  cvs: {
    id: string;
    original_document_filename: string;
    file_hash: string;
    version: number;
    s3_url: string;
    cv_text?: string | null;
  }[] | null;
}
