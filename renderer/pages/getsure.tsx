import { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface ApiDetail {
  method: string;
  url: string;
  body: string;
  bearerToken: string;
  buttonLabel: string;
  buttonColor?: string;
}

interface ApiGroup {
  id: string;
  content: string;
  props: {
    name: string;
    apiDetails: (ApiDetail | ApiDetail[])[];
    fieldToDisplay: string;
    additionalText: string;
  };
}

interface SelectedApi {
  groupId: string;
  apiIndex: number;
  apiDetail: ApiDetail;
}

interface ApiSelection {
  [key: number]: SelectedApi;
}

const getsure = () => {
  const [apiGroups, setApiGroups] = useState<ApiGroup[]>([]);
  const [selection, setSelection] = useState<ApiSelection>({});
  const pathimg = ["/hello.png","/gummue.webp","/jeepup.png","/jeepdown.png"]
  const getsure = ["โบกมือ", "กำมือ",   "จีบนิ้วขยับขึ้น",   "จีบนิ้วขยับลง"]
  // AOS.init();
  // ดึงข้อมูลจาก localStorage เมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    const storedApiGroups = localStorage.getItem('dnd-items');
    const storedSelection = localStorage.getItem('apiSelection');

    if (storedApiGroups) {
      setApiGroups(JSON.parse(storedApiGroups));
    }

    if (storedSelection) {
      setSelection(JSON.parse(storedSelection));
    }
  }, []);

  // ฟังก์ชันจัดการการเลือก API
  const handleSelectChange = (index: number, groupId: string, apiIndex: string) => {
    const apiIdx = parseInt(apiIndex, 10);
    const group = apiGroups.find((g) => g.id === groupId);

    if (group) {
      const apiDetails = group.props.apiDetails.flat() as ApiDetail[];
      const api = apiDetails[apiIdx];

      if (api && api.method && api.url) {
        setSelection((prevSelection) => {
          const updatedSelection = {
            ...prevSelection,
            [index]: {
              groupId,
              apiIndex: apiIdx,
              apiDetail: api,
              
            },
          };

          // บันทึกการเลือกใหม่ลงใน localStorage ทันทีหลังการเปลี่ยนแปลง
          localStorage.setItem('apiSelection', JSON.stringify(updatedSelection));

          return updatedSelection;
        });
      }
    }
  };

  return (
    <div className="p-4">
      <div className=''>

      
      <h1 className="text-lg font-bold mb-4">เลือก API ที่สำหรับท่าทาง</h1>
      <div className="space-y-4" 
          // data-aos="fade-left"
          // data-aos-offset="200"
          // data-aos-delay="50"
          // data-aos-duration="1000"
          // data-aos-easing="ease-in-out"
          // data-aos-mirror="true"
          // data-aos-once="false"
          // data-aos-anchor-placement="top-center"
          >
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className='bg-white p-8 rounded-xl shadow-xl border-b-2 flex '>
            <img src={pathimg[num-1]} alt="" className='w-20 mr-11'/>
            <div className='w-full'>
            <label className="block mb-2 font-medium">
              เลือก API สำหรับท่าทาง {getsure[num-1]}
            </label>
            <select
              value={selection[num] ? `${selection[num].groupId}:${selection[num].apiIndex}` : ''}
              onChange={(e) => {
                const [groupId, apiIndex] = e.target.value.split(':');
                handleSelectChange(num, groupId, apiIndex);
              }}
              className="border border-gray-300 p-2 rounded-xl w-full "
            >
              <option value="">-- เลือก API --</option>
              {apiGroups.map((group) =>
                group.props.apiDetails
                  .flat()
                  .slice(1) // ข้าม apiDetails[0]
                  .map((api, apiIndex) =>
                    api.method && api.url ? (
                      <option
                        key={`${group.id}-${apiIndex + 1}`}
                        value={`${group.id}:${apiIndex + 1}`}
                      >
                        {`${group.props.name} - ${api.buttonLabel}`}
                      </option>
                    ) : null
                  )
              )}
            </select>
            </div>
          </div>
        ))}
      </div>
      
      </div>
    </div>
  );
};

export default getsure;