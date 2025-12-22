import type {
  Student,
  CreateStudentDto,
  RequestMetrics,
} from "@/types/student";

const API_URL = "http://localhost:8000/api/students";

// ==========================================
// 1. ЧИСТЫЙ CRUD (То, что ты хотел оставить)
// ==========================================
const pureRestService = {
  async getAll(): Promise<Student[]> {
    const res = await fetch(API_URL);
    return await res.json();
  },

  async create(student: CreateStudentDto): Promise<Student> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    return await res.json();
  },

  async delete(id: number): Promise<void> {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  },
};

// ==========================================
// 2. ХЕЛПЕР ДЛЯ ЗАМЕРОВ (Специфика курсовой)
// ==========================================
async function measure<T>(
  label: string,
  action: () => Promise<T>,
): Promise<{ data: T; metrics: RequestMetrics }> {
  const start = performance.now();

  // Выполняем чистое действие
  const data = await action();

  const end = performance.now();

  // Пытаемся оценить размер данных (грубо, переводя обратно в строку)
  const rawString = JSON.stringify(data, null, 2);

  return {
    data,
    metrics: {
      method: label,
      protocol: "REST",
      duration: end - start,
      dataSize: rawString.length,
      rawResponse: rawString,
    },
  };
}

// ==========================================
// 3. ЭКСПОРТ ДЛЯ UI (Адаптер)
// ==========================================
/* 
   App.vue импортирует именно это. 
   ServicePanel получит то, что ждет (данные + метрики),
   а внутри мы вызываем чистый pureRestService.
*/
export const restService = {
  getAll() {
    return measure("Get List", () => pureRestService.getAll());
  },

  create(student: CreateStudentDto) {
    return measure("Create", () => pureRestService.create(student));
  },
};
