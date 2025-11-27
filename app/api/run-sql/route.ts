// app/api/run-sql/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sql, { ConnectionPool } from "mssql";

interface RunSqlRequest {
  type: string;
  date: string; // DDMMYYYY
}

interface RunSqlResponse {
  message?: string;
  error?: string;
}

const dbConfig: sql.config = {
  user: "sa",
  password: "tns2007",
  server: "190.7.10.7",
  database: "ChequeDirect",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body: RunSqlRequest = await req.json();

    if (!body.type || !body.date) {
      return NextResponse.json(
        { error: "กรุณาส่ง type และ date ให้ครบ" },
        { status: 400 }
      );
    }

    if (!/^\d{8}$/.test(body.date)) {
      return NextResponse.json(
        { error: "รูปแบบวันที่ต้องเป็น DDMMYYYY" },
        { status: 400 }
      );
    }

    const sqlFilePath = path.join(
      process.cwd(),
      "public",
      "sql",
      `${body.type}.sql`
    );

    if (!fs.existsSync(sqlFilePath)) {
      return NextResponse.json(
        { error: `ไม่พบไฟล์ SQL ของ type: ${body.type}` },
        { status: 404 }
      );
    }

    let sqlContent = fs.readFileSync(sqlFilePath, "utf-8");

    // ตัด BOM อัตโนมัติถ้ามี
    if (sqlContent.charCodeAt(0) === 0xfeff) {
      sqlContent = sqlContent.slice(1);
    }

    // แทนวันที่ในไฟล์ SQL
    sqlContent = sqlContent.replace(
      /SET @CHQDATE\s*=\s*'.*?'/i,
      `SET @CHQDATE='${body.date}'`
    );

    const pool: ConnectionPool = await sql.connect(dbConfig);

    try {
      await pool.request().query(sqlContent);
    } finally {
      await pool.close();
    }

    return NextResponse.json({
      message: `Run SQL type ${body.type} วันที่ ${body.date} สำเร็จ`,
    });
  } catch (err) {
    let message = "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
    if (err instanceof Error) message = err.message;
    console.error("SQL Execution Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
