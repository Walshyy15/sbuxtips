import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TipDistribution, PartnerPayout } from "@shared/schema";
import { Users, Clock, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DistributionWithPayouts extends TipDistribution {
  payouts: PartnerPayout[];
}

type HistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { data: distributions, isLoading } = useQuery<DistributionWithPayouts[]>({
    queryKey: ['/api/distributions'],
    enabled: isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--starbucks-green))]">
            <Clock className="w-5 h-5" />
            Distribution History
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-150px)]">
          <div className="space-y-4 py-4 pr-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-[hsl(var(--md-sys-color-surface-variant))] animate-pulse">
                  <div className="h-6 w-32 bg-gray-300 rounded mb-2" />
                  <div className="h-4 w-48 bg-gray-300 rounded" />
                </div>
              ))
            ) : distributions && distributions.length > 0 ? (
              distributions.map((dist) => (
                <div
                  key={dist.id}
                  className="bg-white border-2 border-[hsl(var(--md-sys-color-outline))] rounded-lg p-5 hover:border-[hsl(var(--starbucks-green))] transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[hsl(var(--starbucks-green))]">
                        {new Date(dist.report_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </h3>
                      <p className="text-sm text-[hsl(var(--starbucks-gray))] mt-1">
                        Created {new Date(dist.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[hsl(var(--starbucks-green))]">
                        ${dist.total_tips.toFixed(2)}
                      </p>
                      <p className="text-xs text-[hsl(var(--starbucks-gray))]">Total Tips</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[hsl(var(--starbucks-gray))]" />
                      <span className="text-sm">
                        {dist.payouts?.length || 0} partners
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[hsl(var(--starbucks-gray))]" />
                      <span className="text-sm">
                        {dist.total_hours.toFixed(2)} hours
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[hsl(var(--starbucks-gray))]" />
                      <span className="text-sm">
                        ${(dist.total_tips / dist.total_hours).toFixed(2)}/hr
                      </span>
                    </div>
                  </div>

                  {dist.payouts && dist.payouts.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-[hsl(var(--starbucks-gray))] mb-2">
                        Partner Breakdown
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {dist.payouts.map((payout) => (
                          <div key={payout.id} className="flex justify-between text-sm">
                            <span>{payout.partner_name}</span>
                            <span className="font-medium text-[hsl(var(--starbucks-green))]">
                              ${payout.tip_amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-[hsl(var(--md-sys-color-surface-variant))] rounded-lg p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--starbucks-gray))]" />
                <p className="text-[hsl(var(--starbucks-gray))]">No distribution history yet</p>
                <p className="text-sm text-[hsl(var(--starbucks-gray))] mt-1">
                  Start by uploading a tip report
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
