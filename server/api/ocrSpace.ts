import FormData from "form-data";
import fetch from "node-fetch";

export async function ocrSpaceFromImage(buffer: Buffer, filename: string): Promise<string> {
    const apiKey = process.env.OCRSPACE_API_KEY;
    if (!apiKey) throw new Error("Missing OCRSPACE_API_KEY env var");

    const form = new FormData();
    form.append("file", buffer, { filename });
    form.append("language", "eng");
    form.append("isTable", "true");
    form.append("OCREngine", "2");
    form.append("apikey", apiKey);

    const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
    });

    const data = await response.json() as any;

    if (data.IsErroredOnProcessing) {
        const errorMessage = data.ErrorMessage?.[0] || "OCR processing failed";
        throw new Error(`OCR Error: ${errorMessage}`);
    }

    const parsedText = data.ParsedResults?.[0]?.ParsedText ?? "";
    return parsedText;
}
