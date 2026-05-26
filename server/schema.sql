CREATE DATABASE IF NOT EXISTS AAI_asset;
USE AAI_asset;

-- =========================================================
-- MASTER TABLES
-- =========================================================

CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS designations (
    designation_id INT AUTO_INCREMENT PRIMARY KEY,
    designation_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS employee_types (
    employee_type_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_type_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS device_models (
    model_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
);

CREATE TABLE IF NOT EXISTS vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS warranty_types (
    warranty_type_id INT AUTO_INCREMENT PRIMARY KEY,
    warranty_type_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS asset_types (
    asset_type_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_type_name VARCHAR(50) NOT NULL UNIQUE,
    custom_schema JSON DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS asset_status (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS operating_systems (
    os_id INT AUTO_INCREMENT PRIMARY KEY,
    os_name VARCHAR(100) NOT NULL,
    os_version VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS processors (
    processor_id INT AUTO_INCREMENT PRIMARY KEY,
    processor_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ram_types (
    ram_type_id INT AUTO_INCREMENT PRIMARY KEY,
    ram_type_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS storage_types (
    storage_type_id INT AUTO_INCREMENT PRIMARY KEY,
    storage_type_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS software_master (
    software_id INT AUTO_INCREMENT PRIMARY KEY,
    software_name VARCHAR(100) NOT NULL,
    software_version VARCHAR(50)
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    emp_id VARCHAR(50) NOT NULL UNIQUE,
    employee_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    designation_id INT,
    department_id INT,
    employee_type_id INT,
    location_id INT,
    intercom VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Active',
    INDEX idx_employee_name (employee_name),
    INDEX idx_department_id (department_id),
    INDEX idx_status (status),
    FOREIGN KEY (designation_id) REFERENCES designations(designation_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (employee_type_id) REFERENCES employee_types(employee_type_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

-- =========================================================
-- ASSETS
-- =========================================================

CREATE TABLE IF NOT EXISTS assets (
    asset_id VARCHAR(50) PRIMARY KEY,
    asset_type_id INT NOT NULL,
    model_id INT,
    vendor_id INT,
    serial_number VARCHAR(100),
    purchase_date DATE,
    install_date DATE,
    supply_order_no VARCHAR(100),
    warranty_type_id INT,
    warranty_end_date DATE,
    status_id INT,
    location_id INT,
    remarks TEXT,
    custom_fields JSON DEFAULT NULL,
    INDEX idx_serial_number (serial_number),
    INDEX idx_status_id (status_id),
    INDEX idx_location_id (location_id),
    FOREIGN KEY (asset_type_id) REFERENCES asset_types(asset_type_id),
    FOREIGN KEY (model_id) REFERENCES device_models(model_id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
    FOREIGN KEY (warranty_type_id) REFERENCES warranty_types(warranty_type_id),
    FOREIGN KEY (status_id) REFERENCES asset_status(status_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

-- =========================================================
-- CPU DETAILS
-- =========================================================

CREATE TABLE IF NOT EXISTS cpu_details (
    asset_id VARCHAR(50) PRIMARY KEY,
    processor_id INT,
    ram_size VARCHAR(20),
    ram_type_id INT,
    storage_size VARCHAR(20),
    storage_type_id INT,
    os_id INT,
    processor_speed VARCHAR(50),
    chipset VARCHAR(100),
    ram_speed VARCHAR(50),
    ram_slots VARCHAR(50),
    storage_make_model VARCHAR(150),
    cd_drive VARCHAR(100),
    speaker VARCHAR(100),
    os_key VARCHAR(100),
    office_suite VARCHAR(100),
    office_suite_key VARCHAR(100),
    adobe_acrobat VARCHAR(100),
    adobe_acrobat_key VARCHAR(100),
    keyboard_id VARCHAR(50),
    keyboard_serial VARCHAR(100),
    keyboard_make VARCHAR(100),
    keyboard_model VARCHAR(100),
    mouse_id VARCHAR(50),
    mouse_serial VARCHAR(100),
    mouse_make VARCHAR(100),
    mouse_model VARCHAR(100),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    FOREIGN KEY (processor_id) REFERENCES processors(processor_id),
    FOREIGN KEY (ram_type_id) REFERENCES ram_types(ram_type_id),
    FOREIGN KEY (storage_type_id) REFERENCES storage_types(storage_type_id),
    FOREIGN KEY (os_id) REFERENCES operating_systems(os_id)
);

-- =========================================================
-- LAPTOP DETAILS
-- =========================================================

CREATE TABLE IF NOT EXISTS laptop_details (
    asset_id VARCHAR(50) PRIMARY KEY,
    processor_id INT,
    processor_speed VARCHAR(50),
    chipset VARCHAR(100),
    ram_size VARCHAR(20),
    ram_type_id INT,
    ram_speed VARCHAR(50),
    ram_slots VARCHAR(50),
    storage_size VARCHAR(20),
    storage_type_id INT,
    storage_make_model VARCHAR(150),
    cd_drive VARCHAR(100),
    dvd_drive VARCHAR(100),
    speaker VARCHAR(100),
    os_id INT,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    FOREIGN KEY (processor_id) REFERENCES processors(processor_id),
    FOREIGN KEY (ram_type_id) REFERENCES ram_types(ram_type_id),
    FOREIGN KEY (storage_type_id) REFERENCES storage_types(storage_type_id),
    FOREIGN KEY (os_id) REFERENCES operating_systems(os_id)
);

-- =========================================================
-- USER ASSET ASSIGNMENT
-- =========================================================

CREATE TABLE IF NOT EXISTS user_asset_assignment (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    asset_id VARCHAR(50) NOT NULL,
    assigned_date DATE NOT NULL,
    returned_date DATE,
    INDEX idx_user_id (user_id),
    INDEX idx_asset_id (asset_id),
    INDEX idx_returned_date (returned_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

-- =========================================================
-- ASSET ASSIGNMENT HISTORY
-- =========================================================

CREATE TABLE IF NOT EXISTS asset_assignment_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50),
    assigned_date DATE,
    returned_date DATE,
    assignment_status VARCHAR(50),
    assigned_by VARCHAR(50),
    returned_to_store BOOLEAN DEFAULT FALSE,
    remarks TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================================================
-- SOFTWARE INSTALLATION
-- =========================================================

CREATE TABLE IF NOT EXISTS asset_software_installation (
    installation_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL,
    software_id INT NOT NULL,
    install_date DATE,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE,
    FOREIGN KEY (software_id) REFERENCES software_master(software_id)
);

-- =========================================================
-- NETWORK DETAILS
-- =========================================================

CREATE TABLE IF NOT EXISTS network_details (
    asset_id VARCHAR(50) PRIMARY KEY,
    ip_address VARCHAR(45),
    hostname VARCHAR(100),
    vlan VARCHAR(50),
    mac_ethernet VARCHAR(50),
    mac_wifi VARCHAR(50),
    mac_bluetooth VARCHAR(50),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);

-- =========================================================
-- EQUIPMENT SPECS
-- =========================================================

CREATE TABLE IF NOT EXISTS equipment_specs (
    spec_id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id VARCHAR(50) NOT NULL,
    capacity VARCHAR(100),
    technology VARCHAR(100),
    data_field VARCHAR(100),
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE CASCADE
);

-- =========================================================
-- APP USERS (Authentication)
-- =========================================================

CREATE TABLE IF NOT EXISTS app_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS withdrawn_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    sl_no INT,
    user_name VARCHAR(100),
    department VARCHAR(100),
    model VARCHAR(150),
    items INT,
    cwn VARCHAR(100),
    cpu_id VARCHAR(50),
    monitor_id VARCHAR(50),
    keyboard_id VARCHAR(50),
    mouse_id VARCHAR(50),
    ups_id VARCHAR(50),
    printer_id VARCHAR(50),
    scanner_id VARCHAR(50),
    lap_id VARCHAR(50),
    lap_adap VARCHAR(50),
    lap_bag VARCHAR(50),
    lap_mse VARCHAR(50),
    wo VARCHAR(50),
    headset VARCHAR(50),
    webcam VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);