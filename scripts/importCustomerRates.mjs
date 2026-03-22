// One-time script to import customer-facing rates from image data into the live backend
const API = 'https://vz-ztf8.onrender.com/api';

const items = [
  // USA (FEDEX)
  { itemName: 'USA 0.5kg', weight: '0.5', country: 'USA', serviceType: 'FEDEX', rate: 2000, currency: 'INR', destination: '+GST' },
  { itemName: 'USA 1.0kg', weight: '1.0', country: 'USA', serviceType: 'FEDEX', rate: 2350, currency: 'INR', destination: '+GST' },
  { itemName: 'USA 1.5kg', weight: '1.5', country: 'USA', serviceType: 'FEDEX', rate: 2500, currency: 'INR', destination: '+GST' },
  { itemName: 'USA 2.0kg', weight: '2.0', country: 'USA', serviceType: 'FEDEX', rate: 2650, currency: 'INR', destination: '' },
  { itemName: 'USA 2.5kg', weight: '2.5', country: 'USA', serviceType: 'FEDEX', rate: 2800, currency: 'INR', destination: '' },
  { itemName: 'USA 3.0kg', weight: '3.0', country: 'USA', serviceType: 'FEDEX', rate: 2950, currency: 'INR', destination: '' },
  { itemName: 'USA 5.0kg', weight: '5.0', country: 'USA', serviceType: 'FEDEX', rate: 4500, currency: 'INR', destination: '' },
  { itemName: 'USA 21+kg', weight: '21+', country: 'USA', serviceType: 'FEDEX', rate: 635, currency: 'INR', destination: '/kg' },
  // CANADA (FEDEX)
  { itemName: 'CANADA 0.5kg', weight: '0.5', country: 'CANADA', serviceType: 'FEDEX', rate: 2100, currency: 'INR', destination: '+GST' },
  { itemName: 'CANADA 1.0kg', weight: '1.0', country: 'CANADA', serviceType: 'FEDEX', rate: 2400, currency: 'INR', destination: '+GST' },
  { itemName: 'CANADA 1.5kg', weight: '1.5', country: 'CANADA', serviceType: 'FEDEX', rate: 2700, currency: 'INR', destination: '+GST' },
  { itemName: 'CANADA 2.0kg', weight: '2.0', country: 'CANADA', serviceType: 'FEDEX', rate: 3000, currency: 'INR', destination: '' },
  { itemName: 'CANADA 2.5kg', weight: '2.5', country: 'CANADA', serviceType: 'FEDEX', rate: 3300, currency: 'INR', destination: '' },
  { itemName: 'CANADA 3.0kg', weight: '3.0', country: 'CANADA', serviceType: 'FEDEX', rate: 3600, currency: 'INR', destination: '' },
  { itemName: 'CANADA 4.0kg', weight: '4.0', country: 'CANADA', serviceType: 'FEDEX', rate: 4100, currency: 'INR', destination: '' },
  { itemName: 'CANADA 5.0kg', weight: '5.0', country: 'CANADA', serviceType: 'FEDEX', rate: 4600, currency: 'INR', destination: '' },
  { itemName: 'CANADA 21+kg', weight: '21+', country: 'CANADA', serviceType: 'FEDEX', rate: 700, currency: 'INR', destination: '/kg' },
  // UK (FEDEX)
  { itemName: 'UK 0.5kg', weight: '0.5', country: 'UK', serviceType: 'FEDEX', rate: 2000, currency: 'INR', destination: '' },
  { itemName: 'UK 1.0kg', weight: '1.0', country: 'UK', serviceType: 'FEDEX', rate: 2200, currency: 'INR', destination: '' },
  { itemName: 'UK 1.5kg', weight: '1.5', country: 'UK', serviceType: 'FEDEX', rate: 2500, currency: 'INR', destination: '' },
  { itemName: 'UK 2.0kg', weight: '2.0', country: 'UK', serviceType: 'FEDEX', rate: 2800, currency: 'INR', destination: '' },
  { itemName: 'UK 2.5kg', weight: '2.5', country: 'UK', serviceType: 'FEDEX', rate: 3100, currency: 'INR', destination: '' },
  { itemName: 'UK 3.0kg', weight: '3.0', country: 'UK', serviceType: 'FEDEX', rate: 3400, currency: 'INR', destination: '' },
  { itemName: 'UK 4.0kg', weight: '4.0', country: 'UK', serviceType: 'FEDEX', rate: 3600, currency: 'INR', destination: '' },
  { itemName: 'UK 5.0kg', weight: '5.0', country: 'UK', serviceType: 'FEDEX', rate: 4000, currency: 'INR', destination: '' },
  { itemName: 'UK 21+kg', weight: '21+', country: 'UK', serviceType: 'FEDEX', rate: 700, currency: 'INR', destination: '/kg' },
  // AUSTRALIA (FEDEX)
  { itemName: 'AUSTRALIA 0.5kg', weight: '0.5', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 2200, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 1.0kg', weight: '1.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 2500, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 1.5kg', weight: '1.5', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 2800, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 2.0kg', weight: '2.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 3100, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 2.5kg', weight: '2.5', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 3400, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 3.0kg', weight: '3.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 3700, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 4.0kg', weight: '4.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 4400, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 5.0kg', weight: '5.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 4900, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 6.0kg', weight: '6.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 5400, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 7.0kg', weight: '7.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 6000, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 8.0kg', weight: '8.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 7000, currency: 'INR', destination: '' },
  { itemName: 'AUSTRALIA 9.0kg', weight: '9.0', country: 'AUSTRALIA', serviceType: 'FEDEX', rate: 8000, currency: 'INR', destination: '' },
];

async function run() {
  console.log(`Creating public customer price sheet with ${items.length} items...`);
  const createRes = await fetch(`${API}/price-sheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sheetName: 'Customer Rates',
      description: 'FEDEX rates for USA, Canada, UK, Australia – displayed on public website',
      isPublic: true,
      isDefault: false,
    }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) { console.error('Failed:', createData); process.exit(1); }
  const sheetId = createData.priceSheet._id;
  console.log('Sheet created, ID:', sheetId);

  const bulkRes = await fetch(`${API}/price-sheets/${sheetId}/items/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const bulkData = await bulkRes.json();
  if (!bulkRes.ok) { console.error('Bulk import failed:', bulkData); process.exit(1); }
  console.log(`Imported ${bulkData.addedCount} items. Done!`);
}

run().catch(console.error);
