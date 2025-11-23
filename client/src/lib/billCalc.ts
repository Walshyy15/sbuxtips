export interface BillBreakdown {
  twenties: number;
  tens: number;
  fives: number;
  ones: number;
}

export function calculateEvenBillDistribution(amount: number): BillBreakdown {
  const rounded = Math.round(amount);
  let remaining = rounded;

  const twenties = Math.floor(remaining / 20);
  remaining -= twenties * 20;

  const tens = Math.floor(remaining / 10);
  remaining -= tens * 10;

  const fives = Math.floor(remaining / 5);
  remaining -= fives * 5;

  const ones = remaining;

  return { twenties, tens, fives, ones };
}

export interface CustomBills {
  ones: number;
  fives: number;
  tens: number;
  twenties: number;
}

export function calculateUnevenBillDistribution(
  partners: Array<{ name: string; tipAmount: number }>,
  availableBills: CustomBills
): Map<string, BillBreakdown> {
  const sortedPartners = [...partners].sort((a, b) => b.tipAmount - a.tipAmount);

  const bills = {
    twenties: availableBills.twenties,
    tens: availableBills.tens,
    fives: availableBills.fives,
    ones: availableBills.ones
  };

  const distribution = new Map<string, BillBreakdown>();

  for (const partner of sortedPartners) {
    const amount = Math.round(partner.tipAmount);
    let remaining = amount;

    const breakdown: BillBreakdown = { twenties: 0, tens: 0, fives: 0, ones: 0 };

    while (remaining >= 20 && bills.twenties > 0) {
      breakdown.twenties++;
      bills.twenties--;
      remaining -= 20;
    }

    while (remaining >= 10 && bills.tens > 0) {
      breakdown.tens++;
      bills.tens--;
      remaining -= 10;
    }

    while (remaining >= 5 && bills.fives > 0) {
      breakdown.fives++;
      bills.fives--;
      remaining -= 5;
    }

    while (remaining >= 1 && bills.ones > 0) {
      breakdown.ones++;
      bills.ones--;
      remaining -= 1;
    }

    distribution.set(partner.name, breakdown);
  }

  return distribution;
}

export function roundAndCalculateBills(amount: number) {
    return { rounded: Math.round(amount), billBreakdown: calculateEvenBillDistribution(amount) };
}
