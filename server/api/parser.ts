export interface TipReport {
    partners: { name: string; hours: number }[];
    totalHours: number;
}

export function parseTipReportFromText(text: string): TipReport {
    const lines = text.split(/\r?\n/);
    const partners: { name: string; hours: number }[] = [];

    // Regex to match lines that look like a partner entry
    // Adjust based on actual OCR output. 
    // Assuming "Name Hours" format for now.
    // Example: "John Doe 32.50"
    const partnerRegex = /([A-Za-z\s]+?)\s+(\d{1,3}\.\d{2})/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(partnerRegex);
        if (match) {
            const name = match[1].trim();
            const hours = parseFloat(match[2]);

            // Filter out common headers or noise if needed
            if (name.toLowerCase().includes("total") || name.toLowerCase().includes("partner")) continue;

            if (name && !isNaN(hours)) {
                partners.push({ name, hours });
            }
        }
    }

    const totalHours = partners.reduce((sum, p) => sum + p.hours, 0);
    return { partners, totalHours };
}
