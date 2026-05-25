"use client";

import React, { useState } from "react";

import {
  Button,
  Modal,
  Table,
  message,
  Spin,
  Input,
  Space,
  Typography,
  Tag,
  Empty,
} from "antd";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

import {
  FileExcelOutlined,
  TableOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

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

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      title: "Cl",
      dataIndex: "Cl",
      width: 80,
    },

    {
      title: "CoCd",
      dataIndex: "CoCd",
      width: 100,
    },

    {
      title: "Document No",
      dataIndex: "DocumentNo",
      width: 160,
    },

    {
      title: "Year",
      dataIndex: "Year",
      width: 90,
    },

    {
      title: "Item",
      dataIndex: "Itm",
      width: 90,
    },

    {
      title: "Tax Type",
      dataIndex: "Withhldtaxtype",

      render: (value: string) => (
        <Tag
          color="blue"
          style={{
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {value}
        </Tag>
      ),
    },

    {
      title: "Wtaxbat",
      dataIndex: "Wtaxbat",
      width: 120,
    },

    {
      title: "Tax Amount",
      dataIndex: "Withholdingtaxamnt",
      align: "right" as const,

      render: (value: number) =>
        value?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }),
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/wht");

      if (!res.ok) throw new Error("Fetch error");

      const json: WHTApiResponse[] = await res.json();

      const mapped: WHTRow[] = json.map((item, idx) => ({
        key: idx.toString(),
        ...item,
      }));

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
      message.warning("ไม่มีข้อมูลสำหรับ Export");

      return;
    }

    setExportModal(true);
  };

  const exportExcel = () => {
    if (!filename.trim()) {
      message.warning("กรุณาระบุชื่อไฟล์");

      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      data.map(({ key, ...rest }) => rest),
    );

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "WHT_Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const finalName = filename.endsWith(".xlsx")
      ? filename
      : `${filename}.xlsx`;

    saveAs(blob, finalName);

    message.success("ดาวน์โหลดไฟล์สำเร็จ");

    setExportModal(false);

    setFilename("");
  };

  return (
    <>
      {/* WHT Button */}
      <Button
        icon={<TableOutlined />}
        onClick={handleOpen}
        style={{
          borderRadius: 8,
          background: "#f59e0b",
          borderColor: "#f59e0b",
          color: "#fff",
          fontWeight: 500,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      >
        WHT
      </Button>

      {/* Main Modal */}
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={1000}
        centered
        title={
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              WHT Data
            </div>

            <Text
              style={{
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Withholding Tax Information
            </Text>
          </div>
        }
        styles={{
          body: {
            paddingTop: 10,
          },
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={data}
              size="small"
              bordered={false}
              sticky
              rowHoverable
              scroll={{
                x: "max-content",
                y: 450,
              }}
              locale={{
                emptyText: <Empty description="ไม่มีข้อมูล" />,
              }}
              pagination={{
                current: currentPage,

                pageSize: pageSize,

                onChange: (page, size) => {
                  setCurrentPage(page);

                  setPageSize(size || 10);
                },

                showSizeChanger: true,

                pageSizeOptions: ["10", "20", "50", "100"],

                size: "small",

                position: ["bottomCenter"],
              }}
              style={{
                borderRadius: 10,
                overflow: "hidden",
              }}
            />

            {/* Bottom Action */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                Total : {data.length} rows
              </Text>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={openExportModal}
                style={{
                  borderRadius: 8,
                  background: "#059669",
                  borderColor: "#059669",
                  fontWeight: 500,
                }}
              >
                Export Excel
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Export Modal */}
      <Modal
        open={exportModal}
        onCancel={() => setExportModal(false)}
        onOk={exportExcel}
        okText="Download"
        cancelText="Cancel"
        centered
        title="Export Excel"
      >
        <Space
          direction="vertical"
          style={{
            width: "100%",
          }}
          size="middle"
        >
          <Text
            style={{
              fontSize: 13,
              color: "#475569",
            }}
          >
            ตั้งชื่อไฟล์ Excel
          </Text>

          <Input
            size="large"
            placeholder="เช่น WHT_Data"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            prefix={<FileExcelOutlined />}
            onPressEnter={exportExcel}
            style={{
              borderRadius: 10,
            }}
          />
        </Space>
      </Modal>
    </>
  );
}
