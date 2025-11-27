"use client";

import React, { useState } from "react";
import { Button, Modal, DatePicker, Select, message, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { Option } = Select;

const types = [
  "CW_RF",
  "CW_AC",
  "KB_269",
  "KB_269_New",
  "KB_277",
  "KB_277_New",
  "KB_865",
  "KB_865_New",
  "HSBC",
];

export default function Gettext() {
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [type, setType] = useState<string>();
  const [loading, setLoading] = useState(false);

  const runScript = async () => {
    if (!date || !type) {
      message.warning("กรุณาเลือกวันที่และ Type");
      return;
    }

    setLoading(true);

    try {
      const formattedDate = date.format("DDMMYYYY");

      const res = await fetch("/api/run-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, date: formattedDate }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");

      message.success(data.message);
      setVisible(false);
      setDate(null);
      setType(undefined);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        Get Text
      </Button>

      <Modal
        title="Run SQL Script"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spin size="large" tip="กำลังรัน SQL..." />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>เลือกวันที่: </label>
              <DatePicker value={date} onChange={setDate} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>เลือก Type: </label>
              <Select
                style={{ width: 200 }}
                value={type}
                onChange={setType}
              >
                {types.map((t) => (
                  <Option key={t} value={t}>
                    {t}
                  </Option>
                ))}
              </Select>
            </div>

            <Button type="primary" onClick={runScript}>
              Run
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
