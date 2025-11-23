import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function calculatePayout(hours: number, rate: number): number {
    return hours * rate;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function parseManualEntry(input: string): Array<{ name: string; hours: number }> {
    const lines = input.trim().split('\n');
    const partners: Array<{ name: string; hours: number }> = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/^(.+?)[\s:,]+(\d+(?:\.\d{1,2})?)$/);
        if (match) {
            const name = match[1].trim();
            const hours = parseFloat(match[2]);
            if (name && !isNaN(hours) && hours > 0) {
                partners.push({ name, hours });
            }
        }
    }

    return partners;
}

export function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
