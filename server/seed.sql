USE AAI_asset;

-- Departments
INSERT IGNORE INTO departments (department_name) VALUES 
('IT Operations'), ('Air Traffic Control'), ('Engineering'), ('Finance'), ('HR'), ('Cargo'), ('Security'), ('Administration');

-- Locations
INSERT IGNORE INTO locations (location_name) VALUES 
('IGI Terminal 3, Delhi'), ('CSMIA, Mumbai'), ('Kempegowda, Bengaluru'), ('Chennai Intl'), ('Kolkata NSCBI'), ('AAI HQ, Rajiv Gandhi Bhawan');

-- Designations
INSERT IGNORE INTO designations (designation_name) VALUES 
('Manager IT'), ('Sr. Engineer'), ('Junior Officer'), ('Asst. Manager'), ('ATC Officer'), ('Technician'), ('GM'), ('Director');

-- Employee Types
INSERT IGNORE INTO employee_types (employee_type_name) VALUES 
('Permanent'), ('Contract'), ('Intern');

-- Asset Types
INSERT IGNORE INTO asset_types (asset_type_name) VALUES 
('Laptop'), ('Desktop CPU'), ('Monitor'), ('Printer'), ('Scanner'), ('UPS'), ('Webcam'), ('HDD'), ('Headset'), ('Router'), ('Switch');

-- Asset Status
INSERT IGNORE INTO asset_status (status_name) VALUES 
('Available'), ('Assigned'), ('Maintenance'), ('Expired');

-- Brands
INSERT IGNORE INTO brands (brand_name) VALUES 
('Dell'), ('HP'), ('Lenovo'), ('Canon'), ('Epson'), ('APC'), ('Microtek'), ('Logitech'), ('Microsoft'), ('Seagate'), ('Western Digital'), ('Toshiba'), ('Jabra'), ('Plantronics'), ('Cisco'), ('MikroTik'), ('TP-Link'), ('D-Link'), ('LG'), ('Brother');

-- Device Models
-- Dell
INSERT IGNORE INTO device_models (brand_id, model_name) VALUES ((SELECT brand_id FROM brands WHERE brand_name='Dell'), 'Latitude 5430');
INSERT IGNORE INTO device_models (brand_id, model_name) VALUES ((SELECT brand_id FROM brands WHERE brand_name='Dell'), 'OptiPlex 7090');
INSERT IGNORE INTO device_models (brand_id, model_name) VALUES ((SELECT brand_id FROM brands WHERE brand_name='Dell'), 'P2422H');
-- HP
INSERT IGNORE INTO device_models (brand_id, model_name) VALUES ((SELECT brand_id FROM brands WHERE brand_name='HP'), 'EliteBook 840');
INSERT IGNORE INTO device_models (brand_id, model_name) VALUES ((SELECT brand_id FROM brands WHERE brand_name='HP'), 'ProDesk 600');
INSERT IGNORE INTO device_models (brand_id, model_name) VALUES ((SELECT brand_id FROM brands WHERE brand_name='HP'), 'E24');
-- Lenovo
INSERT IGNORE INTO device_models (brand_id, model_name) VALUES ((SELECT brand_id FROM brands WHERE brand_name='Lenovo'), 'ThinkPad T14');
INSERT IGNORE INTO device_models (brand_id, model_name) VALUES ((SELECT brand_id FROM brands WHERE brand_name='Lenovo'), 'ThinkCentre M70');

-- Operating Systems
INSERT IGNORE INTO operating_systems (os_name, os_version) VALUES 
('Windows', '11 Pro'), ('Windows', '10 Pro'), ('Ubuntu', '22.04 LTS'), ('macOS', 'Sonoma');

-- Processors
INSERT IGNORE INTO processors (processor_name) VALUES 
('Intel Core i5-1235U'), ('Intel Core i7-12700'), ('Intel Core i5-13400'), ('AMD Ryzen 5 5600G'), ('AMD Ryzen 7 5700G');

-- RAM Types
INSERT IGNORE INTO ram_types (ram_type_name) VALUES 
('DDR4'), ('DDR5');

-- Storage Types
INSERT IGNORE INTO storage_types (storage_type_name) VALUES 
('SSD NVMe'), ('SSD SATA'), ('HDD');

-- Warranty Types
INSERT IGNORE INTO warranty_types (warranty_type_name) VALUES 
('Standard 1 Year'), ('Extended 3 Years'), ('On-site 3 Years');

-- Vendors
INSERT IGNORE INTO vendors (vendor_name) VALUES 
('TechCorp IT Supplies'), ('Global Solutions India'), ('Direct OEM'), ('Local Retailer');
