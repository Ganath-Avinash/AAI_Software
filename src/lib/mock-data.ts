export type Status = "Assigned" | "Available" | "Expired" | "Active" | "Maintenance";

export interface User {
  id: string;
  empId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  intercom: string;
  employeeType: "Permanent" | "Contract" | "Intern";
  status: "Active" | "Inactive";
  assetIds: string[];
}

export interface NetworkInfo {
  hostname: string;
  ip: string;
  macEthernet: string;
  macWifi: string;
  macBluetooth: string;
  vlan: string;
  online: boolean;
}

export interface SoftwareItem {
  name: string;
  version: string;
  licenseKey: string;
  expiresOn: string;
}

export interface HistoryEvent {
  date: string;
  action: string;
  by: string;
}

export interface Asset {
  id: string;
  type: "Laptop" | "Desktop CPU" | "Monitor" | "Printer" | "Scanner" | "UPS" | "Webcam" | "HDD" | "Headset" | "Router" | "Switch";
  make: string;
  model: string;
  serial: string;
  purchaseDate: string;
  warrantyUntil: string;
  status: Status;
  location: string;
  assignedTo: string | null; // user id
  specs: Record<string, string>;
  network?: NetworkInfo;
  software?: SoftwareItem[];
  history: HistoryEvent[];
}

const departments = ["IT Operations", "Air Traffic Control", "Engineering", "Finance", "HR", "Cargo", "Security", "Administration"];
const locations = ["IGI Terminal 3, Delhi", "CSMIA, Mumbai", "Kempegowda, Bengaluru", "Chennai Intl", "Kolkata NSCBI", "AAI HQ, Rajiv Gandhi Bhawan"];
const designations = ["Manager IT", "Sr. Engineer", "Junior Officer", "Asst. Manager", "ATC Officer", "Technician", "GM", "Director"];

function pad(n: number, len = 4) { return String(n).padStart(len, "0"); }

export const users: User[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `U${pad(i + 1)}`,
  empId: `AAI-${pad(10234 + i)}`,
  name: [
    "Aarav Sharma","Priya Iyer","Rohan Mehta","Sneha Kapoor","Vikram Reddy",
    "Aditi Nair","Kabir Singh","Meera Joshi","Arjun Pillai","Ananya Das",
    "Rahul Verma","Ishita Rao","Karthik Menon","Neha Bhat","Sanjay Kulkarni",
    "Divya Patel","Manish Gupta","Pooja Shah","Suresh Rao","Tara Bose",
    "Nikhil Saxena","Riya Chawla","Akash Naidu","Lakshmi Pillai"
  ][i],
  email: `user${i + 1}@aai.aero`,
  department: departments[i % departments.length],
  designation: designations[i % designations.length],
  location: locations[i % locations.length],
  intercom: `2${pad(100 + i, 3)}`,
  employeeType: (["Permanent","Contract","Intern"] as const)[i % 3],
  status: i % 11 === 0 ? "Inactive" : "Active",
  assetIds: [],
}));

const assetTypes: Asset["type"][] = ["Laptop","Desktop CPU","Monitor","Printer","Scanner","UPS","Webcam","HDD","Headset","Router","Switch"];
const makes: Record<Asset["type"], string[]> = {
  "Laptop": ["Dell Latitude 5430","HP EliteBook 840","Lenovo ThinkPad T14"],
  "Desktop CPU": ["HP ProDesk 600","Dell OptiPlex 7090","Lenovo ThinkCentre M70"],
  "Monitor": ["Dell P2422H","HP E24","LG 24MP400"],
  "Printer": ["HP LaserJet Pro M404","Canon imageCLASS","Brother HL-L2350"],
  "Scanner": ["Canon DR-C225","Epson DS-530","HP ScanJet Pro"],
  "UPS": ["APC 1KVA","Microtek 2KVA","Numeric 600VA"],
  "Webcam": ["Logitech C920","HP w300","Microsoft LifeCam"],
  "HDD": ["Seagate 1TB","WD Elements 2TB","Toshiba Canvio 1TB"],
  "Headset": ["Jabra Evolve 30","Plantronics C3220","Logitech H390"],
  "Router": ["Cisco ISR 1100","MikroTik hAP","TP-Link ER605"],
  "Switch": ["Cisco Catalyst 2960","HP Aruba 1930","D-Link DGS-1210"],
};

function rand<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

export const assets: Asset[] = Array.from({ length: 60 }).map((_, i) => {
  const type = assetTypes[i % assetTypes.length];
  const make = rand(makes[type], i * 3 + 1);
  const status: Status = i % 7 === 0 ? "Available" : i % 13 === 0 ? "Maintenance" : "Assigned";
  const assignedTo = status === "Assigned" ? users[i % users.length].id : null;
  const purchaseYear = 2019 + (i % 6);
  const warrantyYear = purchaseYear + 3;
  const isNetworked = ["Laptop","Desktop CPU","Router","Switch","Printer"].includes(type);
  return {
    id: `AAI-AST-${pad(1000 + i)}`,
    type,
    make: make.split(" ")[0],
    model: make,
    serial: `SN${pad(987654 + i * 17, 8)}`,
    purchaseDate: `${purchaseYear}-0${(i % 9) + 1}-15`,
    warrantyUntil: `${warrantyYear}-0${(i % 9) + 1}-14`,
    status,
    location: locations[i % locations.length],
    assignedTo,
    specs: (type === "Laptop" || type === "Desktop CPU" ? {
      CPU: "Intel Core i5-1235U", RAM: "16 GB DDR4", Storage: "512 GB SSD", OS: "Windows 11 Pro", GPU: "Intel Iris Xe"
    } : type === "Monitor" ? { Size: "24 inch", Resolution: "1920x1080", Panel: "IPS", Ports: "HDMI, VGA" }
      : { Notes: "Standard issue peripheral" }) as Record<string, string>,
    network: isNetworked ? {
      hostname: `AAI-${type.replace(/ /g,"")}-${pad(i,3)}`,
      ip: `10.${10 + (i % 20)}.${i % 255}.${(i * 7) % 255}`,
      macEthernet: `00:1A:2B:${pad(i, 2).slice(-2)}:${pad((i*3)%99,2)}:${pad((i*5)%99,2)}`,
      macWifi: `00:1A:2C:${pad(i, 2).slice(-2)}:${pad((i*7)%99,2)}:${pad((i*11)%99,2)}`,
      macBluetooth: `00:1A:2D:${pad(i, 2).slice(-2)}:${pad((i*13)%99,2)}:${pad((i*17)%99,2)}`,
      vlan: `VLAN-${100 + (i % 10)}`,
      online: i % 4 !== 0,
    } : undefined,
    software: type === "Laptop" || type === "Desktop CPU" ? [
      { name: "Microsoft Office 365", version: "2024", licenseKey: `MS-${pad(i*7, 6)}-OFC`, expiresOn: "2026-12-31" },
      { name: "Adobe Acrobat Pro", version: "DC 2024", licenseKey: `ADB-${pad(i*11, 6)}-PRO`, expiresOn: "2026-06-30" },
      { name: "Kaspersky Endpoint", version: "11.9", licenseKey: `KAS-${pad(i*13, 6)}-EP`, expiresOn: "2025-09-15" },
    ] : undefined,
    history: [
      { date: `${purchaseYear}-0${(i % 9) + 1}-15`, action: "Asset procured and added to inventory", by: "Admin" },
      { date: `${purchaseYear + 1}-02-10`, action: assignedTo ? `Assigned to ${users[i % users.length].name}` : "Marked as available", by: "IT Ops" },
      { date: "2025-03-22", action: "Annual maintenance check completed", by: "Technician" },
    ],
  };
});

// Link assets to users
for (const a of assets) {
  if (a.assignedTo) {
    const u = users.find(x => x.id === a.assignedTo);
    if (u) u.assetIds.push(a.id);
  }
}

export const recentActivity = [
  { id: 1, type: "assign", text: "Laptop AAI-AST-1023 assigned to Priya Iyer", time: "2 hours ago" },
  { id: 2, type: "withdraw", text: "Monitor AAI-AST-1011 withdrawn from Rohan Mehta", time: "4 hours ago" },
  { id: 3, type: "create", text: "New user Ananya Das onboarded", time: "Yesterday" },
  { id: 4, type: "assign", text: "Headset AAI-AST-1048 assigned to Kabir Singh", time: "Yesterday" },
  { id: 5, type: "warranty", text: "Warranty expiring for 6 assets next month", time: "2 days ago" },
];

export function getUser(id: string) { return users.find(u => u.id === id); }
export function getAsset(id: string) { return assets.find(a => a.id === id); }
export function getUserAssets(userId: string) { return assets.filter(a => a.assignedTo === userId); }

export const stats = {
  total: assets.length,
  assigned: assets.filter(a => a.status === "Assigned").length,
  available: assets.filter(a => a.status === "Available").length,
  maintenance: assets.filter(a => a.status === "Maintenance").length,
  warrantyExpiring: assets.filter(a => new Date(a.warrantyUntil) < new Date("2026-09-01")).length,
  networkDevices: assets.filter(a => a.network).length,
  users: users.length,
  activeUsers: users.filter(u => u.status === "Active").length,
};
