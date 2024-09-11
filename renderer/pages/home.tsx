import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Helper function สำหรับดึงค่าจากฟิลด์ที่ซ้อนกัน
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Component สำหรับแต่ละไอเท็ม
const ItemComponent = ({ item, index, componentsMap, isDndEnabled }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (item.props.apiDetails) {
        try {
          const { method, url, body } = item.props.apiDetails[0];
          const response = await fetch(url, {
            method,
            ...(method !== 'GET' && { body: JSON.stringify(JSON.parse(body)) }),
            headers: { 'Content-Type': 'application/json' },
          });
          const apiData = await response.json();
          setData(apiData);
        } catch (error) {
          console.error('Error fetching API:', error);
        }
      }
    };

    fetchData();
  }, [item.props.apiDetails]);

  return (
    <Draggable
      key={item.id}
      draggableId={item.id}
      index={index}
      isDragDisabled={!isDndEnabled} // ใช้สถานะนี้ในการเปิดปิดการ DnD
    >
      {(provided) => (
        <div
          className="bg-white border-b-2 shadow-2xl p-4 rounded relative"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {componentsMap[item.content]
            ? React.createElement(componentsMap[item.content], item.props)
            : <div>Component not found</div>}
          
          {data && item.props.fieldToDisplay && (
            <div className="mt-2 p-2 bg-blue-100 rounded">
              <h3 className="text-sm">ข้อมูล API:</h3>
              <p>{getNestedValue(data, item.props.fieldToDisplay) || 'ไม่พบข้อมูลที่ต้องการ'}</p>
            </div>
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
const FETCH_INTERVAL_MS = 5000;

const ResponsiveGridDnd = () => {
  const [items, setItems] = useState([]); // Initial state for items
  const [isDndEnabled, setIsDndEnabled] = useState(false);
  const [showApiForm, setShowApiForm] = useState(false);
  const [newApiDetails, setNewApiDetails] = useState([{ method: 'GET', url: '', body: '' }, { method: 'GET', url: '', body: '' }]);
  const [fieldToDisplay, setFieldToDisplay] = useState('');

  useEffect(() => {
    const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    setItems(reorderedItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reorderedItems));
  };

  const handleAddItem = () => {
    const newItem = {
      id: (items.length + 1).toString(),
      content: `Light`,
      props: { name: `New Item ${items.length + 1}`, apiDetails: newApiDetails, fieldToDisplay }, // เก็บฟิลด์ที่ต้องการแสดง
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
    setShowApiForm(false);
    setFieldToDisplay(''); // รีเซ็ตฟิลด์หลังจากเพิ่มไอเท็ม
  };

  const toggleDnd = () => {
    setIsDndEnabled(!isDndEnabled);
  };

  const componentsMap = {
    Light: ({ name }) => <div>Light {name}</div>,
    Switch: ({ name }) => <div>Switch {name}</div>,
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
          <h2 className="text-xl mb-2">ข้อมูล API ใหม่</h2>
          {[0, 1].map((index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg">API ชุดที่ {index + 1}</h3>
              <div className="mb-2">
                <label className="block">Method:</label>
                <select
                  value={newApiDetails[index].method}
                  onChange={(e) => {
                    const updatedApiDetails = [...newApiDetails];
                    updatedApiDetails[index].method = e.target.value;
                    setNewApiDetails(updatedApiDetails);
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
                  value={newApiDetails[index].url}
                  onChange={(e) => {
                    const updatedApiDetails = [...newApiDetails];
                    updatedApiDetails[index].url = e.target.value;
                    setNewApiDetails(updatedApiDetails);
                  }}
                  className="p-2 border rounded w-full"
                />
              </div>
              {newApiDetails[index].method !== 'GET' && (
                <div className="mb-2">
                  <label className="block">Body (JSON):</label>
                  <textarea
                    value={newApiDetails[index].body}
                    onChange={(e) => {
                      const updatedApiDetails = [...newApiDetails];
                      updatedApiDetails[index].body = e.target.value;
                      setNewApiDetails(updatedApiDetails);
                    }}
                    className="p-2 border rounded w-full"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="mb-4">
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
            onClick={handleAddItem}
            className="bg-blue-500 text-white p-2 rounded mt-2"
          >
            เพิ่มไอเท็มใหม่
          </button>
        </div>
      )}


<DragDropContext onDragEnd={handleOnDragEnd}>
  <Droppable droppableId="droppable-grid" direction="vertical">
    {(provided) => (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
