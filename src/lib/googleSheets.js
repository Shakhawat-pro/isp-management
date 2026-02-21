import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
// const CREDENTIALS = JSON.parse(
//   process.env.GOOGLE_SHEETS_CREDENTIALS || "{}"
// );

const auth = new google.auth.GoogleAuth({
    credentials: {
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: (process.env.PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
        universe_domain: process.env.UNIVERSE_DOMAIN,
    },
    scopes: SCOPES,
});

export const sheets = google.sheets({ version: "v4", auth });

// Replace with your Google Sheet ID
export const SPREADSHEET_ID = "11RrVDvGqwdvNEWrBp8_z1ISAn8i3BON5uK5fB0oW78s";
