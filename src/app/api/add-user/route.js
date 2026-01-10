import { sheets, SPREADSHEET_ID } from "@/lib/googleSheets";
import { revalidatePath } from "next/cache";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, client_id, location, address, phone, package_name, package_price } = body;

    // Append user to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Clients!A1:H1", // Columns A-H
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          "=ROW()-1", // No (leave empty; can auto-generate in sheet)
          name,
          client_id,
          location,
          address,
          phone,
          package_name,
          package_price,
        ]],
      },
    });

    revalidatePath("/");
    
    return new Response(JSON.stringify({ message: "User added successfully!" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
