import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
// const CREDENTIALS = JSON.parse(
//   process.env.GOOGLE_SHEETS_CREDENTIALS || "{}"
// );

const auth = new google.auth.GoogleAuth({
    credentials: {
        type: process.env.NEXT_PUBLIC_TYPE,
        project_id: process.env.NEXT_PUBLIC_PROJECT_ID,
        private_key_id: process.env.NEXT_PUBLIC_PRIVATE_KEY_ID,
        private_key: (process.env.NEXT_PUBLIC_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        client_email: process.env.NEXT_PUBLIC_CLIENT_EMAIL,
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        auth_uri: process.env.NEXT_PUBLIC_AUTH_URI,
        token_uri: process.env.NEXT_PUBLIC_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.NEXT_PUBLIC_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.NEXT_PUBLIC_CLIENT_X509_CERT_URL,
        universe_domain: process.env.NEXT_PUBLIC_UNIVERSE_DOMAIN,
    },
    scopes: SCOPES,
});

export const sheets = google.sheets({ version: "v4", auth });

// Replace with your Google Sheet ID
export const SPREADSHEET_ID = "1aROMEspxEldesfmG7VZfIdHJV6Z7rStzOpbqNHl7QiA";
