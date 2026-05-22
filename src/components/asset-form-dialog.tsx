import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers, fetchLocations, fetchVendors } from "@/lib/api";
import type { Asset } from "@/lib/mock-data";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const typePrefixes: Record<string, string> = {
  "Laptop": "AAI-ASS-LP-",
  "Desktop CPU": "AAI-ASS-DK-",
  "Monitor": "AAI-ASS-MO-",
  "Printer": "AAI-ASS-PR-",
  "Scanner": "AAI-ASS-SC-",
  "UPS": "AAI-ASS-UP-",
  "Webcam": "AAI-ASS-WC-",
  "HDD": "AAI-ASS-HD-",
  "Headset": "AAI-ASS-HS-",
  "Router": "AAI-ASS-RT-",
  "Switch": "AAI-ASS-SW-",
};

type FormData = {
  id?: string;
  idNumber?: string;
  type: Asset["type"];
  make: string;
  model: string;
  serial: string;
  purchaseDate: string;
  warrantyUntil: string;
  status: Asset["status"];
  location: string;
  assignedTo: string;
  vendor?: string;
  specs?: any;
  network?: any;
};

const empty: FormData = {
  idNumber: "",
  type: "Laptop",
  make: "",
  model: "",
  serial: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  warrantyUntil: new Date(Date.now() + 3 * 365 * 86400_000).toISOString().slice(0, 10),
  status: "Available",
  location: "ADMIN-TF",
  assignedTo: "",
  vendor: "",
  specs: {},
  network: {},
};

const types: Asset["type"][] = ["Laptop","Desktop CPU","Monitor","Printer","Scanner","UPS","Webcam","HDD","Headset","Router","Switch"];

export function AssetFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Asset | null;
  onSubmit: (data: FormData) => void;
  title: string;
}) {
  const [form, setForm] = useState<FormData>(empty);
  const [step, setStep] = useState(1);
  
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { data: locations = [] } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });
  const { data: vendors = [] } = useQuery({ queryKey: ['vendors'], queryFn: fetchVendors });

  useEffect(() => {
    if (open) {
      setStep(initial ? 2 : 1);
      if (initial) {
        let idNum = "";
        let prefix = typePrefixes[initial.type] || "AAI-ASS-";
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
          warrantyUntil: initial.warrantyUntil,
          status: initial.status,
          location: initial.location,
          assignedTo: initial.assignedTo ?? "",
          vendor: initial.vendor ?? "",
          specs: initial.specs || {},
          network: initial.network || {},
        });
      } else {
        setForm(empty);
      }
    }
  }, [open, initial]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }));
  
  const showSpecs = form.type === "Laptop" || form.type === "Desktop CPU";
  
  const stepsList = [
    { n: 1, label: "Category" },
    { n: 2, label: "Basic Info" },
    ...(showSpecs ? [{ n: 3, label: "Specs" }] : []),
    { n: showSpecs ? 4 : 3, label: "Network" },
  ];
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
      const finalId = initial ? form.id : `${typePrefixes[form.type] || "AAI-ASS-"}${form.idNumber}`;
      onSubmit({ ...form, id: finalId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-3 min-h-[300px]">
              <Field label="Asset ID" className="col-span-2 sm:col-span-1">
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm whitespace-nowrap">
                    {typePrefixes[form.type] || "AAI-ASS-"}
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
              <Field label="Status">
                <select value={form.status} onChange={e => set("status", e.target.value as Asset["status"])} className={inputCls}>
                  <option>Available</option><option>Assigned</option><option>Maintenance</option><option>Expired</option>
                </select>
              </Field>
              <Field label="Make"><input value={form.make} onChange={e => set("make", e.target.value)} className={inputCls} /></Field>
              <Field label="Model"><input required value={form.model} onChange={e => set("model", e.target.value)} className={inputCls} /></Field>
              <Field label="Serial Number" className="col-span-2"><input required value={form.serial} onChange={e => set("serial", e.target.value)} className={inputCls} /></Field>
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
              <Field label="Purchase Date"><input type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} className={inputCls} /></Field>
              <Field label="Warranty Until"><input type="date" value={form.warrantyUntil} onChange={e => set("warrantyUntil", e.target.value)} className={inputCls} /></Field>
              <Field label="Location" className="col-span-2">
                <select value={form.location} onChange={e => set("location", e.target.value)} className={inputCls}>
                  <option value="">— Select Location —</option>
                  {locations.map((l: string) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Assigned To" className="col-span-2">
                <select value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} className={inputCls}>
                  <option value="">— Unassigned —</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.empId})</option>)}
                </select>
              </Field>
            </div>
          )}

          {step === 3 && showSpecs && (
            <div className="grid grid-cols-2 gap-3 min-h-[300px] content-start p-1">
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hardware Specifications</div>
              <Field label="Processor"><input value={form.specs?.Processor || ''} onChange={e => set("specs", { ...form.specs, Processor: e.target.value })} className={inputCls} placeholder="e.g. Intel Core i7" /></Field>
              <Field label="Operating System"><input value={form.specs?.OS || ''} onChange={e => set("specs", { ...form.specs, OS: e.target.value })} className={inputCls} placeholder="e.g. Windows 11 Pro" /></Field>
              <Field label="RAM"><input value={form.specs?.RAM || ''} onChange={e => set("specs", { ...form.specs, RAM: e.target.value })} className={inputCls} placeholder="e.g. 16GB" /></Field>
              <Field label="Storage"><input value={form.specs?.Storage || ''} onChange={e => set("specs", { ...form.specs, Storage: e.target.value })} className={inputCls} placeholder="e.g. 512GB SSD NVMe" /></Field>
            </div>
          )}

          {step === maxStep && (
            <div className="grid grid-cols-2 gap-3 min-h-[300px] content-start p-1">
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Network Information (Optional)</div>
              <Field label="Hostname"><input value={form.network?.hostname || ''} onChange={e => set("network", { ...form.network, hostname: e.target.value })} className={inputCls} /></Field>
              <Field label="IP Address"><input value={form.network?.ip || ''} onChange={e => set("network", { ...form.network, ip: e.target.value })} className={inputCls} /></Field>
              <Field label="Ethernet MAC"><input value={form.network?.macEthernet || ''} onChange={e => set("network", { ...form.network, macEthernet: e.target.value })} className={inputCls} placeholder="00:00:00:00:00:00" /></Field>
              <Field label="WiFi MAC"><input value={form.network?.macWifi || ''} onChange={e => set("network", { ...form.network, macWifi: e.target.value })} className={inputCls} placeholder="00:00:00:00:00:00" /></Field>
              <Field label="VLAN"><input value={form.network?.vlan || ''} onChange={e => set("network", { ...form.network, vlan: e.target.value })} className={inputCls} /></Field>
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
                <button type="button" onClick={handleSubmit} className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Save Asset</button>
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
