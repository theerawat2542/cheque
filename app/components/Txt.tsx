"use client";

import React, { useState } from "react";
import { Button, Modal, Input, message, Space } from "antd";
import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";

export default function Txt() {
  const [open, setOpen] = useState(false);
  const [filename, setFilename] = useState("");

  const handleDownload = async () => {
    if (!filename.trim()) {
      message.warning("กรุณาระบุชื่อไฟล์");
      return;
    }

    try {
      const res = await fetch("/api/download-txt");

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Download failed");
      }

      const textData = await res.text();

      // ✅ เพิ่ม BOM สำหรับ UTF-8
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const content = new TextEncoder().encode(textData);
      const blob = new Blob([bom, content], { type: "text/plain;charset=utf-8" });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
      a.click();

      window.URL.revokeObjectURL(url);

      message.success("ดาวน์โหลดไฟล์สำเร็จ");
      setOpen(false);
      setFilename("");
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  return (
    <>
      {/* ปุ่ม Download .txt ตกแต่ง gradient + icon */}
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        icon={<FileTextOutlined />}
        style={{
          background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
          border: "none",
          color: "#fff",
          fontWeight: 500,
          padding: "0 20px",
        }}
      >
        Download .txt
      </Button>

      <Modal
        open={open}
        title="ตั้งชื่อไฟล์ .txt"
        onCancel={() => setOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setOpen(false)}
            style={{ fontWeight: 500 }}
          >
            ยกเลิก
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            style={{
              background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
              border: "none",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            ดาวน์โหลด
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <label>ชื่อไฟล์ (ไม่ต้องใส่ .txt):</label>
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="เช่น myfile"
          />
        </Space>
      </Modal>
    </>
  );
}
