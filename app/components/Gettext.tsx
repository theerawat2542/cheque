"use client";

import { useState } from "react";
import { Button, Input, message, Space } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

export default function GetText() {
  const [date, setDate] = useState("");

  const runSQL = async () => {
    if (!date || date.length !== 8) {
      message.error("กรุณากรอกวันที่รูปแบบ ddmmyyyy เช่น 04122025");
      return;
    }

    try {
      const res = await fetch("/api/run-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chqDate: date }),
      });

      const data = await res.json();

      if (!res.ok) {
        return message.error(data.error || "เกิดข้อผิดพลาด");
      }

      message.success(`รัน SQL สำเร็จ! RowsAffected: ${data.rowsAffected}`);
    } catch (err) {
      console.error(err);
      message.error("เชื่อมต่อ API ไม่สำเร็จ");
    }
  };

  return (
    <Space direction="vertical">
      <Input
        placeholder="กรอกวันที่ ddmmyyyy เช่น 04122025"
        value={date}
        maxLength={8}
        onChange={(e) => setDate(e.target.value)}
        style={{ width: 200 }}
      />

      <Button type="primary" icon={<DatabaseOutlined />} onClick={runSQL}>
        Run KB_865.sql
      </Button>
    </Space>
  );
}
