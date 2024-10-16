import { useState } from 'react';
import { handleApiRequest } from '../service/recieve_get_and_do';

const ApiInputPage = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [response, setResponse] = useState<any>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async () => {
    const num = parseInt(inputValue, 10);

    if (isNaN(num)) {
      alert('กรุณากรอกตัวเลขที่ถูกต้อง');
      return;
    }

    try {
      const result = await handleApiRequest(num);
      setResponse(result);
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">กรอกตัวเลขเพื่อส่ง API Request</h1>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="กรอกตัวเลข"
        className="border border-gray-300 p-2 rounded w-full mb-4"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
      >
        ส่ง
      </button>

      {response && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">ผลลัพธ์จาก API:</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiInputPage;
