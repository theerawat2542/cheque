/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Button, Modal, message, Spin } from "antd";
import { LockOutlined, DownloadOutlined } from "@ant-design/icons";
import CryptoJS from "crypto-js";
import { FileTextOutlined } from "@ant-design/icons";

export default function Enc() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aesKeyBytes = new Uint8Array(
    Array(32)
      .fill(-69)
      .map((b) => b & 0xff)
  );
  const keyWordArray = CryptoJS.lib.WordArray.create(aesKeyBytes as any);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleDownload = async () => {
    if (!file) {
      message.warning("กรุณาเลือกไฟล์ .txt ก่อน");
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);

      const encrypted = CryptoJS.AES.encrypt(wordArray, keyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });

      const encryptedWords = encrypted.ciphertext;
      const encryptedArray = new Uint8Array(encryptedWords.sigBytes);
      for (let i = 0; i < encryptedWords.sigBytes; i++) {
        encryptedArray[i] =
          (encryptedWords.words[Math.floor(i / 4)] >> (24 - (i % 4) * 8)) &
          0xff;
      }

      const originalName = file.name.replace(/\.[^/.]+$/, "");
      const downloadName = `${originalName}.enc`;

      const blob = new Blob([encryptedArray], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      a.click();

      window.URL.revokeObjectURL(url);

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setOpen(false);
      message.success("เข้ารหัสและดาวน์โหลดไฟล์ .enc สำเร็จ");
    } catch (err) {
      console.error(err);
      message.error("เข้ารหัสไฟล์ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        icon={<LockOutlined />}
        style={{
          background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
          border: "none",
          color: "#fff",
          fontWeight: 500,
          padding: "0 20px",
        }}
        size="middle"
      >
        Encrypt .enc
      </Button>

      <Modal
        open={open}
        title="เข้ารหัสไฟล์ .txt เป็น .enc"
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
            loading={loading}
            style={{
              background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
              border: "none",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            ดาวน์โหลด
          </Button>,
        ]}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "100%",
          }}
        >
          <p>เลือกไฟล์ .txt ที่ต้องการเข้ารหัส:</p>

          {/* ปุ่มเลือกไฟล์ */}
          <Button
            type="dashed"
            icon={<FileTextOutlined />}
            onClick={() => fileInputRef.current?.click()}
            style={{ width: 200 }}
          >
            Choose File
          </Button>

          {/* แสดงชื่อไฟล์ที่เลือก */}
          {file && <span>Selected: {file.name}</span>}

          {/* ซ่อน input ของระบบ */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {loading && <Spin style={{ marginTop: 10 }} />}
        </div>
      </Modal>
    </>
  );
}
