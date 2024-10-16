import axios from 'axios';

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

    // สร้างการตั้งค่า request สำหรับ axios
    const config = {
      method: method,
      url: url,
      headers: {
        'Content-Type': 'application/json',
        ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
      },
      data: body ? JSON.parse(body) : undefined,
    };

    // ส่ง request ไปยัง API
    const response = await axios(config);
    console.log(`ผลลัพธ์จาก API สำหรับตัวเลข ${num}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการส่ง request:', error);
  }
};
