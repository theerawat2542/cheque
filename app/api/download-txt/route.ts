// app/api/download-txt/route.ts
import { NextResponse } from "next/server";
import sql from "mssql";

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

export async function GET() {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request().query(`
      SELECT [ResultData]
      FROM [ChequeDirect].[dbo].[tbResultData]
      ORDER BY IDData
    `);

    await pool.close();

    // รวมข้อมูลเป็นบรรทัด ๆ
    const textData = result.recordset
      .map((row) => row.ResultData)
      .join("\r\n");

    return new NextResponse(textData, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": "attachment; filename=ResultData.txt",
      },
    });
  } catch (err) {
    console.error("Download TXT Error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
