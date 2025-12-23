export interface Student {
  id: number;
  name: string;
  specialization: string;
  course: number;
}

export type CreateStudentDto = Omit<Student, "id">;

// Интерфейс для результата запроса (чтобы показать в UI)
export interface RequestMetrics {
  method: string;
  protocol: "REST" | "SOAP";
  duration: number;
  parsingTime: number;
  dataSize: number;
  rawResponse: string;
}
