"use client";

import { Button, message } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";

type ChequeRow = {
  DocumentNo: string;
  DocumentYear: string;
  VendorCode: string;
  VendorName: string;
  Bankname: string;
  Amount: number;
  Currency: string;
  RefDocument: string;
};

type ImportDBProps = {
  data: ChequeRow[];
};

export default function ImportDB({ data }: ImportDBProps) {
  const handleImport = async () => {
    if (data.length === 0) {
      message.warning("ไม่มีข้อมูลสำหรับนำเข้า");
      return;
    }

    try {
      const res = await fetch("/api/importtbPaymentDocument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (res.ok) {
        message.success("Import เข้า tbPaymentDocument สำเร็จ!");
      } else {
        const err = await res.json();
        message.error("เกิดข้อผิดพลาด: " + err.error);
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API");
    }
  };

  return (
    <Button
      icon={<DatabaseOutlined />}
      onClick={handleImport}
      disabled={data.length === 0}
      style={{
        background: data.length > 0
          ? "linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)"
          : "#cccccc",
        border: "none",
        color: "#fff",
        fontWeight: 500,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        cursor: data.length > 0 ? "pointer" : "not-allowed",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        if (data.length > 0) (e.currentTarget.style.filter = "brightness(1.2)");
      }}
      onMouseLeave={(e) => {
        if (data.length > 0) (e.currentTarget.style.filter = "brightness(1)");
      }}
    >
      Import to DB
    </Button>
  );
}
