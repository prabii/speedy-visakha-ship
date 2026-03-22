import { readFileSync } from 'fs';
import XLSX from 'xlsx';

const API = 'https://vz-ztf8.onrender.com/api';

const wb = XLSX.read(readFileSync('./public/VISAKHA.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

const items = [];

// ─── USA / CANADA  DOX & NON-DOX  (rows 4–22) ─────────────────────────────
// Cols: 0=WEIGHT | 1=USA-FEDEX | 2=USA-UPS | 3=USA-DHL |
//        4=CANADA-UPS | 5=CANADA-FEDEX | 6=CANADA-DHL
const colMap = [
  { country: 'USA',    service: 'FEDEX', col: 1 },
  { country: 'USA',    service: 'UPS',   col: 2 },
  { country: 'USA',    service: 'DHL',   col: 3 },
  { country: 'CANADA', service: 'UPS',   col: 4 },
  { country: 'CANADA', service: 'FEDEX', col: 5 },
  { country: 'CANADA', service: 'DHL',   col: 6 },
];

let category = '';
for (let i = 4; i <= 22; i++) {
  const row = data[i];
  if (!row) continue;
  const cell0 = row[0].toString().trim().toUpperCase();
  if (cell0 === 'DOX')     { category = 'DOX';     continue; }
  if (cell0 === 'NON DOX') { category = 'NON DOX'; continue; }
  const wRaw = row[0].toString().replace('+', '').trim();
  if (!wRaw || isNaN(parseFloat(wRaw))) continue;
  const weight = row[0].toString().trim() + ' kg';

  colMap.forEach(({ country, service, col }) => {
    const rate = parseFloat(row[col]);
    if (rate && !isNaN(rate)) {
      items.push({
        itemName:    `${category} ${weight}`,
        weight,
        country,
        serviceType: service,
        rate,
        currency:    'INR',
        destination: '',
      });
    }
  });
}

// ─── UNITED KINGDOM  (rows 50–56) ─────────────────────────────────────────
// Row 49: ["","","","WEIGHT","SKYNET","ICL ECO","ICL EXPRESS","PXC GLOBAL","ATLANTIC"]
const ukServices = ['SKYNET', 'ICL ECO', 'ICL EXPRESS', 'PXC GLOBAL', 'ATLANTIC'];
for (let i = 50; i <= 56; i++) {
  const row = data[i];
  if (!row) continue;
  const weight = row[3].toString().trim();
  if (!weight) continue;
  [4, 5, 6, 7, 8].forEach((col, idx) => {
    const rate = parseFloat(row[col]);
    if (rate && !isNaN(rate)) {
      items.push({
        itemName:    `UK ${weight}`,
        weight,
        country:     'UK',
        serviceType: ukServices[idx],
        rate,
        currency:    'INR',
        destination: '',
      });
    }
  });
}

// ─── EUROPE – ATLANTIC  (rows 59–73, cols 0–6) ────────────────────────────
const euW = ['6+', '8+', '11+', '16+', '21+', '25+'];
for (let i = 59; i <= 73; i++) {
  const row = data[i];
  if (!row || !row[0]) continue;
  const dest = row[0].toString().trim();
  if (!dest) continue;
  [1, 2, 3, 4, 5, 6].forEach((col, idx) => {
    const rate = parseFloat(row[col]);
    if (rate && !isNaN(rate)) {
      items.push({
        itemName:    `EU ATLANTIC ${euW[idx]}`,
        weight:      euW[idx] + ' kg',
        country:     'EUROPE',
        serviceType: 'ATLANTIC',
        destination: dest,
        rate,
        currency:    'INR',
      });
    }
  });
}

// ─── EUROPE – PACIFIC  (rows 59–73, cols 8–14) ────────────────────────────
for (let i = 59; i <= 73; i++) {
  const row = data[i];
  if (!row || !row[8]) continue;
  const dest = row[8].toString().trim();
  if (!dest) continue;
  [9, 10, 11, 12, 13, 14].forEach((col, idx) => {
    const rate = parseFloat(row[col]);
    if (rate && !isNaN(rate)) {
      items.push({
        itemName:    `EU PACIFIC ${euW[idx]}`,
        weight:      euW[idx] + ' kg',
        country:     'EUROPE',
        serviceType: 'PACIFIC',
        destination: dest,
        rate,
        currency:    'INR',
      });
    }
  });
}

// ─── EUROPE – EXPLUS  (rows 76–89, cols 0–6) ──────────────────────────────
for (let i = 76; i <= 89; i++) {
  const row = data[i];
  if (!row || !row[0]) continue;
  const dest = row[0].toString().trim();
  if (!dest) continue;
  [1, 2, 3, 4, 5, 6].forEach((col, idx) => {
    const rate = parseFloat(row[col]);
    if (rate && !isNaN(rate)) {
      items.push({
        itemName:    `EU EXPLUS ${euW[idx]}`,
        weight:      euW[idx] + ' kg',
        country:     'EUROPE',
        serviceType: 'EXPLUS',
        destination: dest,
        rate,
        currency:    'INR',
      });
    }
  });
}

// ─── EUROPE – ICL  (rows 76–89, cols 8–12) ───────────────────────────────
const iclW = ['6+', '11+', '16+', '21+'];
for (let i = 76; i <= 89; i++) {
  const row = data[i];
  if (!row || !row[8]) continue;
  const dest = row[8].toString().trim();
  if (!dest) continue;
  [9, 10, 11, 12].forEach((col, idx) => {
    const rate = parseFloat(row[col]);
    if (rate && !isNaN(rate)) {
      items.push({
        itemName:    `EU ICL ${iclW[idx]}`,
        weight:      iclW[idx] + ' kg',
        country:     'EUROPE',
        serviceType: 'ICL',
        destination: dest,
        rate,
        currency:    'INR',
      });
    }
  });
}

console.log(`\nParsed ${items.length} pricing items from VISAKHA.xlsx`);

// ─── POST to backend ───────────────────────────────────────────────────────
async function run() {
  // 1. Create an empty price sheet
  console.log('\nCreating price sheet...');
  const createRes = await fetch(`${API}/price-sheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sheetName:   'VISAKHA International Courier Rates',
      description: 'USA, Canada, UK, Europe, Australia, New Zealand rates – imported from VISAKHA.xlsx',
      isDefault:   true,
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
    console.error('Failed to create price sheet:', createData);
    process.exit(1);
  }
  const sheetId = createData.priceSheet._id;
  console.log('Price sheet created, ID:', sheetId);

  // 2. Bulk import items in chunks of 100
  const CHUNK = 100;
  for (let start = 0; start < items.length; start += CHUNK) {
    const chunk = items.slice(start, start + CHUNK);
    const bulkRes = await fetch(`${API}/price-sheets/${sheetId}/items/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: chunk }),
    });
    const bulkData = await bulkRes.json();
    if (!bulkRes.ok) {
      console.error('Bulk import error:', bulkData);
    } else {
      console.log(`  Imported ${start + chunk > items.length ? items.length - start : CHUNK} items (${Math.min(start + CHUNK, items.length)}/${items.length})`);
    }
  }

  console.log('\nDone! Price sheet is now active and will show on the home page.');
}

run().catch(console.error);
