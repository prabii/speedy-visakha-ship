// pdfGenerator.ts - Production-Ready PDF Generator with Proper Alignment
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

// ====================== TYPE DEFINITIONS ======================
export interface ShipperDetails {
  companyName: string;
  contactName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  telephone: string;
  mobileNo?: string;
  email?: string;
  documentType?: string;
  documentNo?: string;
}

export interface ConsigneeDetails {
  companyName: string;
  contactName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  telephone: string;
  mobileNo?: string;
  email?: string;
}

export interface InvoiceItem {
  boxNo: string;
  description: string;
  hsnCode: string;
  quantity: number;
  weight: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  exporterRef: string;
  awbNo?: string;
  pieces: string;
  weight?: string;
  shipper: ShipperDetails;
  consignee: ConsigneeDetails;
  preCarriageBy?: string;
  portOfReceipt?: string;
  vesselFlightNo?: string;
  placeOfLoading: string;
  countryOfOrigin: string;
  portOfDischarge: string;
  finalDestination: string;
  countryOfDestination: string;
  otherReference?: string;
  termOfDelivery?: string;
  items: InvoiceItem[];
  totalAmount: number;
}

export interface AWBData {
  awbNo: string;
  accountNo: string;
  customer: string;
  origin: string;
  destination: string;
  service: string;
  bookingDate: string;
  companyName?: string;
  website?: string;
  email?: string;
  shipper: ShipperDetails;
  consignee: ConsigneeDetails;
  description: string;
  pieces: string;
  weight: string;
  chargeableWeight: string;
  shipmentValue: string;
  volumetricWeight?: string;
  dimensions?: string;
  paymentMethod: string;
  invoiceNo?: string;
  routingCode?: string;
  ewayBillNo?: string;
  gstNo: string;
}

// ====================== CONSTANTS ======================
const PAGE_CONFIG = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
  margin: 10, // Standard margin in mm
  marginTop: 15, // Top margin for header
  marginBottom: 20, // Bottom margin for footer
};

// ====================== INDIAN NUMBER TO WORDS ======================
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
};

// ====================== BARCODE GENERATOR ======================
const generateBarcode = (text: string): string | null => {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text || '000000000000', {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: false,
      margin: 10,
      flat: true
    });
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Barcode error:', e);
    return null;
  }
};

// ====================== HIGH-QUALITY LOGO LOADER ======================
const loadLogo = async (customLogo?: string | null): Promise<{ data: string; format: string; width: number; height: number } | null> => {
  // First, try to use custom uploaded logo
  if (customLogo) {
    try {
      const img = new Image();
      return new Promise((resolve) => {
        img.onload = () => {
          // Determine format from base64 string
          let format = 'PNG';
          if (customLogo.startsWith('data:image/jpeg') || customLogo.startsWith('data:image/jpg')) {
            format = 'JPEG';
          } else if (customLogo.startsWith('data:image/png')) {
            format = 'PNG';
          }
          resolve({ 
            data: customLogo, 
            format, 
            width: img.width, 
            height: img.height 
          });
        };
        img.onerror = () => resolve(null);
        img.src = customLogo;
      });
    } catch (e) {
      console.warn('Failed to load custom logo:', e);
    }
  }

  // Check localStorage for uploaded logo
  try {
    const storedLogo = localStorage.getItem('invoice_logo');
    if (storedLogo) {
      const img = new Image();
      return new Promise((resolve) => {
        img.onload = () => {
          let format = 'PNG';
          if (storedLogo.startsWith('data:image/jpeg') || storedLogo.startsWith('data:image/jpg')) {
            format = 'JPEG';
          } else if (storedLogo.startsWith('data:image/png')) {
            format = 'PNG';
          }
          resolve({ 
            data: storedLogo, 
            format, 
            width: img.width, 
            height: img.height 
          });
        };
        img.onerror = () => resolve(null);
        img.src = storedLogo;
      });
    }
  } catch (e) {
    // localStorage might not be available
    console.warn('Failed to load logo from localStorage:', e);
  }

  // Fallback to default logo paths
  const paths = [
    { path: '/VZlogo.png', format: 'PNG' },
    { path: '/VZlogo.png', format: 'PNG' }, // Try again with cache bust
    { path: '/vzlogo.jpg', format: 'JPEG' },
    { path: '/logo.png', format: 'PNG' },
    { path: '/logo.jpg', format: 'JPEG' },
    { path: './VZlogo.png', format: 'PNG' },
    { path: './vzlogo.jpg', format: 'JPEG' },
    { path: './logo.png', format: 'PNG' },
    { path: './logo.jpg', format: 'JPEG' }
  ];
  
  for (const { path, format } of paths) {
    try {
      // Add cache-busting parameter to ensure fresh logo load
      const cacheBuster = `?t=${Date.now()}`;
      const res = await fetch(path + cacheBuster, { cache: 'no-cache' });
      if (res.ok) {
        const blob = await res.blob();
        // Convert blob to base64 with proper image dimensions
        const base64 = await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            resolve(null);
          };
          reader.readAsDataURL(blob);
        });
        
        if (base64) {
          // Get image dimensions to preserve aspect ratio
          const img = new Image();
          return new Promise((resolve) => {
            img.onload = () => {
              resolve({ 
                data: base64, 
                format, 
                width: img.width, 
                height: img.height 
              });
            };
            img.onerror = () => resolve(null);
            img.src = base64;
          });
        }
      }
    } catch (e) {
      console.warn(`Failed to load logo from ${path}:`, e);
    }
  }
  return null;
};

// ====================== HELPER: Add Logo with Aspect Ratio ======================
const addLogoWithAspectRatio = (
  doc: jsPDF, 
  logo: { data: string; format: string; width: number; height: number },
  x: number,
  y: number,
  maxWidth: number = 50,
  maxHeight: number = 20
): number => {
  const aspectRatio = logo.width / logo.height;
  let width = maxWidth;
  let height = maxWidth / aspectRatio;
  
  // If height exceeds max, scale down
  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }
  
  doc.addImage(logo.data, logo.format, x, y, width, height);
  return height; // Return actual height used
};

// ====================== HELPER: Check Page Break ======================
const checkPageBreak = (doc: jsPDF, y: number, requiredSpace: number): number => {
  const pageHeight = PAGE_CONFIG.height;
  const marginBottom = PAGE_CONFIG.marginBottom;
  const availableHeight = pageHeight - y - marginBottom;
  
  if (requiredSpace > availableHeight) {
    doc.addPage();
    return PAGE_CONFIG.marginTop;
  }
  return y;
};

// ====================== HELPER: Wrap Text ======================
const wrapText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > maxWidth && i > 0) {
      doc.text(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  doc.text(line, x, currentY);
  return currentY + lineHeight;
};

// ====================== PARTY BOX CONTENT (NO BORDER) ======================
const renderPartyBoxContent = (
  doc: jsPDF,
  startY: number,
  x: number,
  width: number,
  title: string,
  party: ShipperDetails | ConsigneeDetails,
  boxNoLabel?: string
): number => {
  const paddingX = 4;
  const paddingY = 5;
  const lineHeight = 5;
  const innerWidth = width - paddingX * 2;

  let currentY = startY + paddingY;

  const drawLabelValue = (label: string, value?: string) => {
    if (!value) return;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const labelX = x + paddingX;
    const labelY = currentY;
    doc.text(label, labelX, labelY);

    const labelWidth = doc.getTextWidth(label) + 2;

    doc.setFont('helvetica', 'normal');
    const valueX = labelX + labelWidth;
    const maxValueWidth = innerWidth - labelWidth;

    const wrapped = doc.splitTextToSize(value, maxValueWidth);

    wrapped.forEach((line, idx) => {
      doc.text(line, valueX, currentY);
      if (idx < wrapped.length - 1) currentY += lineHeight;
    });

    currentY += lineHeight;
  };

  // ==== TITLE ====
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + paddingX, currentY);
  currentY += lineHeight + 1;

  // ==== NAME ====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const name = party.companyName || party.contactName || '';
  if (name) {
    const nameLines = doc.splitTextToSize(name, innerWidth);
    nameLines.forEach((line) => {
      doc.text(line, x + paddingX, currentY);
      currentY += lineHeight;
    });
  }

  // ==== DETAILS ====
  drawLabelValue('ATTENTION:', party.contactName || '');

  const addrParts: string[] = [];
  if (party.address1) addrParts.push(party.address1);
  if (party.address2) addrParts.push(party.address2);
  const cityState = [party.city, party.state].filter(Boolean).join(', ');
  if (cityState) addrParts.push(cityState);
  if (party.country) addrParts.push(party.country);
  const addressValue = addrParts.join(', ');

  drawLabelValue('ADDRESS:', addressValue || '');
  drawLabelValue('Postal code:', party.pincode || '');
  if (party.email) drawLabelValue('EMAIL:', party.email);
  drawLabelValue('PHONE NUMBER:', party.telephone || '');
  if (boxNoLabel) drawLabelValue('BOX NO.:', boxNoLabel);

  // return bottom Y of content (no border here)
  return currentY + paddingY;
};

// ====================== COMMERCIAL INVOICE ======================
export const generateInvoicePDF = async (
  data: InvoiceData,
  gstNo: string = '37HVGPP7046R1ZG',
  customLogo?: string | null
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = PAGE_CONFIG.width;
  const fullWidth = pageWidth - 2 * PAGE_CONFIG.margin;
  let y = PAGE_CONFIG.marginTop;

  // ====== HEADER ======
  // Right header box: define position first
  const headerBoxWidth = 80;                  // a bit wider
  const headerX = pageWidth - PAGE_CONFIG.margin - headerBoxWidth;
  const headerY = y + 4;
  
  // Calculate left section width (for logo centering)
  const leftSectionWidth = headerX - PAGE_CONFIG.margin - 4; // Leave some gap before header box
  
  // Load and position logo on the left side
  const logo = await loadLogo(customLogo);
  let logoHeight = 0;
  if (logo) {
    // Increased logo size for better visibility
    const logoMaxWidth = 70; // Increased from 50mm to 70mm
    const logoMaxHeight = 35; // Increased from 25mm to 35mm
    
    // Calculate logo dimensions with aspect ratio
    const aspectRatio = logo.width / logo.height;
    let logoWidth = logoMaxWidth;
    let calculatedHeight = logoMaxWidth / aspectRatio;
    
    // If height exceeds max, scale down proportionally
    if (calculatedHeight > logoMaxHeight) {
      calculatedHeight = logoMaxHeight;
      logoWidth = logoMaxHeight * aspectRatio;
    }
    
    // Position logo on the left side (aligned to left margin)
    const logoX = PAGE_CONFIG.margin;
    const logoY = y;
    
    doc.addImage(logo.data, logo.format, logoX, logoY, logoWidth, calculatedHeight);
    logoHeight = calculatedHeight;
  }

  // Title positioned BELOW logo with proper spacing (no overlap)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  // Position title below logo with good spacing (8mm gap)
  const titleY = y + logoHeight + 8;

  const titleAreaRight = headerX - 2;
  const titleCenterX = (PAGE_CONFIG.margin + titleAreaRight) / 2;
  doc.text('PROFORMA INVOICE', titleCenterX, titleY, { align: 'center' });

  // Header box text (auto height)
  doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
  let infoY = headerY + 6;
  doc.text(`INVOICE NO. : ${data.invoiceNo}`, headerX + 3, infoY); infoY += 5;
  doc.text(`INVOICE DATE: ${data.invoiceDate}`, headerX + 3, infoY); infoY += 5;
  doc.text(`TOTAL PIECE : ${data.pieces}`, headerX + 3, infoY); infoY += 5;

  // draw the box AFTER we know the content height
  const headerBoxHeight = (infoY - headerY) + 2;
  doc.setLineWidth(0.5);
  doc.rect(headerX, headerY, headerBoxWidth, headerBoxHeight);

  // Left: Barcode directly under title (with proper spacing)
  const barcodeHeight = 14;
  const barcodeWidth = fullWidth * 0.55;
  const barcodeAreaY = titleY + 8; // Add more space after title

  const awbValue = data.awbNo || data.invoiceNo || '';

  const barcode = generateBarcode(awbValue || '000000000000');
  if (barcode) {
    doc.addImage(
      barcode,
      'PNG',
      PAGE_CONFIG.margin,
      barcodeAreaY,
      barcodeWidth,
      barcodeHeight
    );
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `AWB NO :  ${awbValue}`,
    PAGE_CONFIG.margin + 2,
    barcodeAreaY + barcodeHeight + 5
  );
    
  // New Y after header section (space before blocks)
  y = barcodeAreaY + barcodeHeight + 14;

  // ====== SHIPPER / CONSIGNEE SECTION (same height, side by side) ======
  y = checkPageBreak(doc, y, 60);

  const boxGap = 4;
  const fullWidthBlocks = pageWidth - 2 * PAGE_CONFIG.margin;
  const boxWidth = (fullWidthBlocks - boxGap) / 2;
  const shipperX = PAGE_CONFIG.margin;
  const consigneeX = PAGE_CONFIG.margin + boxWidth + boxGap;

  // group items by box to get first box no
  const itemsByBox = data.items.reduce((acc: Record<string, InvoiceItem[]>, item) => {
    const box = item.boxNo || '1';
    if (!acc[box]) acc[box] = [];
    acc[box].push(item);
    return acc;
  }, {} as Record<string, InvoiceItem[]>);

  const firstBoxNo = Object.keys(itemsByBox).sort()[0] || '1';

  const boxesStartY = y;

  // 1) Render content for both boxes (no borders yet)
  const shipperBottomY = renderPartyBoxContent(
    doc,
    boxesStartY,
    shipperX,
    boxWidth,
    'SHIPPER :',
    data.shipper,
    firstBoxNo
  );

  const consigneeBottomY = renderPartyBoxContent(
    doc,
    boxesStartY,
    consigneeX,
    boxWidth,
    'CONSIGNEE :',
    data.consignee
  );

  // 2) Compute common height and draw matching rectangles
  const commonBottomY = Math.max(shipperBottomY, consigneeBottomY);
  const boxHeight = commonBottomY - boxesStartY;

  doc.setLineWidth(0.5);
  doc.rect(shipperX,  boxesStartY, boxWidth, boxHeight);
  doc.rect(consigneeX, boxesStartY, boxWidth, boxHeight);

  // 3) Move y below the taller one
  y = commonBottomY + 8;

  // ====== ITEMS TABLE (with BOX NO rows like sample) ======
  let sr = 1;

  Object.keys(itemsByBox)
    .sort()
    .forEach((boxNo, idx) => {
      if (idx > 0) y += 4; // spacing between boxes

      y = checkPageBreak(doc, y, 40);

      // BOX NO row spanning table width
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`BOX NO. : ${boxNo}`, PAGE_CONFIG.margin + fullWidth / 2, y, {
        align: 'center'
      });
      y += 4;

    const body = itemsByBox[boxNo].map((item) => {
      // Format HSN code to 9 digits (pad with zeros if needed)
      const hsnCode = item.hsnCode ? item.hsnCode.toString().padStart(9, '0').slice(0, 9) : '000000000';
      return [
        sr++,
        item.description,
        hsnCode,
        'PCS',
        item.quantity,
        item.weight.toFixed(3),
        item.rate.toFixed(2),
        item.amount.toFixed(2),
      ];
    });

    autoTable(doc, {
      startY: y,
        head: [['SR. NO.', 'DESCRIPTION', 'HS CODE', 'UNIT TYPE', 'QTY', 'WEIGHT', 'UNIT RATE', 'AMOUNT (INR)']],
      body,
      theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { 
          fillColor: [120, 120, 120],
          textColor: [255, 255, 255],
        fontStyle: 'bold',
          fontSize: 9,
      },
      bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
      },
      columnStyles: {
          0: { cellWidth: 14, halign: 'center' },
          1: { cellWidth: 60 },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 16, halign: 'center' },
          5: { cellWidth: 18, halign: 'right' },
          6: { cellWidth: 18, halign: 'right' },
          7: { cellWidth: 24, halign: 'right' },
      },
        margin: { left: PAGE_CONFIG.margin, right: PAGE_CONFIG.margin },
    });

      y = (doc as any).lastAutoTable.finalY + 4;
  });

  // ====== TOTAL (right aligned) ======
  y = checkPageBreak(doc, y, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  const amountColWidth = 24; // matches last column width above
  const amountColStart = pageWidth - PAGE_CONFIG.margin - amountColWidth;
  const totalLabelX = amountColStart - 20;

  doc.text('TOTAL (INR):', totalLabelX, y);
  doc.text(data.totalAmount.toFixed(2), pageWidth - PAGE_CONFIG.margin, y, {
    align: 'right',
  });

  y += 8;

  // ====== BOTTOM BLOCKS (like 2nd image) ======
  // 1) Country of Origin / Destination row
  const rowHeight = 8;
  const halfWidth = fullWidth / 2;

  y = checkPageBreak(doc, y, 40);

  doc.setLineWidth(0.3);
  // country row
  doc.rect(PAGE_CONFIG.margin, y, halfWidth, rowHeight);
  doc.rect(PAGE_CONFIG.margin + halfWidth, y, halfWidth, rowHeight);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Country of Origin :  ${data.countryOfOrigin || 'INDIA'}`,
    PAGE_CONFIG.margin + 2,
    y + 5
  );
  doc.text(
    `Country of Destination :  ${data.countryOfDestination || data.finalDestination || ''}`,
    PAGE_CONFIG.margin + halfWidth + 2,
    y + 5
  );

  y += rowHeight;

  // 2) Amount in word + Total (boxed)
  const amountRowHeight = 10;
  const totalBoxWidth = 35;

  doc.rect(PAGE_CONFIG.margin, y, fullWidth - totalBoxWidth, amountRowHeight);
  doc.rect(
    PAGE_CONFIG.margin + fullWidth - totalBoxWidth,
    y,
    totalBoxWidth,
    amountRowHeight
  );

  const amountWords =
    `INR ${numberToWords(Math.round(data.totalAmount))} RUPEES ONLY`;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('AMOUNT IN WORD', PAGE_CONFIG.margin + 2, y + 4);
  doc.setFont('helvetica', 'normal');
  const wordLines = doc.splitTextToSize(amountWords, fullWidth - totalBoxWidth - 6);
  doc.text(wordLines, PAGE_CONFIG.margin + 2, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', PAGE_CONFIG.margin + fullWidth - totalBoxWidth + 4, y + 4);
  doc.text(
    data.totalAmount.toFixed(2),
    PAGE_CONFIG.margin + fullWidth - 4,
    y + 8,
    { align: 'right' }
  );

  y += amountRowHeight;

  // 3) Invoice Terms + Signature/Stamp
  const termsRowHeight = 10;

  doc.rect(PAGE_CONFIG.margin, y, halfWidth, termsRowHeight);
  doc.rect(PAGE_CONFIG.margin + halfWidth, y, halfWidth, termsRowHeight);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE TERMS', PAGE_CONFIG.margin + 2, y + 4);
  doc.setFont('helvetica', 'normal');
  if (data.termOfDelivery) {
    const termsLines = doc.splitTextToSize(data.termOfDelivery, halfWidth - 4);
    doc.text(termsLines, PAGE_CONFIG.margin + 2, y + 8);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('SIGNATURE / STAMP', PAGE_CONFIG.margin + halfWidth + 2, y + 4);

  y += termsRowHeight;

  // 4) Notes row (PERSONAL USE - NOT FOR SALE)
  const notesRowHeight = 8;
  doc.rect(PAGE_CONFIG.margin, y, fullWidth, notesRowHeight);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const notesText = 'PERSONAL USE - NOT FOR SALE';
  const notesLines = doc.splitTextToSize(notesText, fullWidth - 4);
  doc.text(notesLines, PAGE_CONFIG.margin + 2, y + 5);

  y += notesRowHeight + 6;

  // Right-side "For <Company> / Authorized Signatory" like 2nd image
  y = checkPageBreak(doc, y, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const companyName = data.shipper.companyName || 'Company';
  doc.text(
    `For ${companyName}`,
    pageWidth - PAGE_CONFIG.margin,
    y,
    { align: 'right' }
  );
  y += 12;
  doc.text(
    'Authorized Signatory',
    pageWidth - PAGE_CONFIG.margin,
    y,
    { align: 'right' }
  );

  // GST at very bottom
  const pageCount = doc.getNumberOfPages();
  doc.setPage(pageCount);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `GST No: ${gstNo}`,
    PAGE_CONFIG.margin,
    PAGE_CONFIG.height - PAGE_CONFIG.marginBottom
  );

  // Return PDF as blob instead of saving directly
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};


// ====================== AWB PDF ======================
// ====================== AWB PDF (clean layout) ======================
// ====================== AWB PDF (New Courier Layout) ======================
// ====================== AWB PDF (Courier-Style Grid Layout) ======================
export const generateAWBPDF = async (data: AWBData, customLogo?: string | null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = PAGE_CONFIG.width;
  const margin = PAGE_CONFIG.margin;
  const contentWidth = pageWidth - 2 * margin;
  let y = PAGE_CONFIG.marginTop;

  // ---------- HEADER: Logo (Left) + AWB (Right) ----------
  // Pre-compute AWB box position (right side)
  const awbBoxW = 60;
  const awbBoxH = 16;
  const awbBoxX = pageWidth - margin - awbBoxW;
  const awbBoxY = y + 2;

  // Calculate left section width (for logo centering)
  const leftSectionWidth = awbBoxX - margin - 4; // Leave some gap before AWB box
  
  // Check if custom logo is being used (either passed as parameter or in localStorage)
  const hasCustomLogo = customLogo || (typeof window !== 'undefined' && localStorage.getItem('invoice_logo'));
  
  // Load and position logo on the left side
  const logo = await loadLogo(customLogo);
  let logoH = 0;
  if (logo) {
    // Increased logo size to reduce empty space
    const logoMaxWidth = 80; // Increased to 80mm
    const logoMaxHeight = 40; // Increased to 40mm
    
    // Calculate logo dimensions with aspect ratio
    const aspectRatio = logo.width / logo.height;
    let logoWidth = logoMaxWidth;
    let logoHeight = logoMaxWidth / aspectRatio;
    
    // If height exceeds max, scale down proportionally
    if (logoHeight > logoMaxHeight) {
      logoHeight = logoMaxHeight;
      logoWidth = logoMaxHeight * aspectRatio;
    }
    
    // Position logo on the left side (aligned to left margin)
    const logoX = margin;
    const logoY = y;
    
    doc.addImage(logo.data, logo.format, logoX, logoY, logoWidth, logoHeight);
    logoH = logoHeight;
    
    // Add company address below logo ONLY if using default logo (not custom uploaded logo)
    if (!hasCustomLogo) {
      const addressY = logoY + logoHeight + 2; // Reduced gap from logo
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const companyName = data.companyName || 'VISAKHA INTERNATIONAL COURIERS';
      // Always use Visakhacouriers.in (replacing WWW.VISAKHACOURIERS.COM)
      const website = 'Visakhacouriers.in';
      const email = 'Visakhacourier@gmail.com';
      const companyAddress = '7-17-7/2, Opp. Redcherry Bakery, Old Gajuwaka, Visakhapatnam - 530026, Andhra Pradesh, India';
      
      // Company name
      doc.text(companyName, logoX, addressY);
      
      // Address lines - tighter spacing
      let currentY = addressY + 3.5; // Reduced gap after company name
      const addressLines = doc.splitTextToSize(companyAddress, leftSectionWidth - 4);
      addressLines.forEach((line: string) => {
        doc.text(line, logoX, currentY);
        currentY += 3; // Tighter spacing between address lines
      });
      
      // Website, email, and GST - all grouped together
      currentY += 2; // Small gap after address
      doc.text(website, logoX, currentY);
      currentY += 3; // Tighter spacing
      doc.text(email, logoX, currentY);
      currentY += 3; // Tighter spacing
      
      // GST number
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`GST No: ${data.gstNo}`, logoX, currentY);
      
      // Reset font size for rest of document
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      // Calculate total height - all elements grouped together
      logoH = logoHeight + 2 + 3.5 + (addressLines.length * 3) + 2 + 3 + 3 + 4; // All elements with tighter spacing
    } else {
      logoH = logoHeight; // No address for custom logo
    }
  }

  // ---- AWB box on right (number only) ----
  doc.setLineWidth(0.4);
  doc.rect(awbBoxX, awbBoxY, awbBoxW, awbBoxH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('AWB NO :', awbBoxX + 3, awbBoxY + 6);
  doc.setFontSize(12);
  doc.text(data.awbNo, awbBoxX + 3, awbBoxY + 13);

  // Barcode under box
  const barcodeImg = generateBarcode(data.awbNo);
  const barcodeW = 70;
  const barcodeH = 14;
  const barcodeX = pageWidth - margin - barcodeW;
  const barcodeY = awbBoxY + awbBoxH + 3;

  if (barcodeImg) {
    doc.addImage(barcodeImg, 'PNG', barcodeX, barcodeY, barcodeW, barcodeH);
  }

  // New y below barcode / logo
  y = Math.max(barcodeY + barcodeH, y + logoH + 22) + 6;

  // ========== MAIN GRID ==========

  doc.setFontSize(8);
  doc.setLineWidth(0.3);

  // Helper to draw header row (titles)
  const drawHeaderRow = (x: number, yRow: number, widths: number[], labels: string[]): number => {
    const h = 6;
    let cx = x;
    doc.setFont('helvetica', 'bold');
    labels.forEach((label, i) => {
      const w = widths[i];
      doc.rect(cx, yRow, w, h);
      doc.text(label, cx + 2, yRow + 4);
      cx += w;
    });
    return yRow + h;
  };

  // Helper to draw value row
  const drawValueRow = (x: number, yRow: number, widths: number[], values: string[]): number => {
    const h = 7;
    let cx = x;
    doc.setFont('helvetica', 'normal');
    values.forEach((val, i) => {
      const w = widths[i];
      doc.rect(cx, yRow, w, h);
      const text = doc.splitTextToSize(val || '', w - 4)[0] || '';
      doc.text(text, cx + 2, yRow + 4.5);
      cx += w;
    });
    return yRow + h;
  };

  // ---- Row 1: ACCOUNT | CUSTOMER | ORIGIN | DESTINATION | SERVICE
  let widths = [25, 45, 30, 55, 35]; // sum = 190
  y = drawHeaderRow(margin, y, widths, [
    'ACCOUNT',
    'CUSTOMER',
    'ORIGIN',
    'DESTINATION',
    'SERVICE',
  ]);

  y = drawValueRow(margin, y, widths, [
    data.accountNo || '',
    data.customer || '',
    data.origin || '',
    data.destination || '',
    data.service || '', // This will contain vendor name
  ]);

  // ---- Row 2: SENDER'S COMPANY | RECIPIENT'S COMPANY | WEIGHT | DIMENSION IN CM
  // give DIMENSION column a bit more width and slightly smaller header font
  widths = [70, 70, 20, 30]; // still 190 total

  doc.setFontSize(7); // smaller so "DIMENSION IN CM" fits nicely
  y = drawHeaderRow(margin, y, widths, [
    "SENDER'S COMPANY",
    "RECIPIENT'S COMPANY",
    'WEIGHT',
    'DIMENSION IN CM',
  ]);
  doc.setFontSize(8); // reset for values / other rows

  y = drawValueRow(margin, y, widths, [
    data.shipper.companyName || '',
    data.consignee.companyName || '',
    data.weight || '',
    data.dimensions || '',
  ]);

  // ---- Row 3: SENDER'S NAME | RECIPIENT'S NAME
  widths = [95, 95];
  y = drawHeaderRow(margin, y, widths, [
    "SENDER'S NAME",
    "RECIPIENT'S NAME",
  ]);

  y = drawValueRow(margin, y, widths, [
    data.shipper.contactName || '',
    data.consignee.contactName || '',
  ]);

  // ---- Row 4: ADDRESS (Sender) | ADDRESS (Recipient)
  const addressRowHeight = 14;
  widths = [95, 95];
  let cx = margin;

  const senderAddrLines: string[] = [];
  if (data.shipper.address1) senderAddrLines.push(data.shipper.address1);
  if (data.shipper.address2) senderAddrLines.push(data.shipper.address2);
  senderAddrLines.push(
    [data.shipper.city, data.shipper.state].filter(Boolean).join(', ')
  );

  const consigneeAddrLines: string[] = [];
  if (data.consignee.address1) consigneeAddrLines.push(data.consignee.address1);
  if (data.consignee.address2) consigneeAddrLines.push(data.consignee.address2);
  consigneeAddrLines.push(
    [data.consignee.city, data.consignee.state].filter(Boolean).join(', ')
  );

  // header row
  doc.setFont('helvetica', 'bold');
  doc.rect(cx, y, widths[0], 6);
  doc.text('ADDRESS', cx + 2, y + 4);
  cx += widths[0];
  doc.rect(cx, y, widths[1], 6);
  doc.text('ADDRESS', cx + 2, y + 4);
  y += 6;

  // value row (multi-line inside same height)
  cx = margin;
  doc.setFont('helvetica', 'normal');
  doc.rect(cx, y, widths[0], addressRowHeight);
  let lineY = y + 4;
  const maxAddrW = widths[0] - 4;
  senderAddrLines.forEach((line) => {
    const parts = doc.splitTextToSize(line, maxAddrW);
    parts.forEach((p) => {
      doc.text(p, cx + 2, lineY);
      lineY += 3.5;
    });
  });

  cx += widths[0];
  doc.rect(cx, y, widths[1], addressRowHeight);
  lineY = y + 4;
  const maxAddrW2 = widths[1] - 4;
  consigneeAddrLines.forEach((line) => {
    const parts = doc.splitTextToSize(line, maxAddrW2);
    parts.forEach((p) => {
      doc.text(p, cx + 2, lineY);
      lineY += 3.5;
    });
  });

  y += addressRowHeight;

  // ---- Row 5: PIN / TEL / PIN / TEL / COUNTRY (Fixed order: shipper PIN, shipper TEL, consignee PIN, consignee TEL, COUNTRY)
  widths = [30, 40, 30, 40, 50]; // sum = 190
  y = drawHeaderRow(margin, y, widths, [
    'PIN CODE',
    'TEL NO.',
    'PIN CODE',
    'TEL NO.',
    'COUNTRY',
  ]);

  y = drawValueRow(margin, y, widths, [
    data.shipper.pincode || '',
    data.shipper.telephone || '',
    data.consignee.pincode || '',
    data.consignee.telephone || '',
    data.destination || '',
  ]);

  // ========== SECOND GRID: GOODS / PIECES / WEIGHT / VALUE / DATE ==========
  widths = [80, 20, 30, 30, 30]; // sum = 190
  y = drawHeaderRow(margin, y, widths, [
    'DESCRIPTION OF GOODS',
    'PIECES',
    'CHARGEABLE WT',
    'SHIPMENT VALUE',
    'BOOKING DATE',
  ]);

  y = drawValueRow(margin, y, widths, [
    data.description || '',
    data.pieces || '',
    data.chargeableWeight || '',
    data.shipmentValue || '',
    data.bookingDate || '',
  ]);

  // Add small gap after Description of Goods table (before SHIPPER AGREEMENT)
  y += 3;

  // ========== SHIPPER AGREEMENT BOX ==========
  y = checkPageBreak(doc, y, 35);
  
  const agreementBoxWidth = contentWidth;
  const boxPadding = 3;
  
  // Calculate content height first
  let contentHeight = boxPadding;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  contentHeight += 5; // SHIPPER AGREEMENT DATE
  
  contentHeight += 6; // Gap
  contentHeight += 5; // SHIPPER'S SIGNATURE
  
  contentHeight += 6; // Gap
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const agreementText = 'SHIPPER AGREES TO STANDARD TERM AND CONDITIONS OF CARRIAGE.';
  const agreementLines = doc.splitTextToSize(agreementText, agreementBoxWidth - (boxPadding * 2));
  contentHeight += (agreementLines.length * 4); // Agreement text (multiple lines if needed)
  
  contentHeight += boxPadding; // Bottom padding
  
  const agreementBoxHeight = contentHeight;
  
  // Draw the agreement box
  doc.setLineWidth(0.5);
  doc.rect(margin, y, agreementBoxWidth, agreementBoxHeight);
  
  // Content inside the box
  let boxY = y + boxPadding;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIPPER AGREEMENT DATE', margin + boxPadding, boxY + 5);
  
  boxY += 6;
  doc.text('SHIPPER\'S SIGNATURE', margin + boxPadding, boxY + 5);
  
  boxY += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  agreementLines.forEach((line, idx) => {
    doc.text(line, margin + boxPadding, boxY + 5 + (idx * 4));
  });
  
  // Add small gap after SHIPPER AGREEMENT (before Terms & Conditions)
  y += agreementBoxHeight + 3;

  // ========== TERMS & CONDITIONS BOX ==========
  y = checkPageBreak(doc, y, 40);
  
  const termsBoxHeight = 35;
  const termsBoxWidth = contentWidth;
  
  // Draw the terms box
  doc.setLineWidth(0.5);
  doc.rect(margin, y, termsBoxWidth, termsBoxHeight);
  
  // Terms & Conditions title
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions :', margin + boxPadding, y + 5);
  
  // Terms content
  let termsY = y + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const termsText = [
    '1. No Claims would be entertained for any damage during transit & delay in delivery due to any reason.',
    '2. Maximum claims for loss of parcel would be USD 50 upto 10 Kgs & USD 100 above 10 kgs or the declared value whichever is lower.',
    '3. This AWB is for the account holder and it is not transferable. This receipt does not imply we have physically received the parcel in our hub'
  ];
  
  const maxTermsWidth = termsBoxWidth - (boxPadding * 2);
  termsText.forEach((term, index) => {
    const termLines = doc.splitTextToSize(term, maxTermsWidth);
    termLines.forEach((line) => {
      doc.text(line, margin + boxPadding, termsY);
      termsY += 4;
    });
    if (index < termsText.length - 1) {
      termsY += 1; // Small gap between terms
    }
  });
  
  y += termsBoxHeight + 4;

  // ---------- FOOTER ----------
  // GST number has been moved to header section, so footer is now empty or can be used for other info
  // Footer section removed as GST is now in header

  // Return PDF as blob instead of saving directly
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};


