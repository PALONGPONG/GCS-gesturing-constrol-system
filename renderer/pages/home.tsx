import { faLightbulb, faPenToSquare, faPlus, faToggleOff, faTrash,faClose} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AOS from 'aos';
import 'aos/dist/aos.css';
import React, { useState, useEffect, use } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2';
// React
import { motion } from "framer-motion"

interface ApiDetail {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: string;
  bearerToken?: string;
  buttonLabel?: string;
  buttonColor?: string;
  protocal: 'http' | 'socket';
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
  lastestMessage,
}: {
  item: DndItem;
  index: number;
  componentsMap: { [key: string]: React.ComponentType<any> };
  isDndEnabled: boolean;
  onEditItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  lastestMessage: string;
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [api2Data, setApi2Data] = useState<any[]>([]);
  const [api2Loading, setApi2Loading] = useState<number | null>(null);
  const [api2Error, setApi2Error] = useState<string | null>(null);
  const [lastemessage, setLastestMessage] = useState<string>("");
  AOS.init();
  useEffect(() => {
    setLastestMessage(lastestMessage);
  }, [lastestMessage]);
  console.log("sdasdasd", lastestMessage);
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
      if (!response.ok) throw new Error('');
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
    setLastestMessage("null")
  }, [lastemessage]);
  // useEffect(() => {
  //   fetchApi1Data();
  //   const intervalId = setInterval(() => {
  //     fetchApi1Data();
  //   }, 10000);

  //   return () => clearInterval(intervalId);
  // }, [item.props.apiDetails]);

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
  function getContrastColor(bgColor) {
    // แปลงสี HEX เป็น RGB
    const hexToRgb = (hex) => {
      const sanitizedHex = hex.replace('#', '');
      const bigint = parseInt(sanitizedHex, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    };
  
    // คำนวณความสว่าง (Brightness)
    const { r, g, b } = hexToRgb(bgColor);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
    // หากความสว่างสูง ให้ใช้สีดำ หากต่ำ ให้ใช้สีขาว
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }
  return (
    <Draggable
      key={item.id}
      draggableId={item.id}
      index={index}
      isDragDisabled={!isDndEnabled}
    >
      {(provided) => (
        <div
          className="bg-white border-b-2 shadow-2xl p-8 rounded-xl relative"
          ref={provided.innerRef}
          {...provided.draggableProps}
        // data-aos="fade-up"
        // data-aos-offset="200"
        // data-aos-delay="50"
        // data-aos-duration="1000"
        // data-aos-easing="ease-in-out"
        // data-aos-mirror="true"
        // data-aos-once="false"
        // data-aos-anchor-placement="top-center"
        >
          {componentsMap[item.content]
            ? React.createElement(componentsMap[item.content], {
              ...item.props,
              apiData: getNestedValue(data, item.props.fieldToDisplay) || 'ไม่พบข้อมูลที่ต้องการ',
            })
            : <div>Component not found</div>}

          {loading}
          {error && <div className="text-red-500">{error}</div>}

          {Array.isArray(item.props.apiDetails[1]) &&
            item.props.apiDetails[1].map((apiDetail, index) => (
              <div key={index} className="mt-4">
                <button
                  className="bg-gray-400 border-2 p-2 rounded-xl w-full btn"
                  onClick={() => handleApi2Request(index)}
                  disabled={api2Loading === index}
                  style={{
                    backgroundColor: apiDetail.buttonColor || '#0000ff',
                    color: getContrastColor(apiDetail.buttonColor || '#0000ff'), // ใช้ฟังก์ชันเลือกสีข้อความ
                  }}
                >
                  {api2Loading === index ? 'กำลังส่งข้อมูล...' : apiDetail.buttonLabel || `ส่ง API 2 Request ${index + 1}`}
                </button>
              </div>
            ))}

          {isDndEnabled && (
            <>
              <button
                className="bg-gray-100 rounded-xl border-2  text-gray-600 p-2 mt-4 pl-5 pr-5 hover:bg-gray-300"
                onClick={() => onEditItem(item.id)}
              >
                <FontAwesomeIcon icon={faPenToSquare} className='mr-2' />
                Edit
              </button>

              <button
                className="bg-gray-100 rounded-xl border-2  text-gray-600 p-2 mt-4 pl-5 pr-5 ml-2 hover:bg-gray-300"
                onClick={() => onRemoveItem(item.id)}
              >
                <FontAwesomeIcon icon={faTrash} className='mr-2' />
                Remove
              </button>
            </>
          )}

          <span
            {...provided.dragHandleProps}
            className={`absolute top-0 right-0 p-2 cursor-pointer ` + (isDndEnabled ? 'block' : 'hidden')}
          >
            ⠿
          </span>
        </div>
      )}
    </Draggable>
  );
};

const LOCAL_STORAGE_KEY = "dnd-items";

interface ResponsiveGridDndProps {
  latestMessage: string;
  isConnected: boolean;
}

const ResponsiveGridDnd: React.FC<ResponsiveGridDndProps> = ({ latestMessage, isConnected }) => {
  const [items, setItems] = useState<DndItem[]>([]);
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiDetails, setNewApiDetails] = useState<[ApiDetail, ApiDetail[]]>([
    { method: 'GET', url: '', body: '', bearerToken: '', buttonLabel: '', protocal: 'http' },
    [],
  ]);
  const [selectedComponent, setSelectedComponent] = useState<string>('Light');
  const [itemName, setItemName] = useState<string>(''); // เพิ่ม state สำหรับชื่อ
  const [additionalText, setAdditionalText] = useState<string>('');
  const [fieldToDisplay, setFieldToDisplay] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  // const [typeconnect, setTypeconnect] = useState('http')

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
    const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
    modal.close();
    showSuccessAlert();
  };

  const resetForm = () => {
    const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
    modal.close();
    setNewApiDetails([{ method: 'GET', url: '', body: '', bearerToken: '', buttonLabel: '', protocal: 'http' }, []]);
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
      updatedDetails[1] = [...(updatedDetails[1] as ApiDetail[]), { method: 'GET', url: '', body: '', buttonLabel: '', bearerToken: '', buttonColor: '#0000ff', protocal: 'http' }];
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
      const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
      modal.showModal();
    }
  };

  const componentsMap = {
    Light: ({ name, apiData }: { name: string; apiData: string }) => (
      <div className='flex '>

        <div className='items-center justify-center content-center mr-5'>

          <FontAwesomeIcon icon={faLightbulb} size='2xl' />
        </div>
        <div>
          <h1 className='font-bold flex'>Light : <p className='font-medium ml-3'>{name}</p></h1>
          <p>Status of Light: {apiData}</p>
        </div>

      </div>
    ),
    Switch: ({ name, apiData }: { name: string; apiData: string }) => (
      <div className='flex '>

        <div className='items-center justify-center content-center mr-5'>

          <FontAwesomeIcon icon={faToggleOff} size='2xl' />
        </div>
        <div>
          <h1 className='font-bold flex'>Switch : <p className='font-medium ml-3'>{name}</p></h1>
          <p>Status of Light: {apiData}</p>
        </div>

      </div>
    ),
  };
  const handleCloseApp = () => {
    window.ipc.closeApp()
  }
  return (
    <div className="p-4">
      <div className='flex'>
        <button
          onClick={toggleDnd}
          className={`flex p-2  pl-3 pr-3 rounded-xl mb-4 hover:bg-gray-400 items-center w-30 h-12 ${isDndEnabled ? 'bg-white  bg-opacity-65  border-red-100' : 'bg-white bg-opacity-65  border-green-100'} text-black font-bold`}
        >
          <FontAwesomeIcon icon={faPenToSquare} className='mr-2' />
          <p className='mt-1'>

            {isDndEnabled ? 'Done' : 'Edit'}
          </p>
        </button>
        {/* {isConnected ? (
      <div className='pl-2'>Connected</div>)
      : (
        <div className='pl-2'>Not Connected</div>
      )} */}
        {isDndEnabled ? (
          // <button
          //   onClick={() => {
            //     if (!showApiForm) {แ
              //       setShowApiForm(true);
              //     } else {
                //       setShowApiForm(false);
                //       resetForm();
                //     }
                //   }}
                //   className="bg-green-500 text-white p-2 rounded mb-4 ml-4"
                // >
                //   เพิ่มไอเท็ม
                // </button>
                <button className="flex bg-white bg-opacity-65 items-center p-2 rounded-xl  pl-3 pr-3 mb-4 ml-2 h-12 hover:bg-gray-400 font-semibold" onClick={() => {
                  const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
                  modal.showModal();
                }}>
            <FontAwesomeIcon icon={faPlus} className='mr-2' />

            <p className='mt-1'>
              Add device
            </p></button>
        ) : null}
        {/* <button onClick={handleCloseApp} className="flex bg-white bg-opacity-65 items-center text-center justify-center  rounded-xl  pl-4 pr-4 mb-4 ml-2 h-12 hover:bg-gray-400 font-semibold p-3"><FontAwesomeIcon icon={faClose} className='' /></button> */}
      </div>
      {/* {showApiForm && ( */}
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <div className="mb-4 p-4 bg-gray-100 rounded shadow-md"

          >
            <h2 className="text-xl mb-2">{editingItemId ? 'Edit device' : 'Add new device'}</h2>

            {/* ช่องสำหรับใส่ชื่อ */}
            <div className="mb-4" >
              <label className="block">Device name :</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="p-2 textarea textarea-bordered  w-full mt-2 "
                placeholder="Your device name"
              />
            </div>
            <div className="mb-4">
              <label className="block">Protocol:</label>
              <select
                value={newApiDetails[0].protocal}
                onChange={(e) => {
                  const newType = e.target.value;
                  const updatedApiDetails = [...newApiDetails];
                  (updatedApiDetails[0] as ApiDetail).protocal = newType as 'http' | 'socket';

                  // อัปเดต URL ตามประเภท Protocol
                  if (newType === 'socket') {
                    (updatedApiDetails[0] as ApiDetail).url = 'http://localhost:47591/bulb';
                  } else if (newType === 'http') {
                    (updatedApiDetails[0] as ApiDetail).url = '';
                  }
                  if (newType === 'socket') {
                    (updatedApiDetails[0] as ApiDetail).method = 'POST';
                  } else if (newType === 'http') {
                    (updatedApiDetails[0] as ApiDetail).method = 'GET';
                  }

                  setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                }}
                className="p-2 border rounded-lg mt-2 w-full"
              >
                <option value="http">HTTP</option>
                <option value="socket">SOCKET</option>
              </select>
            </div>

            <div className="mb-4" >
              <label className="block">Device Type :</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="p-2 border rounded-lg mt-2 w-full"
              >
                <option value="Light">Light</option>
                <option value="Switch">Switch</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block">Description:</label>
              <input
                type="text"
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                className="p-2 textarea textarea-bordered mt-2 w-full"
                placeholder="Description"
              />
            </div>

            <div className="mb-4">
              <h3 className="text-lg">Status of device API</h3>
              <div className="mb-2">
              {newApiDetails[0].protocal === 'socket' ? (
                  <div>
                    {/* <label className="block">API URL:</label> */}

                    {/* <p className="p-2 border rounded w-full bg-gray-100"></p> */}
                  </div>
                ) : (
                  <div>

                <label className="block">Method:</label>
                <select
                  value={newApiDetails[0].method}
                  onChange={(e) => {
                    const updatedApiDetails = [...newApiDetails];
                    (updatedApiDetails[0] as ApiDetail).method = e.target.value as ApiDetail['method'];
                    setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                  }}
                  className="p-2 border rounded-lg mt-2 w-full"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                  </div>
                )}
              </div>
              <div className="mb-2">
                {newApiDetails[0].protocal === 'socket' ? (
                  <div>
                    {/* <label className="block">API URL:</label> */}

                    {/* <p className="p-2 border rounded w-full bg-gray-100"></p> */}
                  </div>
                ) : (
                  <div>
                    <label className="block">API URL:</label>

                    <input
                      type="text"
                      value={newApiDetails[0].url}
                      onChange={(e) => {
                        const updatedApiDetails = [...newApiDetails];
                        (updatedApiDetails[0] as ApiDetail).url = e.target.value;
                        setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                      }}
                      className="p-2 textarea textarea-bordered w-full"
                      placeholder="http://127.0.0.1:5000/bulb/status"
                    />
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block">Bearer Token (optional):</label>
                <input
                  type="text"
                  value={newApiDetails[0].bearerToken}
                  onChange={(e) => {
                    const updatedApiDetails = [...newApiDetails];
                    (updatedApiDetails[0] as ApiDetail).bearerToken = e.target.value;
                    setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                  }}
                  className="p-2 textarea textarea-bordered w-full"
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
                    className="p-2 textarea textarea-bordered w-full h-80"
                    placeholder={newApiDetails[0].protocal === 'socket' ? (`{
    "ip": "192.168.1.135",
    "port": 55443,
    "command": {
        "id": 1,
        "method": "get_prop",
        "params": ["power"]
    }
}`) : (`{"key": "value"}`)}
                  />
                </div>
              )}
            </div>

            <div className="mb-4 mt-4">
              <label className="block">Field for show status :</label>
              <input
                type="text"
                value={fieldToDisplay}
                onChange={(e) => setFieldToDisplay(e.target.value)}
                className="p-2 input input-bordered   w-full"
                placeholder="ex : message or received.recieve (for sub object)"
              />
            </div>
            <div className='w-full h-1 bg-gray-500 mb-3'></div>
            <h3 className="text-lg mb-2">Button for request API</h3>
            {Array.isArray(newApiDetails[1]) &&
              newApiDetails[1].map((apiDetail, index) => (
                <div key={index} className="mb-4">
                  <div className="mb-4">
                    <label className="block">Protocol:</label>
                    <select
                      value={newApiDetails[1][index].protocal}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const updatedApiDetails = [...newApiDetails];
                        (updatedApiDetails[1][index] as ApiDetail).protocal = newType as 'http' | 'socket';

                        // อัปเดต URL ตามประเภท Protocol
                        if (newType === 'socket') {
                          (updatedApiDetails[1][index] as ApiDetail).url = 'http://localhost:47591/bulb';
                        } else if (newType === 'http') {
                          (updatedApiDetails[1][index] as ApiDetail).url = '';
                        }
                        if (newType === 'socket') {
                          (updatedApiDetails[1][index] as ApiDetail).method = 'POST';
                        } else if (newType === 'http') {
                          (updatedApiDetails[1][index] as ApiDetail).method = 'GET';
                        }

                        setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                      }}
                      className="p-2 border rounded-lg mt-2 w-full"
                    >
                      <option value="http">HTTP</option>
                      <option value="socket">SOCKET</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    {newApiDetails[1][index].protocal === 'socket' ? (
                      <div>
                        {/* <label className="block">API URL:</label> */}

                        {/* <p className="p-2 border rounded w-full bg-gray-100"></p> */}
                      </div>
                    ) : (
                      <div>

                        <label className="block">Method (Button {index + 1}):</label>
                        <select
                          value={apiDetail.method}
                          onChange={(e) => {
                            const updatedApiDetails = [...newApiDetails];
                            updatedApiDetails[1][index].method = e.target.value as ApiDetail['method'];
                            setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                          }}
                          className="p-2 border rounded-lg mt-2 w-full"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    {newApiDetails[1][index].protocal === 'socket' ? (
                      <div>
                        {/* <label className="block">API URL:</label> */}

                        {/* <p className="p-2 border rounded w-full bg-gray-100"></p> */}
                      </div>
                    ) : (
                      <div>
                        <label className="block">API URL:</label>

                        <input
                          type="text"
                          value={newApiDetails[1][index].url}
                          onChange={(e) => {
                            const updatedApiDetails = [...newApiDetails];
                            (updatedApiDetails[1][index] as ApiDetail).url = e.target.value;
                            setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                          }}
                          className="p-2 input input-bordered   w-full"
                          placeholder="http://127.0.0.1:5000/bulb/status"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="block">Bearer Token (optional) :</label>
                    <input
                      type="text"
                      value={apiDetail.bearerToken}
                      onChange={(e) => {
                        const updatedApiDetails = [...newApiDetails];
                        updatedApiDetails[1][index].bearerToken = e.target.value;
                        setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                      }}
                      className="p-2 input input-bordered   w-full"
                      placeholder="your_token_here"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block">Button Label :</label>
                    <input
                      type="text"
                      value={apiDetail.buttonLabel}
                      onChange={(e) => {
                        const updatedApiDetails = [...newApiDetails];
                        updatedApiDetails[1][index].buttonLabel = e.target.value;
                        setNewApiDetails(updatedApiDetails as [ApiDetail, ApiDetail[]]);
                      }}
                      className="p-2 input input-bordered   w-full"
                      placeholder="your_button_label_here"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block">Color of button :</label>
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
                        className="p-2 textarea textarea-bordered w-full h-80"
                        placeholder={newApiDetails[1][index].protocal === 'socket' ? (`{
    "ip": "192.168.1.135",
    "port": 55443,
    "command": {
        "id": 1,
        "method": "get_prop",
        "params": ["power"]
    }
}`) : (`{"key": "value"}`)}
                                        />
                    
                    </div>
                  )}

                  <button
                    className="bg-red-100 text-gray-600 p-2 btn hover:bg-gray-300 w-full"
                    onClick={() => handleRemoveApi2(index)}
                  >
                    Remove button - {index + 1}
                  </button>
                  <div className='w-full divider'></div>
                </div>

              )
              )}

            <button
              className="bg-green-100 text-gray-600 p-2 btn hover:bg-gray-300 w-full"
              onClick={handleAddApi2}
            >
              Add new button
            </button>

            <div className="flex justify-end">
              <button
                onClick={handleSaveItem}
                className="bg-blue-500 text-white p-2 btn mt-2 hover:bg-blue-600 w-full"
              >
                {editingItemId ? 'Done' : 'Add device'}
              </button>
            </div>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={resetForm}>close</button>
        </form>
      </dialog>
      {/* )} */}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="droppable-grid" direction="vertical">
          {(provided) => (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 user-select-none "
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
                  lastestMessage={latestMessage}
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


