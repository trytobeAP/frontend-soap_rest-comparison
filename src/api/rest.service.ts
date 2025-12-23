import type { CreateStudentDto, RequestMetrics } from "@/types/student";

const API_URL = "http://localhost:8000/api/students";

// ==========================================
// 1. ХЕЛПЕР ДЛЯ ЗАМЕРОВ (Специфика курсовой)
// ==========================================
async function measure<T>(
  label: string,
  requestAction: () => Promise<Response>,
): Promise<{ data: T; metrics: RequestMetrics }> {
  const startTotal = performance.now();

  // 1. СЕТЬ (Скачиваем текст, но не парсим в объект)
  const response = await requestAction();
  const textData = await response.text();

  // 2. ЗАМЕР ПАРСИНГА
  const startParse = performance.now();
  const jsonData = JSON.parse(textData); // Вот это нативная скорость V8
  const endParse = performance.now();

  const endTotal = performance.now();

  // Для красоты в UI
  const rawString = JSON.stringify(jsonData, null, 2);

  return {
    data: jsonData,
    metrics: {
      method: label,
      protocol: "REST",
      duration: endTotal - startTotal,
      parsingTime: endParse - startParse, // У REST это будет почти 0
      dataSize: rawString.length,
      rawResponse: rawString,
    },
  };
}

// ==========================================
// 2. ЭКСПОРТ ДЛЯ UI (Адаптер)
// ==========================================
/* 
   App.vue импортирует именно это. 
   ServicePanel получит то, что ждет (данные + метрики),
   а внутри мы вызываем чистый pureRestService.
*/
export const restService = {
  async getAll() {
    return measure("Get List", () => fetch(API_URL));
  },

  async create(student: CreateStudentDto) {
    return measure("Create", () =>
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      }),
    );
  },
};
