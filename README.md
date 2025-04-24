# 🏕️ Corsica Shelter Availability Checker

This project is a **TypeScript-based tool** designed to fetch and parse shelter availability data for Corsica's booking system. It processes booking information, identifies available shelters, and provides insights into their availability for specific dates.

## 🚀 Features

- **Fetch Booking Data**: Retrieves booking availability data for specified periods.
- **Parse HTML Tables**: Extracts and processes shelter availability from HTML tables.
- **Merge Data**: Combines availability data from multiple periods into a unified view.
- **Availability Insights**: Highlights shelters with availability for specific dates.
- **Error Handling**: Provides clear error messages for missing or invalid data.

## 🛠️ Technologies Used

- **TypeScript**: Ensures type safety and modern JavaScript features.
- **Node.js**: For executing asynchronous operations and HTTP requests.
- **HTML Parsing**: Extracts data from HTML using DOM-like methods.

## 📂 Project Structure

- **`index.ts`**: Main logic for fetching, parsing, and processing shelter availability.
- **Constants**: Predefined shelter names, periods, and missing dates.
- **Utility Functions**: Helpers for date formatting, HTML parsing, and data transformation.

## 🏗️ How It Works

1. **Fetch Data**: Sends POST requests to the booking system for specified periods.
2. **Parse HTML**: Extracts availability data from the returned HTML tables.
3. **Merge Results**: Combines data from multiple periods into a single dataset.
4. **Analyze Availability**: Identifies shelters with availability for specific dates.

## 📋 Prerequisites

- **Node.js** (v16+)
- **npm** (v7+)
