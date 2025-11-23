import { useState } from "react";
import { Upload, Calculator, History, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileDropzone from "@/components/FileDropzone";
import OCRResultCard from "@/components/OCRResultCard";
import BillBreakdownModal from "@/components/BillBreakdownModal";
import ManualEntryModal from "@/components/ManualEntryModal";
import HistoryModal from "@/components/HistoryModal";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/parseTipReport", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();
      setOcrResult(data);

      toast({
        title: "Report processed successfully",
        description: `Found ${data.report.partners.length} partners`,
      });
    } catch (error: any) {
      toast({
        title: "Error processing report",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculate = () => {
    if (ocrResult) {
      setShowBillModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[hsl(var(--starbucks-green))] mb-2">
          Automatic Tip Calculator
        </h2>
        <p className="text-[hsl(var(--starbucks-gray))]">
          Upload your Starbucks Tips Distribution Report and let us do the math
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => setShowManualModal(true)}
          variant="outline"
          className="gap-2"
        >
          <Calculator className="w-4 h-4" />
          Manual Entry
        </Button>
        <Button
          onClick={() => setShowHistoryModal(true)}
          variant="outline"
          className="gap-2"
        >
          <History className="w-4 h-4" />
          View History
        </Button>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Report
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2" disabled={!ocrResult}>
            <Users className="w-4 h-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6 mt-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Upload Tip Distribution Report</CardTitle>
              <CardDescription>
                Upload an image of your Starbucks tip report. We'll automatically extract all partner names and hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone
                onFileSelect={handleFileUpload}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>

          {ocrResult && (
            <div className="max-w-4xl mx-auto">
              <OCRResultCard
                result={ocrResult}
                onCalculate={handleCalculate}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {ocrResult && (
            <div className="max-w-4xl mx-auto">
              <OCRResultCard
                result={ocrResult}
                onCalculate={handleCalculate}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showBillModal && ocrResult && (
        <BillBreakdownModal
          isOpen={showBillModal}
          onClose={() => setShowBillModal(false)}
          partners={ocrResult.report.partners}
          totalHours={ocrResult.report.totalHours}
          reportText={ocrResult.rawText}
        />
      )}

      {showManualModal && (
        <ManualEntryModal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
        />
      )}

      {showHistoryModal && (
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}
