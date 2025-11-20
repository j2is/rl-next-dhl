# DHL Landed Cost Calculator

A Next.js application for calculating landed costs for international shipments using the DHL API. Built for Ratsey & Lapthorn to estimate shipping costs including duties, taxes, and surcharges.

## Features

- DHL API integration for landed cost calculations
- Pre-populated recipient addresses (USA, Switzerland, Australia)
- Custom address input option
- Product catalog with 70+ items
- Automatic package size assignment based on weight
- Detailed cost breakdown with accordion for raw data
- Black and white minimal design
- Toast notifications for user feedback
- Responsive design

## Tech Stack

- Next.js 15 with App Router
- Styled Components
- Turbopack
- Sonner (toast notifications)
- Material Design Icons
- No TypeScript (JavaScript only)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- DHL API credentials

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
DHL_API_KEY=your_dhl_api_key_here
DHL_API_SECRET=your_dhl_api_secret_here
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Select a recipient address from the dropdown or choose "Other address" to enter a custom one
2. Select products from the catalog using checkboxes
3. Adjust quantities as needed
4. Review the automatic package assignment
5. Click "Calculate Landed Cost" to get shipping rates
6. View the cost breakdown and expand the accordion to see raw data

## Package Sizes

The application automatically assigns packages based on product weight:

- Small: 0.0 - 0.5 kg
- Ditty: 0.9 - 1.1 kg
- Medium: 1.0 - 1.4 kg
- Large: 1.4 - 5.4 kg (default)

## Project Structure

```
app/
├── api/
│   └── dhl-rates/
│       └── route.js          # DHL API integration
├── components/
│   ├── AddressSelector/      # Address selection component
│   ├── ProductCatalog/        # Product selection component
│   └── ResultsDisplay/        # Results display component
├── data/
│   ├── addresses.js           # Sender and recipient addresses
│   ├── catalog.js             # Product catalog data
│   └── packages.js            # Package size configuration
├── lib/
│   ├── media.js               # Media query utilities
│   └── registry.js            # Styled components registry
├── utils/
│   └── packageAssignment.js   # Package assignment logic
├── layout.js                  # Root layout
├── page.js                    # Home page
├── not-found.js               # 404 page
└── globals.css                # Global styles
```

## Build

To create a production build:

```bash
npm run build
npm start
```

## License

Private - Ratsey & Lapthorn