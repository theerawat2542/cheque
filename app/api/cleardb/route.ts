import { NextResponse } from "next/server";
import sql from "mssql";

export async function DELETE() {
  try {
    const pool = await sql.connect({
      user: "sa",
      password: "tns2007",
      server: "190.7.10.7",
      database: "ChequeDirect",
      options: {
        encrypt: false,
      },
    });

    const query = `
      delete from dbo.BSAK_Payment_Voucher;
      delete from dbo.BSEG_Invoice;
      delete from dbo.BSEG_Payment_Voucher;
      delete from dbo.BSEG_VAT;
      delete from dbo.WHT_Amt;
      delete from dbo.tbPaymentDocument;
    `;

    await pool.request().query(query);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}
