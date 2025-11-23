import { Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OCRResultCardProps {
  result: {
    report: {
      partners: Array<{ name: string; hours: number }>;
      totalHours: number;
    };
    rawText: string;
  };
  onCalculate: () => void;
}

export default function OCRResultCard({ result, onCalculate }: OCRResultCardProps) {
  return (
    <Card>
      <CardHeader className="bg-[hsl(var(--starbucks-green))] text-white">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Extracted Partner Data
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[hsl(var(--md-sys-color-surface-variant))] rounded-lg p-4">
            <p className="text-sm text-[hsl(var(--starbucks-gray))] mb-1">Total Partners</p>
            <p className="text-3xl font-bold text-[hsl(var(--starbucks-green))]">
              {result.report.partners.length}
            </p>
          </div>
          <div className="bg-[hsl(var(--md-sys-color-surface-variant))] rounded-lg p-4">
            <p className="text-sm text-[hsl(var(--starbucks-gray))] mb-1">Total Hours</p>
            <p className="text-3xl font-bold text-[hsl(var(--starbucks-green))]">
              {result.report.totalHours.toFixed(2)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-[hsl(var(--starbucks-green))] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Partner Hours Breakdown
          </h3>
          <ScrollArea className="h-[300px] border rounded-lg">
            <div className="p-4 space-y-2">
              {result.report.partners.map((partner, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-[hsl(var(--md-sys-color-surface-variant))] rounded-lg"
                >
                  <span className="font-medium text-[hsl(var(--starbucks-green))]">{partner.name}</span>
                  <span className="text-[hsl(var(--starbucks-gray))] font-semibold">
                    {partner.hours.toFixed(2)} hrs
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Button
          onClick={onCalculate}
          className="w-full bg-[hsl(var(--starbucks-green))] hover:bg-[hsl(var(--starbucks-green-dark))] text-white"
          size="lg"
        >
          Calculate Tips
        </Button>
      </CardContent>
    </Card>
  );
}
