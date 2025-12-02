"use client";
import React, { useState } from "react";
import {
  Upload,
  Button,
  Table,
  message,
  Space,
  Typography,
  Divider,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import ClearDB from "./components/ClearDB";
import ImportDB from "./components/ImportDB";
import WHT from "./components/WHT";
import Txt from "./components/Txt";
import Enc from "./components/Enc";
import type { UploadFile, RcFile } from "antd/es/upload/interface";
// import Gettext from "./components/Gettext";

const { Title } = Typography;

type ChequeRow = {
  key: string;
  DocumentNo: string;
  DocumentYear: string;
  VendorCode: string;
  VendorName: string;
  Bankname: string;
  Amount: number;
  Currency: string;
  RefDocument: string;
};

export default function Page() {
  const [data, setData] = useState<ChequeRow[]>([]);
  const [fileList, setFileList] = useState<UploadFile<RcFile>[]>([]);

  const handleReset = () => {
    setData([]);
    setFileList([]);
    message.info("ล้างไฟล์และข้อมูลในตารางเรียบร้อย");
  };

  const uploadProps = {
    name: "file",
    accept: ".xls",
    maxCount: 1,
    fileList,
    onRemove: () => setFileList([]),
    beforeUpload: (file: RcFile) => {
      setData([]);

      const uploadFile: UploadFile<RcFile> = {
        uid: file.uid || `${Date.now()}`,
        name: file.name,
        status: "done",
        originFileObj: file,
      };
      setFileList([uploadFile]);

      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(uint8Array, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as Omit<
          ChequeRow,
          "key"
        >[];
        const mapped = jsonData.map((item, index) => ({
          key: index.toString(),
          ...item,
        }));
        setData(mapped);
        message.success("Import สำเร็จ!");
      };
      reader.readAsArrayBuffer(file);
      return false;
    },
  };

  const columns = [
    { title: "DocumentNo", dataIndex: "DocumentNo" },
    { title: "DocumentYear", dataIndex: "DocumentYear" },
    { title: "VendorCode", dataIndex: "VendorCode" },
    { title: "VendorName", dataIndex: "VendorName" },
    { title: "Bankname", dataIndex: "Bankname" },
    { title: "Amount", dataIndex: "Amount" },
    { title: "Currency", dataIndex: "Currency" },
    { title: "RefDocument", dataIndex: "RefDocument" },
  ];

  return (
    <div
      style={{
        padding: "15px 25px",
      }}
    >
      <Title
        level={2}
        style={{
          marginBottom: 15,
          background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 800,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          textShadow: "2px 2px 4px rgba(0,0,0,0.15)",
        }}
      >
        BBL Cheque Import
      </Title>

      <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
        {/* Control Buttons */}
        <Space
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Space>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleReset}
              style={{
                fontWeight: 500,
                padding: "0 20px",
                borderRadius: 6,
                background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
                border: "none",
                color: "#fff",
                transition: "0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.filter = "brightness(1.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.filter = "brightness(1)")
              }
            >
              Reset
            </Button>

            <Upload {...uploadProps} showUploadList={false}>
              <Button
                icon={<UploadOutlined />}
                style={{
                  fontWeight: 500,
                  padding: "0 20px",
                  borderRadius: 6,
                  background: "linear-gradient(90deg, #36d1dc, #5b86e5)",
                  border: "none",
                  color: "#fff",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.filter = "brightness(1.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.filter = "brightness(1)")
                }
              >
                Upload .xls
              </Button>
            </Upload>

            {fileList.length > 0 && (
              <span style={{ fontWeight: 500, color: "#1e3a8a" }}>
                {fileList[0].name}
              </span>
            )}
          </Space>

          {/* Right buttons */}
          <Space>
            <ImportDB data={data} />
            <ClearDB />
            <WHT />
          </Space>
        </Space>

        <Divider style={{ margin: "12px 0", borderColor: "#cbd5e1" }} />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          bordered
          scroll={{ x: "max-content", y: 320 }}
          sticky
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            placement: ["bottomCenter"], // replace deprecated 'placement'
          }}
          style={{
            background: "#ffffff",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
          rowClassName={() => "ant-table-row-hover"}
        />

        {/* Txt + Enc buttons inline */}
        <Space
          style={{
            marginTop: 15,
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Txt />
          <Enc />
        </Space>
        {/* <Gettext /> */}
      </Space>
    </div>
  );
}
