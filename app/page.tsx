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
  Tag,
} from "antd";

import {
  UploadOutlined,
  DeleteOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

import * as XLSX from "xlsx";

import ClearDB from "./components/ClearDB";
import ImportDB from "./components/ImportDB";
import WHT from "./components/WHT";
import Txt from "./components/Txt";
import Enc from "./components/Enc";

import type { UploadFile, RcFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;

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

    message.info("ล้างข้อมูลเรียบร้อย");
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

        const workbook = XLSX.read(uint8Array, {
          type: "array",
        });

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
    {
      title: "Document No",
      dataIndex: "DocumentNo",
      width: 150,
    },

    {
      title: "Year",
      dataIndex: "DocumentYear",
      width: 100,
    },

    {
      title: "Vendor Code",
      dataIndex: "VendorCode",
      width: 150,
    },

    {
      title: "Vendor Name",
      dataIndex: "VendorName",
      width: 350,
    },

    {
      title: "Bankname",
      dataIndex: "Bankname",
      width: 200,
    },

    {
      title: "Amount",
      dataIndex: "Amount",
      align: "right" as const,

      render: (value: number) =>
        value?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }),
    },

    {
      title: "Currency",
      dataIndex: "Currency",

      render: (value: string) => (
        <Tag
          color="blue"
          style={{
            borderRadius: 6,
            paddingInline: 10,
          }}
        >
          {value}
        </Tag>
      ),
    },

    {
      title: "Reference",
      dataIndex: "RefDocument",
      width: 100,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "16px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <Title
            level={3}
            style={{
              margin: 0,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.2,
            }}
          >
            BBL Cheque Import
          </Title>

          <Text
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Import และจัดการข้อมูลเช็ค
          </Text>
        </div>

        <Space
          size="small"
          wrap
          style={{
            background: "#fff",
            padding: "6px 8px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
          }}
        >
          <WHT />
          <Txt />
          <Enc />
        </Space>
      </div>

      {/* Main Container */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          padding: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        }}
      >
        {/* Top Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Space size="small" wrap>
            <Upload {...uploadProps} showUploadList={false}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                Upload .xls
              </Button>
            </Upload>

            <ImportDB data={data} />

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleReset}
              style={{
                borderRadius: 8,
              }}
            >
              Reset
            </Button>

            {fileList.length > 0 && (
              <Tag
                icon={<FileExcelOutlined />}
                color="success"
                style={{
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 12,
                }}
              >
                {fileList[0].name}
              </Tag>
            )}
          </Space>

          <Space size="small">
            <ClearDB />
          </Space>
        </div>

        <Divider
          style={{
            margin: "10px 0 14px",
          }}
        />

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          size="small"
          bordered={false}
          sticky
          scroll={{
            x: "max-content",
            y: 430,
          }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            size: "small",
            position: ["bottomCenter"],
          }}
          style={{
            borderRadius: 10,
            overflow: "hidden",
          }}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />

        {/* Footer */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.8,
            }}
          >
            * WHT จะต้องผ่าน SAPGetData ก่อน
            <br />
            * TXT และ ENC จะต้อง Run SQL Script ก่อน
            <br />
            <a
              href="https://ihaier.feishu.cn/docx/Q2dndlLT4oZqBexsRpec0VrEnLg?from=from_copylink"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              อ่านคู่มือการใช้งาน
            </a>
          </div>

          <Text
            style={{
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            Total : {data.length} rows
          </Text>
        </div>
      </div>
    </div>
  );
}
