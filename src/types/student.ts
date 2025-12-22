export interface Student {
  id: number;
  name: string;
  specialization: string;
  course: number;
}

export type CreateStudentDto = Omit<Student, 'id'>;

// Интерфейс для результата запроса (чтобы показать в UI)
export interface RequestMetrics {
  method: string; // "GET List" или "CREATE"
  protocol: 'REST' | 'SOAP';
  duration: number; // миллисекунды
  dataSize: number; // байты (примерно)
  rawResponse: string; // то, что реально пришло (JSON или XML string)
}
