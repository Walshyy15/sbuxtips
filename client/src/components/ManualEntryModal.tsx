import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { parseManualEntry } from "@/lib/utils";

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcess = () => {
    if (!manualInput.trim()) {
      toast({
        title: "No data entered",
        description: "Please enter partner information",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const parsedData = parseManualEntry(manualInput);

      if (parsedData.length === 0) {
        toast({
          title: "Invalid format",
          description: "Please use the format: Name: hours (e.g., John Doe: 32.5)",
          variant: "destructive"
        });
        return;
      }

      const totalHours = parsedData.reduce((sum, p) => sum + p.hours, 0);

      toast({
        title: "Partners parsed successfully",
        description: `Found ${parsedData.length} partners with ${totalHours.toFixed(2)} total hours`,
      });

      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error parsing data",
        description: "Please check your input format",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--starbucks-green))]">
            <UserPlus className="w-5 h-5" />
            Manual Partner Entry
          </DialogTitle>
          <DialogDescription>
            Enter partner names and hours, one per line
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-[hsl(var(--md-sys-color-surface-variant))] rounded-lg p-4 text-sm">
            <p className="font-semibold mb-2">Format:</p>
            <code className="block font-mono">Name: hours</code>
            <p className="mt-2 text-[hsl(var(--starbucks-gray))]">Example:</p>
            <code className="block font-mono text-xs">
              John Smith: 32.5<br />
              Maria Garcia: 24<br />
              David Johnson: 40
            </code>
          </div>

          <Textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="John Smith: 32.5&#10;Maria Garcia: 24&#10;David Johnson: 40"
            className="h-64 font-mono"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleProcess}
            disabled={!manualInput.trim() || isProcessing}
            className="flex-1 bg-[hsl(var(--starbucks-green))] hover:bg-[hsl(var(--starbucks-green-dark))] text-white"
          >
            {isProcessing ? "Processing..." : "Process Partners"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
