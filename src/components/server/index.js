"use server";

import { sheets, SPREADSHEET_ID } from "@/lib/googleSheets";
import { revalidatePath } from "next/cache";
import { formatStorageDate, parseFlexibleDate } from "@/lib/dateUtils";

const MONTHS = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

const parsePaymentAmount = (value) => {
    if (!value) return 0;
    const text = value.toString().replace(/"/g, "").trim();
    if (!text) return 0;
    if (text.toLowerCase() === "due") return 0;

    const parts = text.split("-");
    if (parts.length >= 4) {
        const amount = parseFloat(parts[3]);
        return Number.isNaN(amount) ? 0 : amount;
    }

    const fallback = parseFloat(text);
    return Number.isNaN(fallback) ? 0 : fallback;
};

export const getLocationOptions = async () => {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "location!A2:A", // skip header
        });

        const rows = res.data.values || [];

        // Remove empty, duplicates, and format as { label, value }
        const locations = [...new Set(
            rows.map(row => row[0]).filter(loc => loc && loc.trim() !== "")
        )]
            .sort((a, b) => a.localeCompare(b))  // optional: alphabetical
            .map(loc => ({ label: loc, value: loc }));

        return { status: true, data: locations };
    } catch (error) {
        console.error("Error fetching locations:", error);
        return { status: false, error: error.message, data: [] };
    }
};

export const addLocation = async ({ location }) => {
    try {
        // Append location to Google Sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "location!A2:A", // Column A
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[location]],
            },
        });
        revalidatePath("/");
        return {
            success: true,
            message: "Location added successfully!"
        }
    } catch (err) {
        console.error("Error adding new location:", err);
        return {
            success: false,
            error: err,
            message: err.message || "Something went wrong"
        }
    }
};

export const deleteLocation = async ({ location }) => {
    try {
        // Get all locations
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "location!A2:A", // skip header
        });
        const rows = res.data.values || [];
        // Find the row index (in sheet, rows start at 2)
        const rowIndex = rows.findIndex(row => row[0] === location);
        if (rowIndex === -1) {
            throw new Error("Location not found");
        }
        // Delete the row by clearing its content
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `location!A${rowIndex + 2}`,
        });
        revalidatePath("/");
        return { success: true, message: "Location deleted successfully!" };
    } catch (err) {
        console.error("Error deleting location:", err);
        return { success: false, error: err, message: err.message || "Something went wrong" };
    }
};


export const getAllClients = async () => {
    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Clients!A2:V", // skip header
        });

        const rows = res.data.values || [];

        let total_due = 0;
        let total_collected = 0;
        let total_expected = 0;
        let current_total_due = 0;
        let current_due_count = 0;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIndex = now.getMonth();
        const currentMonth = MONTHS[currentMonthIndex];

        const clients = rows.map((row, index) => {
            const package_price = parseFloat(row[7]) || 0;
            const starting_date = parseFlexibleDate(row[8]);

            // ▶ Determine effective start month
            let effectiveStartMonth = 0;

            if (starting_date && !Number.isNaN(starting_date)) {
                const startYear = starting_date.getFullYear();
                const startMonth = starting_date.getMonth();

                if (startYear === currentYear) {
                    effectiveStartMonth = startMonth;
                } else if (startYear > currentYear) {
                    effectiveStartMonth = 12;
                }
            }

            // ▶ Collect payments
            const payments = MONTHS.reduce((acc, month, i) => {
                acc[month] = row[9 + i] || "";
                return acc;
            }, {});

            let client_due = 0;
            let client_paid_till_now = 0;
            let total_paid_all = 0;

            // ▶ Count ALL payments (including advance)
            MONTHS.forEach((month) => {
                const value = payments[month];
                const paidAmount = parsePaymentAmount(value);

                if (paidAmount > 0) {
                    total_paid_all += paidAmount;
                }
            });

            // ▶ Calculate due only till current month
            for (let m = effectiveStartMonth; m <= currentMonthIndex; m++) {
                const monthName = MONTHS[m];
                const value = payments[monthName];
                const paidAmount = parsePaymentAmount(value);

                if (paidAmount > 0) {
                    client_paid_till_now += paidAmount;
                } else {
                    client_due += package_price;
                }
            }

            // ▶ Current month due tracking
            if (
                effectiveStartMonth <= currentMonthIndex &&
                parsePaymentAmount(payments[currentMonth]) === 0
            ) {
                current_due_count++;
                current_total_due += package_price;
            }

            const advance_payment = total_paid_all - client_paid_till_now;

            total_due += client_due;
            total_collected += total_paid_all;
            total_expected += package_price;

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

                total_due: client_due,           // due till current month
                total_paid: total_paid_all,      // all payments
                advance_payment,                 // future payment

                notes: row[21] || "",
            };
        });

        const location = await getLocationOptions();

        return {
            status: true,
            data: {
                total_clients: clients.length,
                locations: location.data || [],
                total_due,
                total_collected,
                total_expected,
                current_due_count,
                current_total_due,
                clients,
            },
        };
    } catch (error) {
        console.error("Error fetching clients:", error);
        return { status: false, error: error.message, data: [] };
    }
};


export const addNewClient = async ({ clientData }) => {
    try {
        const { name, client_id, location, address, phone, package_name, package_price, starting_date } = clientData;
        const storedStartingDate = formatStorageDate(starting_date);

        // Append user to Google Sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Clients!A1:I1", // Columns A-I
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
                    storedStartingDate,
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


// Add payment for a client
export const addPayment = async ({ client_id, month, payment_data }) => {
    try {
        // console.log("data", payment_data);

        // Find the row for the client
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Clients!A2:V", // skip header
        });
        const rows = res.data.values || [];
        // Find the row index (in sheet, rows start at 2)
        const rowIndex = rows.findIndex(row => row[2] === client_id);
        if (rowIndex === -1) {
            throw new Error("Client not found");
        }
        // Find the column for the month
        const monthColMap = {
            JAN: 10, FEB: 11, MAR: 12, APR: 13, MAY: 14, JUN: 15,
            JUL: 16, AUG: 17, SEP: 18, OCT: 19, NOV: 20, DEC: 21
        };
        const col = monthColMap[month];
        if (!col) throw new Error("Invalid month");
        // Update the cell for the payment
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Clients!${String.fromCharCode(64 + col)}${rowIndex + 2}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[payment_data]],
            },
        });
        revalidatePath("/");
        return { success: true, message: "Payment added successfully!" };
    } catch (err) {
        console.error("Error adding payment:", err);
        return { success: false, error: err, message: err.message || "Something went wrong" };
    }
};