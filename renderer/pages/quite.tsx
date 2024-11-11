'use client';

import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const Quite = () => {
  const handleCloseApp = () => {
    window.ipc.closeApp();
  };

  const handleDevTools = () => {
    window.ipc.openDevtools();
    window.location.href = '/home'; // กลับไปที่หน้า Home
  };

  useEffect(() => {
    const closeApp = () => {
      Swal.fire({
        title: 'You want to close the app?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, close it!',
        footer: '<button id="open-devtools" style="color: gray; cursor: pointer;">Open Dev Tools</button>',
        allowOutsideClick: false, // ป้องกันการปิดด้วยการคลิกข้างนอก
        allowEscapeKey: false, // ป้องกันการปิดด้วยปุ่ม Escape
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Closed!',
            text: 'The app will now close.',
            icon: 'success',
            allowOutsideClick: false,
            allowEscapeKey: false,
          }).then(() => {
            handleCloseApp(); // เรียกปิดโปรแกรมหลังจากยืนยัน
          });
        } else if (result.isDismissed) {
          window.location.href = '/home'; // กลับไปที่หน้า Home
        }
      });

      // เพิ่ม Event Listener ให้กับปุ่มใน footer
      setTimeout(() => {
        const devToolsButton = document.getElementById('open-devtools');
        if (devToolsButton) {
          devToolsButton.addEventListener('click', handleDevTools);
        }
      }, 0);
    };

    closeApp(); // เรียกฟังก์ชันเมื่อคอมโพเนนต์โหลด
  }, []);

  return <div></div>;
};

export default Quite;
