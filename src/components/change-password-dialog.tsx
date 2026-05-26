import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff } from "lucide-react";

export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { changePassword } = useAuth();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

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
      if (!val) { setError(""); setSuccess(false); setOldPass(""); setNewPass(""); setConfirmPass(""); setShowOldPass(false); setShowNewPass(false); setShowConfirmPass(false); }
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
            <div className="relative">
              <input type={showOldPass ? "text" : "password"} value={oldPass} onChange={e => setOldPass(e.target.value)} required autoComplete="current-password" className="w-full h-9 px-3 pr-10 rounded-md border text-sm outline-none focus:border-primary" />
              <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showOldPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">New Password</label>
            <div className="relative">
              <input type={showNewPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} required autoComplete="new-password" className="w-full h-9 px-3 pr-10 rounded-md border text-sm outline-none focus:border-primary" />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Confirm New Password</label>
            <div className="relative">
              <input type={showConfirmPass ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required autoComplete="new-password" className="w-full h-9 px-3 pr-10 rounded-md border text-sm outline-none focus:border-primary" />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
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
