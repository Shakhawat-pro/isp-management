"use server";

import { sheets, SPREADSHEET_ID } from "@/lib/googleSheets";
import { revalidatePath } from "next/cache";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const getAllClients = async () => {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Clients!A2:V", // skip header
        });

        const rows = res.data.values || [];
        
        let total_due = 0;
        let total_collected = 0;
        let current_total_due = 0;
        let current_due_count = 0;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIndex = now.getMonth();
        const currentMonth = MONTHS[currentMonthIndex];

        const clients = rows.map((row, index) => {
            const package_price = parseFloat(row[7]) || 0;

            const starting_date = row[8] ? new Date(row[8]) : null;

            // ✅ Determine effective start month
            let effectiveStartMonth = 0; // January by default

            if (starting_date && !isNaN(starting_date)) {
                const startYear = starting_date.getFullYear();
                const startMonth = starting_date.getMonth();

                // If started THIS year → start from joining month
                if (startYear === currentYear) {
                    effectiveStartMonth = startMonth;
                }
                // If started BEFORE this year → start from January
            }

            const payments = MONTHS.reduce((acc, month, i) => {
                acc[month] = row[9 + i] || "";
                return acc;
            }, {});

            let client_due = 0;
            let client_paid = 0;

            // ✅ Only loop current year months
            for (let m = effectiveStartMonth; m <= currentMonthIndex; m++) {
                const monthName = MONTHS[m];
                const value = payments[monthName];

                const isPaid =
                    value &&
                    value.toString().trim() !== "" &&
                    value.toString().toLowerCase() !== "due";

                if (isPaid) {
                    client_paid += package_price;
                } else {
                    client_due += package_price;
                }
            }

            // ✅ Current month due tracking
            if (
                effectiveStartMonth <= currentMonthIndex &&
                (!payments[currentMonth] ||
                    payments[currentMonth].toLowerCase() === "due")
            ) {
                current_due_count++;
                current_total_due += package_price;
            }

            total_due += client_due;
            total_collected += client_paid;

            return {
                no: index + 1,
                name: row[1] || "",
                client_id: row[2] || "",
                location: row[3] || "",
                address: row[4] || "",
                phone: row[5] || "",
                package_name: row[6] || "",
                package_price,
                starting_date: row[8] || "",
                payments,
                total_due: client_due,
                total_paid: client_paid,
                notes: row[21] || "",
            };
        });

        const data = {
            total_clients: clients.length,
            total_due,
            total_collected,
            current_due_count,
            current_total_due,
            clients,
        };

        return { status: true, data };
    } catch (error) {
        console.error("Error fetching clients:", error);
        return { status: false, error: error.message, data: [] };
    }
};

export const addNewClient = async ({ clientData }) => {
    try {
        const { name, client_id, location, address, phone, package_name, package_price } = clientData;

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
        return {
            success: true,
            message: "User added successfully!"
        }
    } catch (err) {
        console.error("Error adding new client:", err);
        return {
            success: false,
            error: err,
            message: err.message || "Something went wrong"
        }
    }
}