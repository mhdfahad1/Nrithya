export interface PerformanceRootObject {
  success: boolean;
  payload: Payload;
}

export interface Payload {
  metadata: Metadata;
  data: Datum[];
}

export interface Metadata {
  totalcount: number;
}

export interface Datum {
  first_name: string;
  last_name: string;
  gender: string;
  total: number;
  attended: number;
  leaves: number;
  attendace_percent: number;
  assignments: number;
  trueassignments: number;
  assignment_percent: number;
  performance: number;
}
