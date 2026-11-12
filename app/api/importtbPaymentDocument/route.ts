import { NextResponse } from "next/server";
import sql from "mssql";

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

type ImportRequestBody = {
  data: ChequeRow[];
};

export async function POST(req: Request) {
  try {
    const body: ImportRequestBody = await req.json();
    const { data } = body;

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No data to import" }, { status: 400 });
    }

    const pool = await sql.connect({
      user: "sa",
      password: "tns2007",
      server: "10.35.10.7",
      database: "ChequeDirect",
      options: { encrypt: false },
    });

    const tableName = "dbo.tbPaymentDocument";

    // ตรวจสอบว่ามีข้อมูลใน table หรือไม่
    const checkResult = await pool.request().query(`SELECT COUNT(*) AS count FROM ${tableName}`);
    const count = checkResult.recordset[0].count;

    if (count > 0) {
      return NextResponse.json(
        { error: "ยังมีข้อมูลในฐานข้อมูล กรุณา Clear Database ก่อน" },
        { status: 400 }
      );
    }

    // ถ้าว่างแล้วค่อย import
    for (const row of data) {
      await pool
        .request()
        .input("DocumentNo", sql.NVarChar, row.DocumentNo ?? "")
        .input("DocumentYear", sql.NVarChar, row.DocumentYear ?? "")
        .input("VendorCode", sql.NVarChar, row.VendorCode ?? "")
        .input("VendorName", sql.NVarChar, row.VendorName ?? "")
        .input("Bankname", sql.NVarChar, row.Bankname ?? "")
        .input("Amount", sql.Decimal(18, 2), row.Amount ?? 0)
        .input("Currency", sql.NVarChar, row.Currency ?? "")
        .input("RefDocument", sql.NVarChar, row.RefDocument ?? "")
        .query(
          `INSERT INTO ${tableName} 
          (DocumentNo, DocumentYear, VendorCode, VendorName, Bankname, Amount, Currency, RefDocument)
          VALUES (@DocumentNo, @DocumentYear, @VendorCode, @VendorName, @Bankname, @Amount, @Currency, @RefDocument)`
        );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "DB Error" }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import sql from "mssql";

// type ChequeRow = {
//   DocumentNo: string;
//   DocumentYear: string;
//   VendorCode: string;
//   VendorName: string;
//   Bankname: string;
//   Amount: number;
//   Currency: string;
//   RefDocument: string;
// };

// type ImportRequestBody = {
//   data: ChequeRow[];
// };

// export async function POST(req: Request) {
//   try {
//     const body: ImportRequestBody = await req.json();
//     const { data } = body;

//     if (!data || data.length === 0) {
//       return NextResponse.json({ error: "No data to import" }, { status: 400 });
//     }

//     const pool = await sql.connect({
//       user: "sa",
//       password: "tns2007",
//       server: "10.35.10.7",
//       database: "ChequeDirect",
//       options: { encrypt: false },
//     });

//     // ------------------------------
//     // 🔥 START TRANSACTION
//     // ------------------------------
//     const transaction = new sql.Transaction(pool);
//     await transaction.begin();

//     try {
//       const request = new sql.Request(transaction);

//       // --------------------------------------
//       // 🧹 ลบข้อมูลเก่าออกจากทุกตาราง
//       // --------------------------------------
//       await request.batch(`
//         DELETE FROM dbo.BSAK_Payment_Voucher;
//         DELETE FROM dbo.BSEG_Invoice;
//         DELETE FROM dbo.BSEG_Payment_Voucher;
//         DELETE FROM dbo.BSEG_VAT;
//         DELETE FROM dbo.WHT_Amt;
//         DELETE FROM dbo.tbPaymentDocument;
//       `);

//       // --------------------------------------
//       // 📝 Insert ข้อมูลใหม่
//       // --------------------------------------
//       for (const row of data) {
//         await new sql.Request(transaction)
//           .input("DocumentNo", sql.NVarChar, row.DocumentNo ?? "")
//           .input("DocumentYear", sql.NVarChar, row.DocumentYear ?? "")
//           .input("VendorCode", sql.NVarChar, row.VendorCode ?? "")
//           .input("VendorName", sql.NVarChar, row.VendorName ?? "")
//           .input("Bankname", sql.NVarChar, row.Bankname ?? "")
//           .input("Amount", sql.Decimal(18, 2), row.Amount ?? 0)
//           .input("Currency", sql.NVarChar, row.Currency ?? "")
//           .input("RefDocument", sql.NVarChar, row.RefDocument ?? "")
//           .query(`
//             INSERT INTO dbo.tbPaymentDocument
//             (DocumentNo, DocumentYear, VendorCode, VendorName, Bankname, Amount, Currency, RefDocument)
//             VALUES (@DocumentNo, @DocumentYear, @VendorCode, @VendorName, @Bankname, @Amount, @Currency, @RefDocument)
//           `);
//       }

//       // ------------------------------
//       // ✔ COMMIT
//       // ------------------------------
//       await transaction.commit();
//       return NextResponse.json({ success: true });

//     } catch (err) {
//       await transaction.rollback(); // ❌ error → rollback
//       throw err;
//     }

//   } catch (err) {
//     console.error("DB Error:", err);
//     return NextResponse.json({ error: "DB Error" }, { status: 500 });
//   }
// }
