import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

// ประเภทสำหรับ API Details
interface ApiDetail {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: string;
}

// ประเภทสำหรับแต่ละ Item ในระบบ DND
interface DndItem {
  id: string;
  content: string; // ระบุว่าเป็น Light หรือ Switch
  props: {
    name: string;
    apiDetails: [ApiDetail, ApiDetail[]]; // ชุดที่ 1 เป็น API หลัก ชุดที่ 2 เป็น array ของ API 2 หลายๆ ตัว
    fieldToDisplay: string;
    additionalText?: string; // ข้อความเพิ่มเติม
  };
}

// Helper function สำหรับดึงค่าจากฟิลด์ที่ซ้อนกัน
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Component สำหรับแต่ละไอเท็ม
const ItemComponent = ({
  item,
  index,
  componentsMap,
  isDndEnabled,
  onEditItem,
}: {
  item: DndItem;
  index: number;
  componentsMap: { [key: string]: React.ComponentType<any> };
  isDndEnabled: boolean;
  onEditItem: (itemId: string) => void; // ฟังก์ชันสำหรับเปิดการแก้ไข
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [api2Data, setApi2Data] = useState<any[]>([]); // เก็บข้อมูลของ API ตัวที่ 2 หลายอัน
  const [api2Loading, setApi2Loading] = useState<number | null>(null); // ใช้เก็บสถานะการโหลดของ API 2 แยกแต่ละอัน
  const [api2Error, setApi2Error] = useState<string | null>(null);

  // ฟังก์ชันสำหรับ fetch API ที่ 1
  const fetchApi1Data = async () => {
    const [api1] = item.props.apiDetails; // ใช้ API อันที่ 1
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(api1.url, {
        method: api1.method,
        ...(api1.method !== 'GET' && { body: api1.body ? JSON.stringify(JSON.parse(api1.body)) : undefined }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Error fetching API 1');
      const apiData = await response.json();
      setData(apiData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch API ที่ 1 ทุก 2 วินาที
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchApi1Data();
    }, 5000); // 5000ms หรือ 5 วินาที

    return () => clearInterval(intervalId); // ล้าง interval เมื่อ component ถูก unmount
  }, [item.props.apiDetails]);

  // ฟังก์ชันสำหรับส่ง request API ที่ 2
  const handleApi2Request = async (apiIndex: number) => {
    const [, api2Array] = item.props.apiDetails;
    const api2 = api2Array[apiIndex];
    setApi2Loading(apiIndex); // ทำให้โหลดเฉพาะปุ่มนั้น
    setApi2Error(null);
    try {
      const response = await fetch(api2.url, {
        method: api2.method,
        ...(api2.method !== 'GET' && { body: api2.body ? JSON.stringify(JSON.parse(api2.body)) : undefined }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Error fetching API 2');
      const apiData = await response.json();

      setApi2Data((prevData) => {
        const updatedData = [...prevData];
        updatedData[apiIndex] = apiData;
        return updatedData;
      });

      // หลังจากกดส่ง API 2 ให้ทำการเรียก API 1 ใหม่
      fetchApi1Data();
    } catch (error: any) {
      setApi2Error(error.message);
    } finally {
      setApi2Loading(null); // เมื่อโหลดเสร็จแล้ว
    }
  };

  return (
    <Draggable
      key={item.id}
      draggableId={item.id}
      index={index}
      isDragDisabled={!isDndEnabled}
    >
      {(provided) => (
        <div
          className="bg-white border-b-2 shadow-2xl p-4 rounded relative"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {/* ส่งข้อมูลจาก API ที่ 1 เข้าไปใน Component */}
          {componentsMap[item.content]
            ? React.createElement(componentsMap[item.content], {
              ...item.props,
              apiData: getNestedValue(data, item.props.fieldToDisplay) || 'ไม่พบข้อมูลที่ต้องการ',
            })
            : <div>Component not found</div>}

          {/* ข้อมูลที่ได้จาก API อันที่ 1 */}
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {/* ปุ่มสำหรับกดส่ง request ของ API อันที่ 2 */}
          {Array.isArray(item.props.apiDetails[1]) &&
            item.props.apiDetails[1].map((apiDetail, index) => (
              <div key={index} className="mt-4">
                <button
                  className="bg-blue-500 text-white p-2 rounded"
                  onClick={() => handleApi2Request(index)}
                  disabled={api2Loading === index} // ปิดการกดปุ่มเมื่อกำลังโหลด
                >
                  {api2Loading === index ? 'กำลังส่งข้อมูล...' : `ส่ง API 2 Request ${index + 1}`}
                </button>

                {/* แสดงผลข้อมูลจาก API อันที่ 2 หลังจากกดปุ่ม */}
                {api2Error && <div className="text-red-500 mt-2">{api2Error}</div>}
                {api2Data[index] && (
                  <div className="mt-2 p-2 bg-green-100 rounded">
                    <h3 className="text-sm">ข้อมูลจาก API 2 ({index + 1}):</h3>
                    <pre>{JSON.stringify(api2Data[index], null, 2)}</pre>
                  </div>
                )}
              </div>
            ))
          }

          {/* แสดงปุ่มแก้ไขเฉพาะเมื่อเปิด DND */}
          {isDndEnabled && (
            <button
              className="bg-yellow-500 text-white p-2 rounded mt-4"
              onClick={() => onEditItem(item.id)}
            >
              แก้ไข
            </button>
          )}

          <span
            {...provided.dragHandleProps}
            className="absolute top-0 right-0 p-2 cursor-pointer"
          >
            ⠿
          </span>
        </div>
      )}
    </Draggable>
  );
};


const LOCAL_STORAGE_KEY = "dnd-items";

const ResponsiveGridDnd = () => {
  const [items, setItems] = useState<DndItem[]>([]); // Initial state for items
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiDetails, setNewApiDetails] = useState<[ApiDetail, ApiDetail[]]>([
    { method: 'GET', url: '', body: '' },
    [],
  ]); // Array ของ API 2
  const [selectedComponent, setSelectedComponent] = useState<string>('Light'); // Default component
  const [additionalText, setAdditionalText] = useState<string>(''); // ช่องใส่ข้อความ
  const [fieldToDisplay, setFieldToDisplay] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // สำหรับการแก้ไขไอเท็ม

  // แสดง SweetAlert2 เมื่อสำเร็จ
  const showSuccessAlert = () => {
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'เพิ่ม API สำเร็จแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง',
    });
  };

  // แสดง SweetAlert2 เมื่อเกิดข้อผิดพลาด
  const showErrorAlert = (message: string) => {
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: message,
      icon: 'error',
      confirmButtonText: 'ตกลง',
    });
  };

  // Load initial items from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    setItems(reorderedItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reorderedItems));
  };

  const handleAddItem = () => {
    if (!newApiDetails[0].url.trim()) {
      showErrorAlert('กรุณาป้อน URL');
      return;
    }

    try {
      if (newApiDetails[0].body) {
        JSON.parse(newApiDetails[0].body); // ตรวจสอบ JSON ที่ป้อน
      }
    } catch (error) {
      showErrorAlert('JSON ใน body ไม่ถูกต้อง');
      return;
    }

    const newItem: DndItem = {
      id: (items.length + 1).toString(),
      content: selectedComponent, // เลือก Component จาก dropdown
      props: {
        name: `New Item ${items.length + 1}`,
        apiDetails: newApiDetails,
        fieldToDisplay,
        additionalText, // เพิ่มข้อความลงใน props
      },
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    setShowApiForm(false);
    setFieldToDisplay(''); // รีเซ็ตฟิลด์หลังจากเพิ่มไอเท็ม
    setAdditionalText(''); // รีเซ็ตข้อความ
    setSelectedComponent('Light'); // รีเซ็ต Component

    // แสดง SweetAlert หลังจากเพิ่ม API สำเร็จ
    showSuccessAlert();
  };

  // ฟังก์ชันเพิ่ม API 2 ในฟอร์ม
  const handleAddApi2 = () => {
    setNewApiDetails((prev) => {
      const updatedDetails = [...prev];
      updatedDetails[1] = [...(updatedDetails[1] as ApiDetail[]), { method: 'GET', url: '', body: '' }];
      return updatedDetails as [ApiDetail, ApiDetail[]];
    });
  };

  // ฟังก์ชันลบ API 2 ในฟอร์ม
  const handleRemoveApi2 = (index: number) => {
    setNewApiDetails((prev) => {
      const updatedDetails = [...prev];
      (updatedDetails[1] as ApiDetail[]).splice(index, 1);
      return updatedDetails as [ApiDetail, ApiDetail[]];
    });
  };

  const toggleDnd = () => {
    setIsDndEnabled(!isDndEnabled);
    setShowApiForm(false);
  };

  // ฟังก์ชันเปิดฟอร์มแก้ไขไอเท็ม
  const handleEditItem = (itemId: string) => {
    const itemToEdit = items.find((item) => item.id === itemId);
    if (itemToEdit) {
      setEditingItemId(itemId); // เปิดการแก้ไขไอเท็มที่เลือก
      setNewApiDetails(itemToEdit.props.apiDetails);
      setSelectedComponent(itemToEdit.content);
      setFieldToDisplay(itemToEdit.props.fieldToDisplay);
      setAdditionalText(itemToEdit.props.additionalText || '');
      setShowApiForm(true); // เปิดฟอร์มการแก้ไข
    }
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleSaveItem = () => {
    if (editingItemId) {
      setItems((prevItems) => {
        return prevItems.map((item) =>
          item.id === editingItemId
            ? {
              ...item,
              content: selectedComponent,
              props: {
                ...item.props,
                apiDetails: newApiDetails,
                fieldToDisplay,
                additionalText,
              },
            }
            : item
        );
      });

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      setEditingItemId(null); // เคลียร์สถานะการแก้ไข
      setShowApiForm(false);
    } else {
      handleAddItem(); // กรณีไม่ได้แก้ไขจะสร้างไอเท็มใหม่
    }
  };

  const componentsMap = {
    Light: ({ name, apiData }: { name: string; apiData: string }) => (
      <div>
        <h1>Light {name}</h1>
        <p>API Data: {apiData}</p>
      </div>
    ),
    Switch: ({ name }: { name: string }) => <div>Switch {name}</div>,
  };

  return (
    <div className="p-4">
      <button
        onClick={toggleDnd}
        className={`p-2 rounded mb-4 ${isDndEnabled ? 'bg-red-500' : 'bg-green-500'} text-white`}
      >
        {isDndEnabled ? 'ปิด DND' : 'เปิด DND'}
      </button>

      {isDndEnabled ? (
        <button
          onClick={() => setShowApiForm(true)}
          className="bg-green-500 text-white p-2 rounded mb-4 ml-4"
        >
          เพิ่มไอเท็ม
        </button>
      ) : null}

      {showApiForm && (
        <div className="mb-4 p-4 bg-gray-100 rounded shadow-md">
          <h2 className="text-xl mb-2">{editingItemId ? 'แก้ไขไอเท็ม' : 'ข้อมูล API ใหม่'}</h2>

          {/* Dropdown สำหรับเลือก Component */}
          <div className="mb-4">
            <label className="block">เลือก Component:</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="Light">Light</option>
              <option value="Switch">Switch</option>
            </select>
          </div>

          {/* ฟิลด์สำหรับใส่ชื่อหรือข้อมูลเพิ่มเติม */}
          <div className="mb-4">
            <label className="block">ข้อมูลเพิ่มเติม:</label>
            <input
              type="text"
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="ข้อความเพิ่มเติม (ไม่จำเป็น)"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-lg">API ชุดที่ 1 (API หลัก)</h3>
            <div className="mb-2">
              <label className="block">Method:</label>
              <select
                value={newApiDetails[0].method}
                onChange={(e) => {
                  const updatedApiDetails = [...newApiDetails];
                  (updatedApiDetails[0] as ApiDetail).method = e.target.value as ApiDetail['method'];
                  setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                }}
                className="p-2 border rounded"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block">API URL:</label>
              <input
                type="text"
                value={newApiDetails[0].url}
                onChange={(e) => {
                  const updatedApiDetails = [...newApiDetails];
                  (updatedApiDetails[0] as ApiDetail).url = e.target.value;
                  setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                }}
                className="p-2 border rounded w-full"
              />
            </div>
            {newApiDetails[0].method !== 'GET' && (
              <div className="mb-2">
                <label className="block">Body (JSON):</label>
                <textarea
                  value={newApiDetails[0].body}
                  onChange={(e) => {
                    const updatedApiDetails = [...newApiDetails];
                    (updatedApiDetails[0] as ApiDetail).body = e.target.value;
                    setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                  }}
                  className="p-2 border rounded w-full"
                />
              </div>
            )}
          </div>

          <h3 className="text-lg mb-2">API ชุดที่ 2 (หลาย API)</h3>
          {Array.isArray(newApiDetails[1]) &&
            newApiDetails[1].map((apiDetail, index) => (
              <div key={index} className="mb-4">
                <div className="mb-2">
                  <label className="block">Method (API {index + 1}):</label>
                  <select
                    value={apiDetail.method}
                    onChange={(e) => {
                      const updatedApiDetails = [...newApiDetails];
                      updatedApiDetails[1][index].method = e.target.value as ApiDetail['method'];
                      setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                    }}
                    className="p-2 border rounded"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block">API URL:</label>
                  <input
                    type="text"
                    value={apiDetail.url}
                    onChange={(e) => {
                      const updatedApiDetails = [...newApiDetails];
                      updatedApiDetails[1][index].url = e.target.value;
                      setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                    }}
                    className="p-2 border rounded w-full"
                  />
                </div>
                {apiDetail.method !== 'GET' && (
                  <div className="mb-2">
                    <label className="block">Body (JSON):</label>
                    <textarea
                      value={apiDetail.body}
                      onChange={(e) => {
                        const updatedApiDetails = [...newApiDetails];
                        updatedApiDetails[1][index].body = e.target.value;
                        setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                      }}
                      className="p-2 border rounded w-full"
                    />
                  </div>
                )}

                {/* ปุ่มลบ API 2 */}
                <button
                  className="bg-red-500 text-white p-2 rounded mt-2"
                  onClick={() => handleRemoveApi2(index)}
                >
                  ลบ API 2 ({index + 1})
                </button>
              </div>
            ))
          }


          {/* ปุ่มเพิ่ม API 2 */}
          <button
            className="bg-blue-500 text-white p-2 rounded"
            onClick={handleAddApi2}
          >
            เพิ่ม API 2
          </button>

          <div className="mb-4 mt-4">
            <label className="block">ฟิลด์ที่ต้องการแสดงผลจาก API:</label>
            <input
              type="text"
              value={fieldToDisplay}
              onChange={(e) => setFieldToDisplay(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="เช่น message หรือ received.recieve"
            />
          </div>

          <button
            onClick={handleSaveItem}
            className="bg-blue-500 text-white p-2 rounded mt-2"
          >
            {editingItemId ? 'บันทึกการแก้ไข' : 'เพิ่มไอเท็มใหม่'}
          </button>
        </div>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="droppable-grid" direction="vertical">
          {(provided) => (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 user-select-none"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {items.map((item, index) => (
                <ItemComponent
                  key={item.id}
                  item={item}
                  index={index}
                  componentsMap={componentsMap}
                  isDndEnabled={isDndEnabled} // ส่งผ่านสถานะนี้ไปเพื่อควบคุมการ DnD
                  onEditItem={handleEditItem} // ส่งฟังก์ชันแก้ไขไปด้วย
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ResponsiveGridDnd;
