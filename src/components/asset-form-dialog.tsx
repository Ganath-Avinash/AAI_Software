import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { users, type Asset } from "@/lib/mock-data";

type FormData = {
  type: Asset["type"];
  make: string;
  model: string;
  serial: string;
  purchaseDate: string;
  warrantyUntil: string;
  status: Asset["status"];
  location: string;
  assignedTo: string;
};

const empty: FormData = {
  type: "Laptop",
  make: "",
  model: "",
  serial: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  warrantyUntil: new Date(Date.now() + 3 * 365 * 86400_000).toISOString().slice(0, 10),
  status: "Available",
  location: "AAI HQ, Rajiv Gandhi Bhawan",
  assignedTo: "",
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

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          type: initial.type,
          make: initial.make,
          model: initial.model,
          serial: initial.serial,
          purchaseDate: initial.purchaseDate,
          warrantyUntil: initial.warrantyUntil,
          status: initial.status,
          location: initial.location,
          assignedTo: initial.assignedTo ?? "",
        });
      } else {
        setForm(empty);
      }
    }
  }, [open, initial]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.model.trim() || !form.serial.trim()) return;
            onSubmit(form);
          }}
          className="grid grid-cols-2 gap-3 text-sm"
        >
          <Field label="Type">
            <select value={form.type} onChange={e => set("type", e.target.value as Asset["type"])} className={inputCls}>
              {types.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => set("status", e.target.value as Asset["status"])} className={inputCls}>
              <option>Available</option><option>Assigned</option><option>Maintenance</option><option>Expired</option>
            </select>
          </Field>
          <Field label="Make"><input value={form.make} onChange={e => set("make", e.target.value)} className={inputCls} /></Field>
          <Field label="Model"><input required value={form.model} onChange={e => set("model", e.target.value)} className={inputCls} /></Field>
          <Field label="Serial Number" className="col-span-2"><input required value={form.serial} onChange={e => set("serial", e.target.value)} className={inputCls} /></Field>
          <Field label="Purchase Date"><input type="date" value={form.purchaseDate} onChange={e => set("purchaseDate", e.target.value)} className={inputCls} /></Field>
          <Field label="Warranty Until"><input type="date" value={form.warrantyUntil} onChange={e => set("warrantyUntil", e.target.value)} className={inputCls} /></Field>
          <Field label="Location" className="col-span-2"><input value={form.location} onChange={e => set("location", e.target.value)} className={inputCls} /></Field>
          <Field label="Assigned To" className="col-span-2">
            <select value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} className={inputCls}>
              <option value="">— Unassigned —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.empId})</option>)}
            </select>
          </Field>
          <DialogFooter className="col-span-2 mt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="h-9 px-3 rounded-md border bg-card text-sm font-medium hover:bg-accent">Cancel</button>
            <button type="submit" className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Save</button>
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
