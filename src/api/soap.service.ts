import type {
  Student,
  CreateStudentDto,
  RequestMetrics,
} from "@/types/student";

const SOAP_URL = "http://localhost:8000/soap";

// Добавил <T> (Generic), чтобы measure мог возвращать любой тип
async function measure<T>(
  label: string,
  xmlBody: string,
  parseLogic: (rawXml: string) => T, // Теперь возвращает T, а не жестко массив
): Promise<{ data: T; metrics: RequestMetrics }> {
  const startTotal = performance.now();

  const response = await fetch(SOAP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/xml" },
    body: xmlBody,
  });
  const textResponse = await response.text();

  const startParse = performance.now();
  const parsedData = parseLogic(textResponse);
  const endParse = performance.now();

  const endTotal = performance.now();

  return {
    data: parsedData,
    metrics: {
      method: label,
      protocol: "SOAP",
      duration: endTotal - startTotal,
      parsingTime: endParse - startParse,
      dataSize: textResponse.length,
      rawResponse: textResponse,
    },
  };
}

export const soapService = {
  // GET ALL возвращает Student[] (массив)
  async getAll() {
    const xml = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://www.examples.com/wsdl/StudentService.wsdl">
         <soapenv:Header/>
         <soapenv:Body><tns:getStudentsRequest/></soapenv:Body>
      </soapenv:Envelope>`;

    // Тут мы говорим TS, что ожидаем массив <Student[]>
    return measure<Student[]>("Get List", xml, (rawXml) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawXml, "text/xml");
      const nodes = doc.getElementsByTagName("students");
      const students: Student[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;

        const getId = (tag: string) =>
          node.getElementsByTagName(tag)[0]?.textContent;

        students.push({
          id: Number(getId("id") || 0),
          name: getId("name") || "",
          specialization: getId("specialization") || "",
          course: Number(getId("course") || 0),
        });
      }
      return students;
    });
  },

  // CREATE возвращает просто any или Student (тут мы пока ленимся парсить XML ответа)
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

    // Здесь возвращаем строку (сырой ответ), поэтому <string> или <any>
    return measure<any>("Create", xml, (rawXml) => {
      // Если бы мы хотели быть честными, надо было бы распарсить ID созданного студента.
      // Но пока вернем просто сырой XML для логов, так как UI обновляет список отдельным запросом.
      return rawXml;
    });
  },
};
