// app/api/sheet/route.js
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  // Ensure private key is properly formatted
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('GOOGLE_PRIVATE_KEY is not set in environment variables');
  }
  // Remove leading/trailing quotes if present
  privateKey = privateKey.replace(/^"+|"+$/g, '');
  privateKey = privateKey.replace(/\\n/g, '\n');

  // TROUBLESHOOTING:
  // If you see ERR_OSSL_UNSUPPORTED, run your app with:
  // NODE_OPTIONS=--openssl-legacy-provider next dev
  // Or set NODE_OPTIONS in your environment.

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'ENTRY', // or your actual sheet name
    });

    return NextResponse.json({ data: response.data.values });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch sheet data' }, { status: 500 });
  }
}