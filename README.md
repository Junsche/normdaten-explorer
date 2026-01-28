# Normdaten Explorer 🌍

> A modern, responsive web interface for exploring authority data (Normdaten) across multiple sources including GND, GeoNames, Wikidata, and OpenStreetMap.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![React](https://img.shields.io/badge/React-18.0+-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF)

## 📖 About

**Normdaten Explorer** is a unified search frontend designed to simplify the discovery of entity metadata. It aggregates results from various authority control databases and presents them in a clean, unified interface.

The project features a **responsive full-width layout** with a sticky sidebar and integrated **OpenStreetMap** visualizations for geographic entities.

## ✨ Features

- **🔍 Multi-Source Search**: Unified querying across **GND** (German National Library), **Wikidata**, **OpenStreetMap (OSM)**, and **GeoNames**.
- **🏷️ Smart Filtering**: Filter entities by type (Person, Place, Organization, Thing) and source.
- **🗺️ Map Visualization**: Integrated OpenStreetMap previews via iframe (no heavy map dependencies required), with direct links to Google Maps and OSM.
- **📱 Responsive Layout**: A full-width, fluid design featuring a sticky results sidebar and an adaptive detail panel.
- **⚡ Deep Metadata Parsing**: Intelligently parses complex data strings (e.g., population, timezone, alternate names) into readable badges and structured lists.
- **🚀 Global Scroll**: Optimized scrolling experience allowing the header to tuck away while keeping navigation accessible.

## 🛠 Tech Stack

- **Core**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: CSS Modules / Inline Styles (Custom Responsive Design)
- **State Management**: React Hooks

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/normdaten-explorer.git](https://github.com/your-username/normdaten-explorer.git)
   cd normdaten-explorer
Install dependencies

Bash
npm install
# OR
yarn install
Start the development server

Bash
npm run dev
Open your browser and navigate to http://localhost:5173.

📂 Project Structure
Plaintext
src/
├── api/            # API client and fetch logic (client.ts)
├── components/     # Reusable UI components
│   ├── DetailPanel.tsx   # Displays metadata & maps
│   ├── ResultsList.tsx   # Sidebar list items
│   ├── SearchBar.tsx     # Input & filters
│   └── Header.tsx        # App branding
├── pages/          # Main page layouts (ExplorerPage.tsx)
├── types/          # TypeScript interfaces (NormData)
├── App.tsx         # Root component
└── main.tsx        # Entry point
⚙️ Configuration (Vite Template)
This project is initialized using the standard Vite + React + TypeScript template. Below is the default configuration info.

React + TypeScript + Vite
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

@vitejs/plugin-react uses Babel for Fast Refresh

@vitejs/plugin-react-swc uses SWC for Fast Refresh

ESLint Configuration
If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

JavaScript
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License.