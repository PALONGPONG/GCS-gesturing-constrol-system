import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2'; 

interface ApiDetail {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: string;
  bearerToken?: string;
  buttonLabel?: string;
  buttonColor?: string;
}

interface DndItem {
  id: string;
  content: string;
  props: {
    name: string;
    apiDetails: [ApiDetail, ApiDetail[]];
    fieldToDisplay: string;
    additionalText?: string;
  };
}

// Helper function
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const validateAndFixJson = (body: string): string | null => {
  if (!body.trim()) return '{}'; // ถ้าว่างให้ใส่เป็น JSON เปล่า
  try {
    JSON.parse(body);
    return body;
  } catch (error) {
    if (!body.startsWith('{')) {
      body = `{${body}`;
    }
    if (!body.endsWith('}')) {
      body = `${body}}`;
    }
    try {
      JSON.parse(body);
      return body;
    } catch (error) {
      return null;
    }
  }
};

const ItemComponent = ({
  item,
  index,
  componentsMap,
  isDndEnabled,
  onEditItem,
  onRemoveItem,
}: {
  item: DndItem;
  index: number;
  componentsMap: { [key: string]: React.ComponentType<any> };
  isDndEnabled: boolean;
  onEditItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [api2Data, setApi2Data] = useState<any[]>([]);
  const [api2Loading, setApi2Loading] = useState<number | null>(null);
  const [api2Error, setApi2Error] = useState<string | null>(null);

  const fetchApi1Data = async () => {
    const [api1] = item.props.apiDetails;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(api1.url, {
        method: api1.method,
        ...(api1.method !== 'GET' && { body: api1.body ? JSON.stringify(JSON.parse(api1.body)) : undefined }),
        headers: {
          'Content-Type': 'application/json',
          ...(api1.bearerToken && { Authorization: `Bearer ${api1.bearerToken}` }),
        },
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

  useEffect(() => {
    fetchApi1Data();
    const intervalId = setInterval(() => {
      fetchApi1Data();
    }, 10000); 

    return () => clearInterval(intervalId);
  }, [item.props.apiDetails]);

  const handleApi2Request = async (apiIndex: number) => {
    const [, api2Array] = item.props.apiDetails;
    const api2 = api2Array[apiIndex];
    setApi2Loading(apiIndex);
    setApi2Error(null);
    try {
      const response = await fetch(api2.url, {
        method: api2.method,
        ...(api2.method !== 'GET' && { body: api2.body ? JSON.stringify(JSON.parse(api2.body)) : undefined }),
        headers: {
          'Content-Type': 'application/json',
          ...(api2.bearerToken && { Authorization: `Bearer ${api2.bearerToken}` }),
        },
      });
      if (!response.ok) throw new Error('Error fetching API 2');
      const apiData = await response.json();

      setApi2Data((prevData) => {
        const updatedData = [...prevData];
        updatedData[apiIndex] = apiData;
        return updatedData;
      });

      fetchApi1Data();
    } catch (error: any) {
      setApi2Error(error.message);
    } finally {
      setApi2Loading(null);
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
          {componentsMap[item.content]
            ? React.createElement(componentsMap[item.content], {
              ...item.props,
              apiData: getNestedValue(data, item.props.fieldToDisplay) || 'ไม่พบข้อมูลที่ต้องการ',
            })
            : <div>Component not found</div>}

          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {Array.isArray(item.props.apiDetails[1]) &&
            item.props.apiDetails[1].map((apiDetail, index) => (
              <div key={index} className="mt-4">
                <button
                  className="bg-gray-400 border-2 p-2 rounded-xl w-full"
                  onClick={() => handleApi2Request(index)}
                  disabled={api2Loading === index}
                  style={{ backgroundColor: apiDetail.buttonColor || '#0000ff' }}
                >
                  {api2Loading === index ? 'กำลังส่งข้อมูล...' : apiDetail.buttonLabel || `ส่ง API 2 Request ${index + 1}`}
                </button>
              </div>
            ))}

          {isDndEnabled && (
            <>
              <button
                className="bg-yellow-500 text-white p-2 rounded mt-4"
                onClick={() => onEditItem(item.id)}
              >
                แก้ไข
              </button>

              <button
                className="bg-red-500 text-white p-2 rounded mt-4 ml-2"
                onClick={() => onRemoveItem(item.id)}
              >
                ลบ
              </button>
            </>
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
  const [items, setItems] = useState<DndItem[]>([]);
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiDetails, setNewApiDetails] = useState<[ApiDetail, ApiDetail[]]>([
    { method: 'GET', url: '', body: '', bearerToken: '', buttonLabel: '' }, 
    [],
  ]);
  const [selectedComponent, setSelectedComponent] = useState<string>('Light');
  const [itemName, setItemName] = useState<string>(''); // เพิ่ม state สำหรับชื่อ
  const [additionalText, setAdditionalText] = useState<string>('');
  const [fieldToDisplay, setFieldToDisplay] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const handleRemoveItem = (itemId: string) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบไอเท็มนี้ใช่หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
        Swal.fire('ลบสำเร็จ!', 'ไอเท็มถูกลบออกแล้ว', 'success');
      }
    });
  };

  const showSuccessAlert = () => {
    Swal.fire({
      title: 'สำเร็จ!',
      text: 'เพิ่ม API สำเร็จแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง',
    });
  };

  const showErrorAlert = (message: string) => {
    Swal.fire({
      title: 'เกิดข้อผิดพลาด!',
      text: message,
      icon: 'error',
      confirmButtonText: 'ตกลง',
    });
  };

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

  const handleSaveItem = () => {
    const fixedBody = validateAndFixJson(newApiDetails[0].body || '');
    if (!fixedBody) {
      showErrorAlert('JSON ใน body ไม่ถูกต้อง');
      return;
    }

    const fixedApi2Details = newApiDetails[1].map((apiDetail) => {
      const fixedApi2Body = validateAndFixJson(apiDetail.body || '');
      if (!fixedApi2Body) {
        showErrorAlert('JSON ใน body ของ API 2 ไม่ถูกต้อง');
        return null;
      }
      return { ...apiDetail, body: fixedApi2Body };
    });

    if (fixedApi2Details.includes(null)) return; // ถ้าแก้ JSON ไม่สำเร็จ หยุดการบันทึก

    const updatedApiDetails: [ApiDetail, ApiDetail[]] = [
      { ...newApiDetails[0], body: fixedBody },
      fixedApi2Details as ApiDetail[],
    ];

    if (editingItemId) {
      const updatedItems = items.map((item) =>
        item.id === editingItemId
          ? {
            ...item,
            content: selectedComponent,
            props: {
              ...item.props,
              name: itemName, // เพิ่มการบันทึกชื่อ
              apiDetails: updatedApiDetails,
              fieldToDisplay,
              additionalText,
            },
          }
          : item
      );

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
      setItems(updatedItems);
      resetForm();
    } else {
      handleAddItem(updatedApiDetails);
    }
  };

  const handleAddItem = (apiDetails?: [ApiDetail, ApiDetail[]]) => {
    const detailsToAdd = apiDetails || newApiDetails;

    const newItem: DndItem = {
      id: (items.length + 1).toString(),
      content: selectedComponent,
      props: {
        name: itemName, // บันทึกชื่อไอเท็มใหม่
        apiDetails: detailsToAdd,
        fieldToDisplay,
        additionalText,
      },
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));

    resetForm();
    showSuccessAlert();
  };

  const resetForm = () => {
    setNewApiDetails([{ method: 'GET', url: '', body: '', bearerToken: '', buttonLabel: '' }, []]); 
    setSelectedComponent('Light');
    setItemName(''); // รีเซ็ตชื่อ
    setAdditionalText('');
    setFieldToDisplay('');
    setEditingItemId(null);
    setShowApiForm(false);
  };

  const handleAddApi2 = () => {
    setNewApiDetails((prev) => {
      const updatedDetails = [...prev];
      updatedDetails[1] = [...(updatedDetails[1] as ApiDetail[]), { method: 'GET', url: '', body: '', buttonLabel: '', bearerToken: '', buttonColor: '#0000ff' }];
      return updatedDetails as [ApiDetail, ApiDetail[]];
    });
  };

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
    resetForm();
  };

  const handleEditItem = (itemId: string) => {
    const itemToEdit = items.find((item) => item.id === itemId);
    if (itemToEdit) {
      setEditingItemId(itemId);
      setNewApiDetails(itemToEdit.props.apiDetails);
      setItemName(itemToEdit.props.name); // ตั้งชื่อไอเท็มสำหรับการแก้ไข
      setSelectedComponent(itemToEdit.content);
      setFieldToDisplay(itemToEdit.props.fieldToDisplay);
      setAdditionalText(itemToEdit.props.additionalText || '');
      setShowApiForm(true);
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
          onClick={() => {
            if (!showApiForm) {
              setShowApiForm(true);
            } else {
              setShowApiForm(false);
              resetForm();
            }
          }}
          className="bg-green-500 text-white p-2 rounded mb-4 ml-4"
        >
          เพิ่มไอเท็ม
        </button>
      ) : null}

      {showApiForm && (
        <div className="mb-4 p-4 bg-gray-100 rounded shadow-md">
          <h2 className="text-xl mb-2">{editingItemId ? 'แก้ไขไอเท็ม' : 'ข้อมูล API ใหม่'}</h2>

          {/* ช่องสำหรับใส่ชื่อ */}
          <div className="mb-4">
            <label className="block">ชื่อไอเท็ม:</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="p-2 border rounded w-full"
              placeholder="กรุณาตั้งชื่อไอเท็ม"
            />
          </div>

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
                placeholder="http://127.0.0.1:5000/bulb/status"
              />
            </div>
            <div className="mb-2">
              <label className="block">Bearer Token (ถ้ามี):</label>
              <input
                type="text"
                value={newApiDetails[0].bearerToken}
                onChange={(e) => {
                  const updatedApiDetails = [...newApiDetails];
                  (updatedApiDetails[0] as ApiDetail).bearerToken = e.target.value;
                  setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                }}
                className="p-2 border rounded w-full"
                placeholder="your_token_here"
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
                  placeholder='{ "key": "value", "key2": "value2" }'
                />
              </div>
            )}
          </div>

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
                    placeholder="http://127.0.0.1:5000/bulb/status"
                  />
                </div>
                <div className="mb-2">
                  <label className="block">Bearer Token (ถ้ามี):</label>
                  <input
                    type="text"
                    value={apiDetail.bearerToken}
                    onChange={(e) => {
                      const updatedApiDetails = [...newApiDetails];
                      updatedApiDetails[1][index].bearerToken = e.target.value;
                      setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                    }}
                    className="p-2 border rounded w-full"
                    placeholder="your_token_here"
                  />
                </div>
                <div className="mb-2">
                  <label className="block">ชื่อปุ่ม (Button Label):</label>
                  <input
                    type="text"
                    value={apiDetail.buttonLabel}
                    onChange={(e) => {
                      const updatedApiDetails = [...newApiDetails];
                      updatedApiDetails[1][index].buttonLabel = e.target.value;
                      setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                    }}
                    className="p-2 border rounded w-full"
                    placeholder="your_button_label_here"
                  />
                </div>
                <div className="mb-2">
                  <label className="block">เลือกสีปุ่ม:</label>
                  <input
                    type="color"
                    value={apiDetail.buttonColor}
                    onChange={(e) => {
                      const updatedApiDetails = [...newApiDetails];
                      updatedApiDetails[1][index].buttonColor = e.target.value;
                      setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                    }}
                    className="w-10 h-10 border"
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
                      placeholder='{ "key": "value", "key2": "value2" }'
                    />
                  </div>
                )}

                <button
                  className="bg-red-500 text-white p-2 rounded mt-2"
                  onClick={() => handleRemoveApi2(index)}
                >
                  ลบ API 2 ({index + 1})
                </button>
              </div>
            ))}

          <button
            className="bg-blue-500 text-white p-2 rounded"
            onClick={handleAddApi2}
          >
            เพิ่ม API 2
          </button>

          <div className="flex justify-end">
            <button
              onClick={handleSaveItem}
              className="bg-blue-500 text-white p-2 rounded mt-2"
            >
              {editingItemId ? 'บันทึกการแก้ไข' : 'เพิ่มไอเท็มใหม่'}
            </button>
          </div>
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
                  isDndEnabled={isDndEnabled}
                  onEditItem={handleEditItem}
                  onRemoveItem={handleRemoveItem}
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
