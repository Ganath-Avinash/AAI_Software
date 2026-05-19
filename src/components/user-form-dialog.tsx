import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { User } from "@/lib/mock-data";

type FormData = Omit<User, "id" | "assetIds">;

const empty: FormData = {
  empId: "",
  name: "",
  email: "",
  department: "IT Operations",
  designation: "Sr. Engineer",
  location: "AAI HQ, Rajiv Gandhi Bhawan",
  intercom: "",
  employeeType: "Permanent",
  status: "Active",
};

export function UserFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: User | null;
  onSubmit: (data: FormData) => void;
  title: string;
}) {
  const [form, setForm] = useState<FormData>(empty);

  useEffect(() => {
    if (open) {
      if (initial) {
        const { id: _id, assetIds: _a, ...rest } = initial;
        setForm(rest);
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
            if (!form.name.trim() || !form.empId.trim()) return;
            onSubmit(form);
          }}
          className="grid grid-cols-2 gap-3 text-sm"
        >
          <Field label="Employee ID"><input required value={form.empId} onChange={e => set("empId", e.target.value)} className={inputCls} /></Field>
          <Field label="Full Name"><input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} /></Field>
          <Field label="Email" className="col-span-2"><input type="email" required value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} /></Field>
          <Field label="Department"><input value={form.department} onChange={e => set("department", e.target.value)} className={inputCls} /></Field>
          <Field label="Designation"><input value={form.designation} onChange={e => set("designation", e.target.value)} className={inputCls} /></Field>
          <Field label="Location" className="col-span-2"><input value={form.location} onChange={e => set("location", e.target.value)} className={inputCls} /></Field>
          <Field label="Intercom"><input value={form.intercom} onChange={e => set("intercom", e.target.value)} className={inputCls} /></Field>
          <Field label="Employee Type">
            <select value={form.employeeType} onChange={e => set("employeeType", e.target.value as FormData["employeeType"])} className={inputCls}>
              <option>Permanent</option><option>Contract</option><option>Intern</option>
            </select>
          </Field>
          <Field label="Status" className="col-span-2">
            <select value={form.status} onChange={e => set("status", e.target.value as FormData["status"])} className={inputCls}>
              <option>Active</option><option>Inactive</option>
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
