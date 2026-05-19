# AAI IT Asset Management System

An enterprise-grade IT Asset Management System developed for the Airports Authority of India (AAI) internship project.

This project is designed to manage and track organizational IT assets including CPUs, laptops, monitors, printers, network devices, software licenses, and employee asset assignments through a centralized web-based platform.

---

# Project Overview

The system provides a modern dashboard-driven interface for managing:

- Employee information
- IT hardware assets
- Network details
- Software licenses
- Asset assignment history
- Warranty tracking
- Device withdrawal records

The platform follows a relational database architecture designed in Third Normal Form (3NF) to ensure scalability, consistency, and maintainability.

---

# Key Features

## Asset Management
- Add, edit, delete, and track assets
- Manage CPUs, laptops, printers, UPS, scanners, projectors, and more
- Asset lifecycle tracking

## User Management
- Employee profile management
- Department and location mapping
- Assigned asset tracking

## Smart Search
Search by:
- User Name
- Asset ID
- Serial Number
- IP Address

## Assignment Tracking
- Assign assets to employees
- Withdraw/return assets
- View assignment history

## Network Management
- IP address tracking
- MAC address management
- Hostname records

## Software Tracking
- Installed software records
- License key management
- Office/Adobe tracking

## Dashboard Analytics
- Asset statistics
- Warranty alerts
- Assignment reports
- Department-wise distribution

---

# Tech Stack

## Frontend
- React.js
- Tailwind CSS
- React Router
- Axios

## Backend
- Node.js
- Express.js

## Database
- MySQL (3NF normalized schema)

## Authentication
- JWT Authentication
- Role-Based Access Control

---

# Database Design

The database is fully normalized in 3NF and includes:

- USERS
- DEPARTMENTS
- LOCATIONS
- ASSET_TYPES
- ASSETS
- USER_ASSET_ASSIGNMENT
- CPU_DETAILS
- LAPTOP_DETAILS
- NETWORK_DETAILS
- PRINTER_DETAILS
- SOFTWARE
- ASSET_SOFTWARE
- CAMERA
- NETWORK_SWITCH
- WITHDRAWN_ASSETS

---

# Folder Structure

```bash
project-root/
│
├── client/                 # Frontend React App
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── server/                 # Backend Express Server
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── config/
│
├── database/
│   └── schema.sql
│
├── README.md
└── package.json
