import type { Student, CreateStudentDto, RequestMetrics } from '@/types/student';

const SOAP_URL = 'http://localhost:8000/soap';

// Хелпер для измерения
async function measure(
  label: string,
  xmlBody: string
): Promise<{ data: any; metrics: RequestMetrics }> {
  const start = performance.now();
  const response = await fetch(SOAP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: xmlBody,
  });
  const textResponse = await response.text();
  const end = performance.now();

  return {
    data: textResponse, // Вернем сырой XML, распарсим в компоненте (или тут)
    metrics: {
      method: label,
      protocol: 'SOAP',
      duration: end - start,
      dataSize: textResponse.length, // Размер XML строки (он будет большим!)
      rawResponse: textResponse, // Покажем этот ужас пользователю
    },
  };
}

export const soapService = {
  async getAll() {
    // Формируем "конверт" для getStudents
    const xml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://www.examples.com/wsdl/StudentService.wsdl">
         <soapenv:Header/>
         <soapenv:Body>
            <tns:getStudentsRequest/>
         </soapenv:Body>
      </soapenv:Envelope>`;

    const result = await measure('Get List', xml);

    // ПАРСИНГ СПИСКА
    const parser = new DOMParser();
    const doc = parser.parseFromString(result.data, 'text/xml');
    // Ищем все теги <students> (или <tns:students> в зависимости от браузера)
    // В ответе SOAP элементы массива обычно называются одинаково, например <students>...</students> <students>...</students>
    const nodes = doc.getElementsByTagName('students'); // Имя элемента массива из WSDL
    const students: Student[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;

      const getId = (tag: string) => node.getElementsByTagName(tag)[0]?.textContent;

      students.push({
        id: Number(getId('id') || 0),
        name: getId('name') || '',
        specialization: getId('specialization') || '',
        course: Number(getId('course') || 0),
      });
    }

    return { ...result, data: students };
  },

  async create(student: CreateStudentDto) {
    const xml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://www.examples.com/wsdl/StudentService.wsdl">
         <soapenv:Header/>
         <soapenv:Body>
            <tns:createStudentRequest>
                <tns:name>${student.name}</tns:name>
                <tns:specialization>${student.specialization}</tns:specialization>
                <tns:course>${student.course}</tns:course>
            </tns:createStudentRequest>
         </soapenv:Body>
      </soapenv:Envelope>`;

    const result = await measure('Create', xml);

    // Парсинг созданного студента (если нужно) можно добавить тут
    return result;
  },
};
