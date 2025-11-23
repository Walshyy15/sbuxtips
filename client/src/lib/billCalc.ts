export function roundAndCalculateBills(amount: number) {
    return { rounded: Math.round(amount), billBreakdown: {} };
}
