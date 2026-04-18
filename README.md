# Krishika Pro

A mobile-first farm management and marketplace PWA designed to assist farmers in managing workforce payments, tracking financial performance, accessing market price data, and enabling peer-to-peer trading.

Built with **Angular 20**, **SSR**, and **PWA** capabilities for offline-first, low-end device support.

## Objectives

- Digitize daily farm operations
- Provide visibility into expenses, income, and profitability
- Enable better decision-making using data insights
- Improve access to real-time agricultural market prices
- Facilitate direct farmer-to-farmer transactions

## Features

### Phase 1 (MVP)

- **Worker Management** — Add/edit/delete worker profiles, record daily attendance, track wages (paid, pending, advance), generate payment summaries
- **Financial Management** — Record expenses (labor, seeds, fertilizer, equipment) and income (crop sales, livestock sales), categorize transactions, view totals
- **Analytics Dashboard** — Expense vs income charts, profit/loss summaries, worker cost analysis

### Phase 2

- **Market Price Tracking** — Daily crop prices, region-based filtering, historical price trends
- **Notifications & Alerts**

### Phase 3

- **Marketplace / Social Platform** — Create posts (sell livestock, crops, equipment), browse listings, contact sellers, location-based filtering

### Phase 4

- Advanced analytics and prediction
- Price insights with trend analysis, alerts, and basic forecasting

## Tech Stack

| Layer     | Technology           |
| --------- | -------------------- |
| Framework | Angular 20           |
| Rendering | SSR (`@angular/ssr`) |
| Styling   | SCSS                 |
| Language  | TypeScript           |
| Runtime   | Node.js + Express 5  |
| PWA       | Service Workers      |

## Getting Started

### Prerequisites

- Node.js (LTS)
- Angular CLI v20

### Install dependencies

```bash
npm install
```

### Development server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Build

```bash
ng build
```

Build artifacts are stored in `dist/`.

### Run SSR server

```bash
node dist/krishika-pro-pwa/server/server.mjs
```

### Run tests

```bash
ng test
```

## User Personas

| Persona            | Description                                |
| ------------------ | ------------------------------------------ |
| Small-Scale Farmer | Limited tech literacy, needs simple UI     |
| Mid-Scale Farmer   | Moderate smartphone usage, needs analytics |
| Trader/Buyer       | Interested in purchasing crops/livestock   |

## Non-Functional Requirements

- **Usability** — Simple, intuitive interface with multi-language support
- **Performance** — Fast load times (<3s), optimized for low-end devices
- **Availability** — Offline mode with data sync
- **Security** — Secure authentication, data privacy compliance
- **Scalability** — Support increasing users and data volume

## Project Structure

```
src/
├── app/           # Application root (components, routes, config)
├── main.ts        # Client bootstrap
├── main.server.ts # Server bootstrap
├── server.ts      # Express SSR server
├── styles.scss    # Global styles
└── index.html     # App shell
docs/
└── features/      # Feature requirement documents
```

## License

Private
