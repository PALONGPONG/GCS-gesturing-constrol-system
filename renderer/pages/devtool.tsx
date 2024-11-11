'use client';

import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const Quite = () => {
  const handledev = () => {
    window.ipc.openDevtools();
  };

  useEffect(() => {
    const closeApp = () => {
      Swal.fire({
        title: 'Are you sure?',
        text: "You will open DevTools",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, close it!',
        allowOutsideClick: false, // ป้องกันการปิดด้วยการคลิกข้างนอก
        allowEscapeKey: false, // ป้องกันการปิดด้วยปุ่ม Escape
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Closed!',
            text: 'The app will now close.',
            icon: 'success',
            allowOutsideClick: false, // ป้องกันการปิด SweetAlert ระหว่างการทำงาน
            allowEscapeKey: false,
          }).then(() => {
            handledev(); // เรียกปิดโปรแกรมหลังจากยืนยัน
          });
        }else if (result.isDismissed) {
            window.location.href = '/home';
            }
      });
    };

    closeApp(); // เรียกฟังก์ชันเมื่อคอมโพเนนต์โหลด
  }, []);

  return <div></div>;
};

export default Quite;
