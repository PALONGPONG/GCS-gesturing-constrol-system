import axios from 'axios';

// ฟังก์ชันตรวจสอบและแปลง JSON
const parseJsonSafely = (data: any) => {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.warn('ข้อมูลไม่เป็น JSON ที่ถูกต้อง:', data);
    return {}; // คืนค่าเป็นอ็อบเจ็กต์ว่างถ้าไม่ใช่ JSON ที่ถูกต้อง
  }
};

// ฟังก์ชันที่จะทำการดึง API จาก localStorage และส่ง request ตามตัวเลขที่รับเข้ามา
export const handleApiRequest = async (num: number) => {
  try {
    // ดึงข้อมูล API ที่ถูกบันทึกไว้จาก localStorage
    const storedSelection = localStorage.getItem('apiSelection');

    if (!storedSelection) {
      console.error('ไม่มีข้อมูล API ที่ถูกบันทึกไว้ใน localStorage');
      return;
    }

    // แปลงข้อมูลจาก localStorage เป็นออบเจ็กต์
    const selection = JSON.parse(storedSelection);

    // ตรวจสอบว่ามี API ที่ถูกบันทึกไว้สำหรับตัวเลขนี้หรือไม่
    const selectedApi = selection[num];

    if (!selectedApi) {
      console.error(`ไม่มี API ที่ถูกบันทึกไว้สำหรับตัวเลข ${num}`);
      return;
    }

    const { method, url, body, bearerToken } = selectedApi.apiDetail;

    // ใช้ parseJsonSafely กับ body
    const data = parseJsonSafely(body);

    // สร้างการตั้งค่า request สำหรับ axios
    const config = {
      method: method,
      url: url,
      headers: {
        'Content-Type': 'application/json',
        ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
      },
      data: data,
    };

    // ส่ง request ไปยัง API
    const response = await axios(config);
    console.log(`ผลลัพธ์จาก API สำหรับตัวเลข ${num}:`, response.data);
    return response.data;
  } catch (error) {
    
      // console.error('เกิดข้อผิดพลาดในการส่ง request:', error.response.data);
    
  }
};
