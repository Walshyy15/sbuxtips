export interface TipReport {
    partners: { name: string; hours: number }[];
    totalHours: number;
}

export function parseTipReportFromText(text: string): TipReport {
    const lines = text.split(/\r?\n/);
    const partners: { name: string; hours: number }[] = [];

    const partnerRegex1 = /^([A-Za-z][A-Za-z\s.'-]+[A-Za-z])\s+(\d{1,3}\.?\d{0,2})\s*$/;
    const partnerRegex2 = /([A-Za-z][A-Za-z\s.'-]+[A-Za-z])\s+(\d{1,3}\.?\d{0,2})/;
    const partnerRegex3 = /^(.+?)\s+(\d+(?:\.\d{1,2})?)\s*$/;

    const excludeKeywords = [
        'total', 'partner', 'name', 'hours', 'week', 'ending', 'store', 'distribution',
        'report', 'tips', 'summary', 'page', 'starbucks', 'barista', 'shift', 'supervisor',
        'date', 'period', 'grand', 'subtotal', 'employee', 'staff', 'team'
    ];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.length < 3) continue;

        const lowerLine = trimmed.toLowerCase();
        const hasExcluded = excludeKeywords.some(kw => lowerLine.includes(kw));
        if (hasExcluded) continue;

        let match = trimmed.match(partnerRegex1);
        if (!match) match = trimmed.match(partnerRegex2);
        if (!match) match = trimmed.match(partnerRegex3);

        if (match) {
            const rawName = match[1].trim();
            const hoursStr = match[2].trim();
            const hours = parseFloat(hoursStr);

            if (!rawName || rawName.length < 2) continue;
            if (isNaN(hours) || hours <= 0 || hours > 200) continue;

            const nameWithoutNumbers = rawName.replace(/\d+/g, '').trim();
            if (nameWithoutNumbers.length < 2) continue;

            const nameWords = nameWithoutNumbers.split(/\s+/);
            if (nameWords.length === 0 || nameWords.every(w => w.length === 1)) continue;

            const cleanName = nameWithoutNumbers
                .replace(/[^\w\s.'-]/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            if (cleanName && cleanName.length >= 2) {
                partners.push({ name: cleanName, hours });
            }
        }
    }

    const uniquePartners = new Map<string, number>();
    for (const partner of partners) {
        const key = partner.name.toLowerCase();
        if (!uniquePartners.has(key)) {
            uniquePartners.set(key, partner.hours);
        }
    }

    const finalPartners = Array.from(uniquePartners.entries()).map(([name, hours]) => ({
        name: partners.find(p => p.name.toLowerCase() === name)!.name,
        hours
    }));

    const totalHours = finalPartners.reduce((sum, p) => sum + p.hours, 0);
    return { partners: finalPartners, totalHours };
}
