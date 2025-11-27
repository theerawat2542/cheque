import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// type ของ record ที่ query จากฐานข้อมูล
interface WHTRecord {
  Cl: string;
  CoCd: string;
  DocumentNo: string;
  Year: string;
  Itm: string;
  Withhldtaxtype: string;
  Wtaxbat: string;
  Withholdingtaxamnt: number;
}

const config = {
  user: "sa",
  password: "tns2007",
  server: "190.7.10.7",
  database: "ChequeDirect",
  options: {
    enableArithAbort: true,
    trustServerCertificate: true,
    encrypt: false,
  },
};

export async function GET(req: NextRequest) {
  try {
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .query(
        "select Cl, CoCd, DocumentNo, Year, Itm, Withhldtaxtype, Wtaxbat, Withholdingtaxamnt from dbo.WHT_Amt"
      );

    const records: WHTRecord[] = result.recordset; // type-safe

    return NextResponse.json(records);
  } catch (error) {
    let messageText = "Unknown error";

    if (error instanceof Error) {
      messageText = error.message;
    }

    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
