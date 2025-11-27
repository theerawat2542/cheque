"use client";

import { Button, Popconfirm, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export default function ClearDB() {
  const handleClear = async () => {
    const res = await fetch("/api/cleardb", {
      method: "DELETE",
    });

    if (res.ok) {
      message.success("ล้างข้อมูลสำเร็จ!");
    } else {
      message.error("เกิดข้อผิดพลาดในการล้างข้อมูล!");
    }
  };

  return (
    <Popconfirm
      title="ยืนยันการล้างข้อมูล?"
      description="ข้อมูลทั้งหมดในฐานข้อมูลจะถูกลบ"
      okText="ลบทั้งหมด"
      cancelText="ยกเลิก"
      onConfirm={handleClear}
    >
      <Button
        danger
        icon={<DeleteOutlined />}
        style={{
          background: "linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)",
          border: "none",
          color: "#fff",
          fontWeight: 500,
          padding: "0 20px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)";
        }}
      >
        Clear Database
      </Button>
    </Popconfirm>
  );
}
