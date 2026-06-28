import { google } from "googleapis";
import config from "../config.js";

const auth = new google.auth.GoogleAuth({
    keyFile: "./credential.json",
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
    ]
});

async function sheetsApi() {
    const client = await auth.getClient();

    return google.sheets({
        version: "v4",
        auth: client
    });
}

export async function readData() {
    const sheets = await sheetsApi();

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: config.SPREADSHEET_ID,
        range: `${config.SHEET_ANGGOTA}!A:Z`
    });

    return res.data.values || [];
}
export async function appendData(data) {

    const sheets = await sheetsApi();

    await sheets.spreadsheets.values.append({

        spreadsheetId: config.SPREADSHEET_ID,

        range: `${config.SHEET_ANGGOTA}!A:Z`,

        valueInputOption: "RAW",

        requestBody: {

            values: [data]

        }

    });

}