import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sql from "mssql";

export async function POST(req: Request) {
  try {
    const { chqDate } = await req.json();

    if (!chqDate || chqDate.length !== 8) {
      return NextResponse.json(
        { error: "Invalid date format, must be ddmmyyyy" },
        { status: 400 }
      );
    }

    // โหลดไฟล์ SQL
    const filePath = path.join(process.cwd(), "public", "sql", "KB_865.sql");
    let sqlText = fs.readFileSync(filePath, "utf8");

    // แทนค่าในไฟล์ SQL
    sqlText = sqlText.replace(
  /SET\s*@CHQDATE\s*=\s*'.*?'/i,
  `SET @CHQDATE='${chqDate}'`
);


    // Connect MSSQL
    const pool = await sql.connect({
      user: "sa",
      password: "tns2007",
      server: "190.7.10.7",
      database: "ChequeDirect",
      options: { encrypt: false },
    });

    const result = await pool.request().query(sqlText);

    return NextResponse.json({
      success: true,
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    console.error("SQL run error:", error);
    return NextResponse.json({ error: "SQL execution failed" }, { status: 500 });
  }
}
