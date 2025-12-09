export type Symptom = {
  id: number;
  name: string;
  slug: string;
  description: string;
  points: number;
  risk_factor: string;
  is_active: boolean;
  image_url: string;
  category?: string;
};

export type SymptomsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Symptom[];
};

