# Smart Campus Room Availability Checker

A frontend-only React application for filtering campus rooms and validating booking availability based on strict capacity, equipment, and time overlap rules. 

## Features
* **Room Catalog & Filtering (F1-F5):** Filter available rooms dynamically by minimum capacity and required equipment, with responsive empty states and blocked-room handling.
* **Availability Validation (AC1-AC6):** Checks requested time slots against a room's specific existing bookings.
* **Strict Rule Enforcement:** Evaluates touching versus overlapping intervals, enforces a maximum 120-minute duration limit, and restricts bookings to future times.
* **Modular Architecture:** Clean separation of React UI components, static fictional data, and pure TypeScript validation logic for independent testing.

## Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (comes installed with Node.js)

## Setup
Install the required project dependencies, including React, Vite, and Vitest testing libraries:
```bash
npm install
```

## Run
Start the local development server:
```bash
npm run dev
```
Open your browser and navigate to the local URL provided in the terminal (typically `http://localhost:5173`) to interact with the live prototype.

## Test
Execute the automated test suite to verify the core business logic, regression boundaries, and UI behaviors:
```bash
npm run test
```
