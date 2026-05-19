import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { changePassword } = useAuth();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPass !== confirmPass) {
      setError("New passwords do not match.");
      return;
    }
    if (newPass.length < 4) {
      setError("New password must be at least 4 characters.");
      return;
    }

    const res = changePassword(oldPass, newPass);
    if (!res) {
      setError("Incorrect current password.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
        setSuccess(false);
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) { setError(""); setSuccess(false); setOldPass(""); setNewPass(""); setConfirmPass(""); }
    }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-4">
          {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">{error}</div>}
          {success && <div className="text-sm font-medium text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 p-2 rounded-md">Password updated successfully.</div>}
          
          <div className="space-y-1">
            <label className="text-xs font-medium">Current Password</label>
            <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} required className="w-full h-9 px-3 rounded-md border text-sm outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">New Password</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required className="w-full h-9 px-3 rounded-md border text-sm outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Confirm New Password</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required className="w-full h-9 px-3 rounded-md border text-sm outline-none focus:border-primary" />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent">Cancel</button>
            <button type="submit" disabled={success} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Update Password</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
