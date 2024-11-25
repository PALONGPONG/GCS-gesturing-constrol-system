import cv2

# เปิดกล้อง (ค่า 0 หมายถึงกล้องตัวแรกของเครื่อง)
cap = cv2.VideoCapture(0)

# ตรวจสอบว่ากล้องเปิดสำเร็จหรือไม่
if not cap.isOpened():
    print("ไม่สามารถเปิดกล้องได้")
else:
    while True:
        # อ่านภาพจากกล้อง
        ret, frame = cap.read()

        # ตรวจสอบว่ามีการอ่านภาพสำเร็จหรือไม่
        if not ret:
            print("ไม่สามารถอ่านภาพจากกล้องได้")
            break

        # แสดงภาพที่ได้รับ
        cv2.imshow('Camera', frame)

        # รอการกดปุ่ม 'q' เพื่อปิดหน้าต่าง
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # ปิดการเชื่อมต่อกับกล้องและปิดหน้าต่างทั้งหมด
    cap.release()
    cv2.destroyAllWindows()
