# Speedy Visakha Ship - Frontend

Frontend application for VzCourier shipping and logistics management system.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🔗 API Configuration

The frontend is configured to use the deployed Render backend by default:

**Production Backend:** `https://vz-karr.onrender.com/api`

### For Local Development

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

This will override the default production URL when running locally.

## 📦 Features

- Invoice and AWB PDF generation with preview
- Logo upload with automatic resizing
- Password visibility toggle
- Shipment tracking with Delhivery API
- Delete functionality with confirmation
- Change password feature
- Modern responsive UI

## 🛠️ Technologies

- React + TypeScript
- Vite
- Tailwind CSS
- jsPDF for PDF generation
