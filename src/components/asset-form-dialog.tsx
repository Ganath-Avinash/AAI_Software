import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, fetchLocations, fetchVendors, fetchAssetTypes, createAssetType, deleteAssetType } from "@/lib/api";
import type { Asset } from "@/lib/mock-data";
import { Check, ArrowRight, ArrowLeft, Plus, X, Trash2 } from "lucide-react";

const typePrefixes: Record<string, string> = {
  "Laptop": "AAI-SR IT-LP-",
  "Desktop CPU": "AAI-SR IT-DK-",
  "Monitor": "AAI-SR IT-MO-",
  "Printer": "AAI-SR IT-PR-",
  "Scanner": "AAI-SR IT-SC-",
  "UPS": "AAI-SR IT-UP-",
  "Webcam": "AAI-SR IT-WC-",
  "HDD": "AAI-SR IT-HD-",
  "Headset": "AAI-SR IT-HS-",
  "Router": "AAI-SR IT-RT-",
  "Switch": "AAI-SR IT-SW-",
  "Keyboard": "AAI-SR IT-KB-",
  "Mouse": "AAI-SR IT-MS-",
  "Server": "AAI-SR IT-SR-",
  "Workstation": "AAI-SR IT-WS-",
  "Projector": "AAI-SR IT-PJ-",
  "TV": "AAI-SR IT-TV-",
  "Tab": "AAI-SR IT-TB-",
  "Plotter": "AAI-SR IT-PL-",
  "Camera": "AAI-SR IT-CM-",
  "AllINONE": "AAI-SR IT-AO-",
  "IT ACCESS.": "AAI-SR IT-AC-",
};

type FormData = {
  id?: string;
  idNumber?: string;
  type: Asset["type"];
  make: string;
  model: string;
  serial: string;
  purchaseDate: string;
  installDate?: string;
  supplyOrderNo?: string;
  warrantyType?: string;
  warrantyUntil: string;
  remarks?: string;
  status: Asset["status"];
  location: string;
  assignedTo: string;
  vendor?: string;
  specs?: any;
  network?: any;
  customFields?: Record<string, string>;
};

const empty: FormData = {
  idNumber: "",
  type: "Laptop",
  make: "",
  model: "",
  serial: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  installDate: "",
  supplyOrderNo: "",
  warrantyType: "",
  warrantyUntil: new Date(Date.now() + 3 * 365 * 86400_000).toISOString().slice(0, 10),
  remarks: "",
  status: "Available",
  location: "ADMIN-TF",
  assignedTo: "",
  vendor: "",
  specs: {},
  network: {},
  customFields: {},
};

const types: Asset["type"][] = ["Laptop","Desktop CPU","Monitor","Printer","Scanner","UPS","Webcam","HDD","Headset","Router","Switch","Keyboard","Mouse","Server","Workstation","Projector","TV","Tab","Plotter","Camera","AllINONE","IT ACCESS."];

export function AssetFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Asset | null;
  onSubmit: (data: FormData) => void;
  title: string;
  isSubmitting?: boolean;
}) {
  const [form, setForm] = useState<FormData>(empty);
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();
  
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });
  const { data: vendors = [] } = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });
  const { data: serverTypes = [] } = useQuery({ queryKey: ['asset-types'], queryFn: fetchAssetTypes });

  useEffect(() => {
    if (open) {
      setStep(initial ? 2 : 1);
      if (initial) {
        let idNum = "";
        let prefix = typePrefixes[initial.type] || "AAI-SR IT-";
        if (initial.id && initial.id.startsWith(prefix)) {
            idNum = initial.id.substring(prefix.length);
        }
        
        setForm({
          id: initial.id,
          idNumber: idNum,
          type: initial.type,
          make: initial.make,
          model: initial.model,
          serial: initial.serial,
          purchaseDate: initial.purchaseDate,
          installDate: initial.installDate || "",
          supplyOrderNo: initial.supplyOrderNo || "",
          warrantyType: initial.warrantyType || "",
          warrantyUntil: initial.warrantyUntil,
          remarks: initial.remarks || "",
          status: initial.status,
          location: initial.location,
          assignedTo: initial.assignedTo ?? "",
          vendor: (initial as any).vendor || "",
          specs: initial.specs || {},
          network: initial.network || {},
          customFields: (initial as any).customFields || {},
        });
      } else {
        setForm(empty);
      }
    }
  }, [open, initial]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }));
  
  const selectedCustomType = serverTypes.find((t: any) => t.name === form.type && t.schema);
  const isCustom = !!selectedCustomType;

  const showSpecs = !isCustom && (form.type === "Laptop" || form.type === "Desktop CPU" || form.type === "AllINONE" || form.type === "Workstation" || form.type === "UPS" || form.type === "Switch" || form.type === "Monitor" || form.type === "HDD" || form.type === "Mouse" || form.type === "Printer" || form.type === "Scanner");
  const hasExtended = !isCustom && (form.type === "Laptop" || form.type === "Desktop CPU" || form.type === "AllINONE");
  
  const showStatus = !["TV", "Server", "Tab", "Keyboard", "Mouse", "Camera", "Printer", "Scanner", "IT ACCESS.", "HDD"].includes(form.type);
  const showPurchaseDate = !["TV", "Server", "Tab", "Keyboard", "Mouse", "Camera", "Printer", "Scanner", "IT ACCESS.", "HDD"].includes(form.type);
  const showLocation = !["Tab", "Keyboard", "Mouse", "Printer", "Scanner", "IT ACCESS.", "HDD"].includes(form.type);
  const showAssignedTo = !["Keyboard", "Mouse", "Camera", "Printer", "Scanner", "IT ACCESS.", "HDD"].includes(form.type);
  const showPurchaseStep = !isCustom && (form.type !== "Tab" && form.type !== "IT ACCESS.");
  const showPurchaseDetails = !isCustom && (!["Camera"].includes(form.type));
  const showNetwork = !isCustom && (!["Keyboard", "Mouse", "HDD", "Headset", "Webcam", "Printer", "Scanner", "IT ACCESS."].includes(form.type));
  
  let currentStep = 2;
  const stepsList = [
    { n: 1, label: "Category" },
    { n: 2, label: "Basic Info" },
  ];
  
  const purchaseN = showPurchaseStep ? ++currentStep : -1;
  if (showPurchaseStep) stepsList.push({ n: purchaseN, label: "Purchase & Warranty" });
  
  const basicSpecsN = showSpecs ? ++currentStep : -1;
  if (showSpecs) stepsList.push({ n: basicSpecsN, label: hasExtended ? "Basic Specs" : "Specs" });
  
  const extendedSpecsN = hasExtended ? ++currentStep : -1;
  if (hasExtended) stepsList.push({ n: extendedSpecsN, label: "Ext. HW" });
  
  const softwarePeriphN = !isCustom && (form.type === "Desktop CPU" || form.type === "AllINONE") ? ++currentStep : -1;
  if (softwarePeriphN !== -1) stepsList.push({ n: softwarePeriphN, label: "Software & Periph" });
  
  const customSpecsN = isCustom ? ++currentStep : -1;
  if (isCustom) stepsList.push({ n: customSpecsN, label: "Custom Details" });
  
  const networkN = showNetwork ? ++currentStep : -1;
  if (showNetwork) stepsList.push({ n: networkN, label: "Network" });
  
  const maxStep = stepsList.length;

  const handleNext = () => {
    if (step === 1 && !form.type) return;
    if (step === 2 && (!form.model?.trim() || !form.serial?.trim())) return;
    if (step < maxStep) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.model?.trim() || !form.serial?.trim() || (!initial && !form.idNumber?.trim())) return;
    
    if (step < maxStep) {
      setStep(step + 1);
    } else {
      const finalId = initial ? form.id : `${typePrefixes[form.type] || "AAI-SR IT-"}${form.idNumber}`;
      onSubmit({ ...form, id: finalId });
    }
  };

  const showFullNetwork = !["Camera"].includes(form.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-4">
          {stepsList.map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className={`size-6 rounded-full grid place-items-center text-[10px] font-semibold border-2 ${step >= s.n ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                {step > s.n ? <Check className="size-3" /> : s.n}
              </div>
              <div className={`text-xs font-medium ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
              {i < arr.length - 1 && <div className={`flex-1 h-px ${step > s.n ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="text-sm">
          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-[300px] content-start">
              <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Select Asset Category</div>
              {types.map(t => (
                <button
                  key={t}
                  type="button"
                  disabled={!!initial}
                  onClick={() => set("type", t as Asset["type"])}
                  className={`p-4 border rounded-lg text-left flex flex-col gap-2 transition-all ${form.type === t ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/50'} ${initial ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium text-sm text-foreground">{t}</div>
                </button>
              ))}
              {serverTypes.filter((t: any) => t.schema && !types.includes(t.name)).map((t: any) => (
                <div key={t.id} className="relative group">
                  <button
                    type="button"
                    disabled={!!initial}
                    onClick={() => set("type", t.name as Asset["type"])}
                    className={`w-full h-full p-4 border rounded-lg text-left flex flex-col gap-2 transition-all ${form.type === t.name ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/50'} ${initial ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="font-medium text-sm text-foreground flex items-center gap-2">{t.name} <span className="text-[10px] bg-primary/10 text-primary px-1 rounded uppercase">Custom</span></div>
                  </button>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-3 min-h-[300px]">
              <Field label={form.type === "Camera" ? "Material / Asset ID" : "Asset ID"} className="col-span-2 sm:col-span-1">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm whitespace-nowrap">
                    {typePrefixes[form.type] || "AAI-SR IT-"}
                  </span>
                  <input 
                    required={!initial}
                    readOnly={!!initial}
                    value={form.idNumber || ""} 
                    onChange={e => set("idNumber", e.target.value)} 
                    className={`w-full h-9 px-3 rounded-r-md border bg-background text-sm outline-none focus:border-ring ${initial ? 'opacity-50' : ''}`}
                    placeholder="e.g. 1001"
                  />
                </div>
              </Field>
              {showStatus && (
                <Field label="Status">
                  <select value={form.status} onChange={e => set("status", e.target.value as Asset["status"])} className={inputCls}>
                    <option>Available</option><option>Assigned</option><option>Maintenance</option><option>Expired</option>
                  </select>
                </Field>
              )}
              <Field label="Make"><input value={form.make} onChange={e => set("make", e.target.value)} className={inputCls} /></Field>
              <Field label="Model"><input required value={form.model} onChange={e => set("model", e.target.value)} className={inputCls} /></Field>
              <Field label="Serial Number" className="col-span-2"><input required value={form.serial} onChange={e => set("serial", e.target.value)} className={inputCls} /></Field>
              {showLocation && (
                <Field label="Location" className={showStatus ? "col-span-2" : "col-span-1"}>
                  <select value={form.location} onChange={e => set("location", e.target.value)} className={inputCls}>
                    <option value="">— Select Location —</option>
                    {locations.map((l: string) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
              )}
              {showAssignedTo && (
                <Field label="Assigned To" className={(!showLocation || !showStatus) ? "col-span-1" : "col-span-2"}>
                  <select value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} className={inputCls}>
                    <option value="">— Unassigned —</option>
                    {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.empId})</option>)}
                  </select>
                </Field>
              )}
            </div>
          )}

          {step === purchaseN && showPurchaseStep && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[300px] content-start p-2">
              <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Purchase & Warranty</div>
              {showPurchaseDetails && (
                <>
                  <Field label="Supplier/Vendor" className="col-span-2">
                    <input 
                      list="vendors-list" 
                      value={form.vendor || ''} 
                      onChange={e => set("vendor", e.target.value)} 
                      className={inputCls} 
                      placeholder="Type or select a vendor" 
                    />
                    <datalist id="vendors-list">
                      {vendors.map((v: any) => <option key={v.id} value={v.name} />)}
                    </datalist>
                  </Field>
                  <Field label="Supply Order No."><input value={form.supplyOrderNo || ''} onChange={e => set("supplyOrderNo", e.target.value)} className={inputCls} placeholder="e.g. PO-1024" /></Field>
                  
                  {showPurchaseDate && <Field label="Purchase Date"><input type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} className={inputCls} /></Field>}
                  <Field label="Install Date"><input type="date" value={form.installDate || ''} onChange={e => set("installDate", e.target.value)} className={inputCls} /></Field>
                  <div className="col-span-1 hidden sm:block"></div>

                  <Field label="Warranty / AMC Type"><input value={form.warrantyType || ''} onChange={e => set("warrantyType", e.target.value)} className={inputCls} placeholder="e.g. 3 Year Comprehensive" /></Field>
                  <Field label="Warranty Until"><input type="date" value={form.warrantyUntil} onChange={e => set("warrantyUntil", e.target.value)} className={inputCls} /></Field>
                </>
              )}
              
              <Field label="Remarks" className="col-span-full">
                <textarea 
                  value={form.remarks || ''} 
                  onChange={e => set("remarks", e.target.value)} 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]" 
                  placeholder="Additional notes about purchase, warranty, or condition..."
                />
              </Field>
            </div>
          )}

          {step === basicSpecsN && showSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[300px] content-start p-2">
              <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hardware Specifications</div>
              {!(form.type === "UPS" || form.type === "Switch" || form.type === "Monitor" || form.type === "HDD" || form.type === "Mouse" || form.type === "Printer" || form.type === "Scanner") && (
                <>
                  <Field label="Processor"><input value={form.specs?.Processor || ''} onChange={e => set("specs", { ...form.specs, Processor: e.target.value })} className={inputCls} placeholder="e.g. Intel Core i7" /></Field>
                  <Field label="Operating System"><input value={form.specs?.OS || ''} onChange={e => set("specs", { ...form.specs, OS: e.target.value })} className={inputCls} placeholder="e.g. Windows 11 Pro" /></Field>
                  <Field label="RAM"><input value={form.specs?.RAM || ''} onChange={e => set("specs", { ...form.specs, RAM: e.target.value })} className={inputCls} placeholder="e.g. 16GB" /></Field>
                  <Field label="Storage"><input value={form.specs?.Storage || ''} onChange={e => set("specs", { ...form.specs, Storage: e.target.value })} className={inputCls} placeholder="e.g. 512GB SSD NVMe" /></Field>
                </>
              )}
              
              {(form.type === "UPS" || form.type === "Switch" || form.type === "Monitor" || form.type === "HDD" || form.type === "Mouse" || form.type === "Printer" || form.type === "Scanner") && (
                <>
                  {(form.type === "UPS" || form.type === "Switch") && <Field label="Capacity"><input value={form.specs?.Capacity || ''} onChange={e => set("specs", { ...form.specs, Capacity: e.target.value })} className={inputCls} placeholder={form.type === "UPS" ? "e.g. 2KVA" : "e.g. 24-Port"} /></Field>}
                  {form.type === "HDD" && <Field label="Size"><input value={form.specs?.Capacity || ''} onChange={e => set("specs", { ...form.specs, Capacity: e.target.value })} className={inputCls} placeholder="e.g. 1TB" /></Field>}
                  {form.type !== "HDD" && <Field label="Technology"><input value={form.specs?.Technology || ''} onChange={e => set("specs", { ...form.specs, Technology: e.target.value })} className={inputCls} placeholder={form.type === "UPS" ? "e.g. Line-Interactive" : form.type === "Monitor" ? "e.g. IPS LED" : form.type === "Mouse" ? "e.g. Optical / Wireless" : form.type === "Printer" ? "e.g. Laser / Inkjet" : form.type === "Scanner" ? "e.g. Flatbed / ADF" : "e.g. Managed Layer 3"} /></Field>}
                  {form.type === "Monitor" && <Field label="Data"><input value={form.specs?.Data || ''} onChange={e => set("specs", { ...form.specs, Data: e.target.value })} className={inputCls} placeholder="e.g. 24 inch 1080p" /></Field>}
                  {form.type === "Printer" && <Field label="Toner / Cartridge"><input value={form.specs?.Toner || ''} onChange={e => set("specs", { ...form.specs, Toner: e.target.value })} className={inputCls} placeholder="e.g. TN-2365" /></Field>}
                </>
              )}
            </div>
          )}

          {step === extendedSpecsN && hasExtended && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[300px] content-start p-2">
              {(form.type === "Laptop" || form.type === "Desktop CPU" || form.type === "AllINONE") && (
                <>
                  <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">Extended Hardware Specs</div>
                  <Field label="Processor Speed"><input value={form.specs?.ProcessorSpeed || ''} onChange={e => set("specs", { ...form.specs, ProcessorSpeed: e.target.value })} className={inputCls} placeholder="e.g. 2.4 GHz" /></Field>
                  <Field label="Chipset"><input value={form.specs?.Chipset || ''} onChange={e => set("specs", { ...form.specs, Chipset: e.target.value })} className={inputCls} placeholder="e.g. Intel SoC" /></Field>
                  <Field label="RAM Speed"><input value={form.specs?.RAMSpeed || ''} onChange={e => set("specs", { ...form.specs, RAMSpeed: e.target.value })} className={inputCls} placeholder="e.g. 3200 MHz" /></Field>
                  <Field label="RAM Slots"><input value={form.specs?.RAMSlots || ''} onChange={e => set("specs", { ...form.specs, RAMSlots: e.target.value })} className={inputCls} placeholder="e.g. 2 total, 1 free" /></Field>
                  <Field label="Storage Make/Model"><input value={form.specs?.StorageMakeModel || ''} onChange={e => set("specs", { ...form.specs, StorageMakeModel: e.target.value })} className={inputCls} placeholder="e.g. Samsung 980 Pro" /></Field>
                  <Field label="CD Drive"><input value={form.specs?.CDDrive || ''} onChange={e => set("specs", { ...form.specs, CDDrive: e.target.value })} className={inputCls} placeholder="e.g. None" /></Field>
                  {form.type === "Laptop" && <Field label="DVD Drive"><input value={form.specs?.DVDDrive || ''} onChange={e => set("specs", { ...form.specs, DVDDrive: e.target.value })} className={inputCls} placeholder="e.g. Yes" /></Field>}
                  <Field label="Speaker"><input value={form.specs?.Speaker || ''} onChange={e => set("specs", { ...form.specs, Speaker: e.target.value })} className={inputCls} placeholder="e.g. Built-in Stereo" /></Field>
                </>
              )}
            </div>
          )}

          {step === softwarePeriphN && (form.type === "Desktop CPU" || form.type === "AllINONE") && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 min-h-[300px] content-start p-2">
              <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide">Software Licenses</div>
              <Field label="OS Key" className="col-span-1 sm:col-span-2"><input value={form.specs?.OSKey || ''} onChange={e => set("specs", { ...form.specs, OSKey: e.target.value })} className={inputCls} placeholder="e.g. XXXX-XXXX" /></Field>
              <Field label="Office Suite" className="col-span-1 sm:col-span-2"><input value={form.specs?.OfficeSuite || ''} onChange={e => set("specs", { ...form.specs, OfficeSuite: e.target.value })} className={inputCls} placeholder="e.g. Office 2021" /></Field>
              <Field label="Office Suite Key" className="col-span-1 sm:col-span-2"><input value={form.specs?.OfficeSuiteKey || ''} onChange={e => set("specs", { ...form.specs, OfficeSuiteKey: e.target.value })} className={inputCls} placeholder="e.g. XXXX-XXXX" /></Field>
              <Field label="Adobe Acrobat" className="col-span-1 sm:col-span-2"><input value={form.specs?.AdobeAcrobat || ''} onChange={e => set("specs", { ...form.specs, AdobeAcrobat: e.target.value })} className={inputCls} placeholder="e.g. Acrobat Pro 2020" /></Field>
              <Field label="Acrobat Key" className="col-span-1 sm:col-span-4"><input value={form.specs?.AdobeAcrobatKey || ''} onChange={e => set("specs", { ...form.specs, AdobeAcrobatKey: e.target.value })} className={inputCls} placeholder="e.g. XXXX-XXXX" /></Field>

              <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4 border-t pt-4">Keyboard Details</div>
              <Field label="Keyboard ID">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm whitespace-nowrap">
                    AAI-SR IT-KB-
                  </span>
                  <input 
                    value={form.specs?.KeyboardID?.replace('AAI-SR IT-KB-', '') || ''} 
                    onChange={e => set("specs", { ...form.specs, KeyboardID: e.target.value ? 'AAI-SR IT-KB-' + e.target.value : '' })} 
                    className="w-full h-9 px-3 rounded-r-md border bg-background text-sm outline-none focus:border-ring" 
                    placeholder="1001" 
                  />
                </div>
              </Field>
              <Field label="Serial Number"><input value={form.specs?.KeyboardSerial || ''} onChange={e => set("specs", { ...form.specs, KeyboardSerial: e.target.value })} className={inputCls} /></Field>
              <Field label="Make"><input value={form.specs?.KeyboardMake || ''} onChange={e => set("specs", { ...form.specs, KeyboardMake: e.target.value })} className={inputCls} placeholder="e.g. Logitech" /></Field>
              <Field label="Model"><input value={form.specs?.KeyboardModel || ''} onChange={e => set("specs", { ...form.specs, KeyboardModel: e.target.value })} className={inputCls} placeholder="e.g. K120" /></Field>

              <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">Mouse Details</div>
              <Field label="Mouse ID">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm whitespace-nowrap">
                    AAI-SR IT-MS-
                  </span>
                  <input 
                    value={form.specs?.MouseID?.replace('AAI-SR IT-MS-', '') || ''} 
                    onChange={e => set("specs", { ...form.specs, MouseID: e.target.value ? 'AAI-SR IT-MS-' + e.target.value : '' })} 
                    className="w-full h-9 px-3 rounded-r-md border bg-background text-sm outline-none focus:border-ring" 
                    placeholder="1001" 
                  />
                </div>
              </Field>
              <Field label="Serial Number"><input value={form.specs?.MouseSerial || ''} onChange={e => set("specs", { ...form.specs, MouseSerial: e.target.value })} className={inputCls} /></Field>
              <Field label="Make"><input value={form.specs?.MouseMake || ''} onChange={e => set("specs", { ...form.specs, MouseMake: e.target.value })} className={inputCls} placeholder="e.g. Logitech" /></Field>
              <Field label="Model"><input value={form.specs?.MouseModel || ''} onChange={e => set("specs", { ...form.specs, MouseModel: e.target.value })} className={inputCls} placeholder="e.g. M100" /></Field>
            </div>
          )}

          {step === customSpecsN && isCustom && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[300px] content-start p-2">
              <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Custom Specifications</div>
              {selectedCustomType.schema.map((field: any, i: number) => (
                <Field key={i} label={field.name}>
                  <input 
                    type={field.type} 
                    value={form.customFields?.[field.name] || ''} 
                    onChange={e => setForm(f => ({ ...f, customFields: { ...(f.customFields || {}), [field.name]: e.target.value } }))} 
                    className={inputCls} 
                  />
                </Field>
              ))}
            </div>
          )}

          {step === maxStep && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[300px] content-start p-2">
              <div className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Network Information (Optional)</div>
              {showFullNetwork && <Field label="Hostname"><input value={form.network?.hostname || ''} onChange={e => set("network", { ...form.network, hostname: e.target.value })} className={inputCls} /></Field>}
              <Field label="IP Address"><input value={form.network?.ip || ''} onChange={e => set("network", { ...form.network, ip: e.target.value })} className={inputCls} /></Field>
              {showFullNetwork && (
                <>
                  <Field label="Ethernet MAC"><input value={form.network?.macEthernet || ''} onChange={e => set("network", { ...form.network, macEthernet: e.target.value })} className={inputCls} placeholder="00:00:00:00:00:00" /></Field>
                  <Field label="WiFi MAC"><input value={form.network?.macWifi || ''} onChange={e => set("network", { ...form.network, macWifi: e.target.value })} className={inputCls} placeholder="00:00:00:00:00:00" /></Field>
                  <Field label="VLAN"><input value={form.network?.vlan || ''} onChange={e => set("network", { ...form.network, vlan: e.target.value })} className={inputCls} /></Field>
                </>
              )}
            </div>
          )}

          <DialogFooter className="col-span-2 mt-6 pt-4 border-t flex items-center justify-between sm:justify-between w-full">
            <button type="button" onClick={() => onOpenChange(false)} className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent">Cancel</button>
            <div className="flex gap-2">
              {(initial ? step > 2 : step > 1) && (
                <button type="button" onClick={handleBack} className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent flex items-center gap-1"><ArrowLeft className="size-4"/> Back</button>
              )}
              {step < maxStep ? (
                <button type="button" onClick={(e) => { e.preventDefault(); handleNext(); }} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-1">Next <ArrowRight className="size-4"/></button>
              ) : (
                <button type="button" disabled={isSubmitting} onClick={handleSubmit} className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Asset"}
                </button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputCls = "w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:border-ring";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`space-y-1 ${className}`}>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
