import { useState } from "react";
import { DollarSign, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { calculateEvenBillDistribution, calculateUnevenBillDistribution } from "@/lib/billCalc";

interface BillBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: Array<{ name: string; hours: number }>;
  totalHours: number;
  reportText: string;
}

export default function BillBreakdownModal({
  isOpen,
  onClose,
  partners,
  totalHours,
  reportText
}: BillBreakdownModalProps) {
  const [totalTips, setTotalTips] = useState("");
  const [hasUnevenBills, setHasUnevenBills] = useState(false);
  const [billOnes, setBillOnes] = useState("");
  const [billFives, setBillFives] = useState("");
  const [billTens, setBillTens] = useState("");
  const [billTwenties, setBillTwenties] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const handleCalculate = async () => {
    const tips = parseFloat(totalTips);
    if (isNaN(tips) || tips <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid tip amount",
        variant: "destructive"
      });
      return;
    }

    if (hasUnevenBills) {
      const ones = parseInt(billOnes) || 0;
      const fives = parseInt(billFives) || 0;
      const tens = parseInt(billTens) || 0;
      const twenties = parseInt(billTwenties) || 0;
      const billTotal = ones + (fives * 5) + (tens * 10) + (twenties * 20);

      if (billTotal !== tips) {
        toast({
          title: "Bill mismatch",
          description: `Bill total ($${billTotal}) doesn't match tip amount ($${tips})`,
          variant: "destructive"
        });
        return;
      }
    }

    setIsCalculating(true);
    try {
      const response = await fetch("/api/distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partners,
          totalTips: tips,
          reportDate: new Date().toISOString().split('T')[0],
          hasUnevenBills,
          billOnes: hasUnevenBills ? parseInt(billOnes) || 0 : undefined,
          billFives: hasUnevenBills ? parseInt(billFives) || 0 : undefined,
          billTens: hasUnevenBills ? parseInt(billTens) || 0 : undefined,
          billTwenties: hasUnevenBills ? parseInt(billTwenties) || 0 : undefined,
          reportText
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save distribution");
      }

      const data = await response.json();

      toast({
        title: "Distribution calculated",
        description: `Tips distributed to ${partners.length} partners`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const hourlyRate = parseFloat(totalTips) / totalHours;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--starbucks-green))]">
            <DollarSign className="w-5 h-5" />
            Calculate Tip Distribution
          </DialogTitle>
          <DialogDescription>
            Enter the total tips amount and optionally specify bill denominations
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="totalTips">Total Tips Amount ($)</Label>
              <Input
                id="totalTips"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={totalTips}
                onChange={(e) => setTotalTips(e.target.value)}
                className="text-lg"
              />
            </div>

            {totalTips && !isNaN(parseFloat(totalTips)) && (
              <div className="bg-[hsl(var(--md-sys-color-surface-variant))] rounded-lg p-4">
                <p className="text-sm text-[hsl(var(--starbucks-gray))] mb-2">Hourly Rate</p>
                <p className="text-2xl font-bold text-[hsl(var(--starbucks-green))]">
                  ${hourlyRate.toFixed(2)}/hour
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Custom Bill Breakdown</Label>
                <p className="text-sm text-[hsl(var(--starbucks-gray))]">
                  Specify exact bill counts
                </p>
              </div>
              <Switch
                checked={hasUnevenBills}
                onCheckedChange={setHasUnevenBills}
              />
            </div>

            {hasUnevenBills && (
              <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-semibold text-[hsl(var(--starbucks-green))]">Bill Denominations</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twenties">$20 Bills</Label>
                    <Input
                      id="twenties"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={billTwenties}
                      onChange={(e) => setBillTwenties(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tens">$10 Bills</Label>
                    <Input
                      id="tens"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={billTens}
                      onChange={(e) => setBillTens(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fives">$5 Bills</Label>
                    <Input
                      id="fives"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={billFives}
                      onChange={(e) => setBillFives(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ones">$1 Bills</Label>
                    <Input
                      id="ones"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={billOnes}
                      onChange={(e) => setBillOnes(e.target.value)}
                    />
                  </div>
                </div>
                {(billOnes || billFives || billTens || billTwenties) && (
                  <div className="bg-[hsl(var(--md-sys-color-surface-variant))] rounded p-3">
                    <p className="text-sm font-medium">
                      Bill Total: ${((parseInt(billTwenties) || 0) * 20 +
                                    (parseInt(billTens) || 0) * 10 +
                                    (parseInt(billFives) || 0) * 5 +
                                    (parseInt(billOnes) || 0))}
                    </p>
                  </div>
                )}
              </div>
            )}

            {totalTips && !isNaN(parseFloat(totalTips)) && partners.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-[hsl(var(--starbucks-green))] mb-3">Preview</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {partners.map((partner, index) => {
                    const tipAmount = partner.hours * hourlyRate;
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-[hsl(var(--md-sys-color-surface-variant))] rounded"
                      >
                        <span className="font-medium">{partner.name}</span>
                        <span className="text-[hsl(var(--starbucks-green))] font-bold">
                          ${tipAmount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCalculate}
            disabled={!totalTips || isCalculating}
            className="flex-1 bg-[hsl(var(--starbucks-green))] hover:bg-[hsl(var(--starbucks-green-dark))] text-white"
          >
            {isCalculating ? "Calculating..." : "Calculate & Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
