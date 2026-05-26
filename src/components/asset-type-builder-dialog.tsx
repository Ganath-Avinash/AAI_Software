import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAssetTypes, createAssetType, deleteAssetType } from "@/lib/api";
import { Plus, X, Trash2 } from "lucide-react";

const defaultTypes = ["Laptop","Desktop CPU","Monitor","Printer","Scanner","UPS","Webcam","HDD","Headset","Router","Switch","Keyboard","Mouse","Server","Workstation","Projector","TV","Tab","Plotter","Camera","AllINONE","IT ACCESS."];

export function AssetTypeBuilderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeFields, setNewTypeFields] = useState<{name: string, type: string}[]>([]);
  const queryClient = useQueryClient();
  
  const { data: serverTypes = [] } = useQuery({ queryKey: ['asset-types'], queryFn: fetchAssetTypes });
  const customTypes = serverTypes.filter((t: any) => t.schema && !defaultTypes.includes(t.name));

  const typeBuilderMutation = useMutation({
    mutationFn: async () => createAssetType({ name: newTypeName, schema: newTypeFields }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-types'] });
      onOpenChange(false);
      setNewTypeName("");
      setNewTypeFields([]);
    },
    onError: (err: any) => {
      alert("Failed to create type: " + err.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Asset Types</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {customTypes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground border-b pb-2">Existing Custom Types</div>
              <div className="grid grid-cols-2 gap-2">
                {customTypes.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded border bg-muted/20">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground">{t.schema.length} fields</span>
                    </div>
                    <button 
                      type="button"
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete the "${t.name}" category?`)) {
                          try {
                            await deleteAssetType(t.id);
                            queryClient.invalidateQueries({ queryKey: ['asset-types'] });
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }
                      }}
                      className="text-destructive p-1.5 hover:bg-destructive/10 rounded transition-colors" 
                      title="Delete Type"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground border-b pb-2">Create New Type</div>
            <label className="space-y-1 block">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Asset Type Name</span>
              <input 
                value={newTypeName} 
                onChange={e => setNewTypeName(e.target.value)} 
                className="w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:border-ring" 
                placeholder="e.g. Air Conditioner" 
              />
            </label>
          
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground flex justify-between items-center border-b pb-2">
              <span>Custom Fields Schema</span>
              <button 
                type="button" 
                onClick={() => setNewTypeFields([...newTypeFields, { name: "", type: "text" }])} 
                className="text-primary hover:underline text-xs flex items-center gap-1"
              >
                <Plus className="size-3"/> Add Field
              </button>
            </div>
            
            {newTypeFields.length === 0 && (
              <div className="text-sm text-muted-foreground italic text-center py-4 border-2 border-dashed rounded-lg">
                No custom fields defined yet.
              </div>
            )}
            
            {newTypeFields.map((f, i) => (
              <div key={i} className="flex gap-2 items-center bg-muted/20 p-3 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Field Name</span>
                  <input 
                    required 
                    value={f.name} 
                    onChange={e => { const arr = [...newTypeFields]; arr[i].name = e.target.value; setNewTypeFields(arr); }} 
                    placeholder="e.g. Tonnage" 
                    className="w-full h-8 px-2 rounded border text-sm outline-none focus:border-ring bg-background" 
                  />
                </div>
                <div className="w-32 space-y-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">Data Type</span>
                  <select 
                    value={f.type} 
                    onChange={e => { const arr = [...newTypeFields]; arr[i].type = e.target.value; setNewTypeFields(arr); }} 
                    className="w-full h-8 px-2 rounded border text-sm outline-none focus:border-ring bg-background"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <div className="pt-5">
                  <button 
                    type="button" 
                    onClick={() => setNewTypeFields(newTypeFields.filter((_, idx) => idx !== i))} 
                    className="text-destructive p-1.5 hover:bg-destructive hover:text-destructive-foreground rounded transition-colors"
                    title="Remove field"
                  >
                    <X className="size-4"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <button 
            type="button" 
            onClick={() => onOpenChange(false)} 
            className="h-9 px-4 rounded-md border text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={() => typeBuilderMutation.mutate()} 
            disabled={!newTypeName.trim() || typeBuilderMutation.isPending} 
            className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90"
          >
            {typeBuilderMutation.isPending ? "Creating..." : "Save Asset Type"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
