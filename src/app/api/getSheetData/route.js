import { sheets, SPREADSHEET_ID } from "@/lib/googleSheets";



export async function GET() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Clients!A2:V", // Skip header row
  });

  const rows = res.data.values || [];

  const getCurrentMonth = () => {
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const now = new Date();
    return monthNames[now.getMonth()];
  };


  // const getTotalDue = (payments) => {
  //   const currentMonth = getCurrentMonth();
  //   let dueCount = 0;
  //   let totalDueAmount = 0;
  //   let packagePrice = rows[7]; // Assuming package price is in column H (index 7)
  //   for (const paymentMonth in payments) {
  //     if (paymentMonth === currentMonth) {
  //       if (payments[paymentMonth] === "" || payments[paymentMonth].toLowerCase() === "due") {
  //         dueCount += 1;
  //         totalDueAmount += parseInt(packagePrice) || 0;
  //       }
  //     }
  //   }
  //   return { dueCount, totalDueAmount };
  // };



  const clients = rows.map((row, index) => ({
    no: index + 1,         // auto serial
    name: row[1] || "",
    client_id: row[2] || "",
    location: row[3] || "",
    address: row[4] || "",
    phone: row[5] || "",
    package_name: row[6] || "",
    package_price: row[7] || "",
    starting_date: row[8] || "",
    // total_due : getTotalDue(),
    payments: {
      JAN: row[9] || "",
      FEB: row[10] || "",
      MAR: row[11] || "",
      APR: row[12] || "",
      MAY: row[13] || "",
      JUN: row[14] || "",
      JUL: row[15] || "",
      AUG: row[16] || "",
      SEP: row[17] || "",
      OCT: row[18] || "",
      NOV: row[19] || "",
      DEC: row[20] || "",
    },
    notes: row[21] || "",
  }));

  return new Response(JSON.stringify(clients), {
    headers: { "Content-Type": "application/json" },
  });
}
