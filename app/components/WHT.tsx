"use client";
import React, { useState } from "react";
import { Button, Modal, Table, message, Spin, Input, Space } from "antd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { DownloadOutlined, FileExcelOutlined, TableOutlined } from "@ant-design/icons";

type WHTRow = {
  key: string;
  Cl: string;
  CoCd: string;
  DocumentNo: string;
  Year: string;
  Itm: string;
  Withhldtaxtype: string;
  Wtaxbat: string;
  Withholdingtaxamnt: number;
};

interface WHTApiResponse {
  Cl: string;
  CoCd: string;
  DocumentNo: string;
  Year: string;
  Itm: string;
  Withhldtaxtype: string;
  Wtaxbat: string;
  Withholdingtaxamnt: number;
}

export default function WHT() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<WHTRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [exportModal, setExportModal] = useState(false);
  const [filename, setFilename] = useState("");

  const columns = [
    { title: "Cl", dataIndex: "Cl" },
    { title: "CoCd", dataIndex: "CoCd" },
    { title: "DocumentNo", dataIndex: "DocumentNo" },
    { title: "Year", dataIndex: "Year" },
    { title: "Itm", dataIndex: "Itm" },
    { title: "Withhldtaxtype", dataIndex: "Withhldtaxtype" },
    { title: "Wtaxbat", dataIndex: "Wtaxbat" },
    { title: "Withholdingtaxamnt", dataIndex: "Withholdingtaxamnt" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wht");
      if (!res.ok) throw new Error("Fetch error");
      const json: WHTApiResponse[] = await res.json();
      const mapped: WHTRow[] = json.map((item, idx) => ({ key: idx.toString(), ...item }));
      setData(mapped);
    } catch {
      message.error("โหลดข้อมูล WHT ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setVisible(true);
    fetchData();
  };

  const openExportModal = () => {
    if (data.length === 0) {
      message.warning("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    setExportModal(true);
  };

  const exportExcel = () => {
    if (!filename.trim()) {
      message.warning("กรุณาระบุชื่อไฟล์");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data.map(({ key, ...rest }) => rest));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WHT_Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const finalName = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
    saveAs(blob, finalName);
    message.success("ดาวน์โหลดไฟล์สำเร็จ");
    setExportModal(false);
    setFilename("");
  };

  return (
    <>
      {/* ปุ่มเปิด Modal WHT */}
      <Button
        onClick={handleOpen}
        icon={<TableOutlined />}
        style={{
          background: "linear-gradient(90deg, #f7971e 0%, #ffd200 100%)",
          border: "none",
          color: "#fff",
          fontWeight: 500,
          padding: "0 20px",
        }}
      >
        WHT
      </Button>

      {/* Modal หลัก */}
      <Modal
        title="Withholdingtaxamnt Data"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={900}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={openExportModal}
            style={{
              background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
              border: "none",
              color: "#fff",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Export
          </Button>
        </div>

        {loading ? (
          <Spin />
        ) : (
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
        )}
      </Modal>

      {/* Modal ตั้งชื่อไฟล์ Export */}
      <Modal
        title="ตั้งชื่อไฟล์ Excel"
        open={exportModal}
        onCancel={() => setExportModal(false)}
        onOk={exportExcel}
        okText="ดาวน์โหลด"
        cancelText="ยกเลิก"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <label>ชื่อไฟล์ :</label>
          <Input value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="เช่น WHT_Data" />
        </Space>
      </Modal>
    </>
  );
}
