import { google } from 'googleapis';
import { NextResponse } from 'next/server';

function getGoogleSheetsClient() {
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!privateKey) throw new Error('GOOGLE_PRIVATE_KEY is missing');
  privateKey = privateKey.replace(/^"+|"+$/g, '').replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function GET() {
  const sheets = getGoogleSheetsClient();
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'ENTRY', // adjust if needed
    });

    return NextResponse.json({ data: response.data.values });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch sheet data' }, { status: 500 });
  }
}

export async function POST(req) {
  const sheets = getGoogleSheetsClient();

  try {
    const body = await req.json();
    const { updates } = body; // updates = array of rows

    // Fetch current sheet data to determine where to append
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'ENTRY',
    });
    const currentRows = sheetData.data.values || [];

    // Always append all rows in updates to the first empty row after current data
    for (let i = 0; i < updates.length; i++) {
      const appendRowIndex = currentRows.length + 1 + i; // 1-based index
      const range = `ENTRY!A${appendRowIndex}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [updates[i]],
        },
      });
    }

    return NextResponse.json({ message: '✅ Changes saved successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '❌ Error saving changes' }, { status: 500 });
  }
}

export async function PUT(req) {
  const sheets = getGoogleSheetsClient();

  try {
    const body = await req.json();
    const { rowIndex, rowData } = body; // rowIndex: 0-based (excluding header), rowData: array of cell values

    // Row index in sheet (1-based, +1 for header)
    const sheetRowIndex = rowIndex + 2;
    const range = `ENTRY!A${sheetRowIndex}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({ message: '✅ Row updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '❌ Error updating row' }, { status: 500 });
  }
}