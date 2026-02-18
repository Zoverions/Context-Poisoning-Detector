import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import Papa from 'papaparse';

// Configure the worker. Using unpkg is a reliable fallback if local bundling has issues.
// Note: In a production app, you might want to bundle the worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const parseFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    let text = '';

    switch(extension) {
        case 'txt':
        case 'md':
            text = await file.text();
            break;
        case 'docx':
            const arrayBuffer = await file.arrayBuffer();
            const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
            const doc = new DOMParser().parseFromString(mammothResult.value, 'text/html');
            text = doc.body.textContent || "";
            break;
        case 'pdf':
            const pdfBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += pageText + '\n';
            }
            text = fullText;
            break;
        case 'csv':
            const csvText = await file.text();
            // Parse CSV using PapaParse
            const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

            // Format as Markdown table for better LLM comprehension
            if (parsed.data && parsed.data.length > 0) {
                const headers = parsed.meta.fields || Object.keys(parsed.data[0] as object);
                if (headers.length > 0) {
                    const headerRow = `| ${headers.join(' | ')} |`;
                    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
                    const rows = (parsed.data as any[]).map(row => {
                         // Ensure row values align with headers
                        return `| ${headers.map(header => (row[header] !== undefined ? row[header] : '')).join(' | ')} |`;
                    }).join('\n');
                    text = `${headerRow}\n${separatorRow}\n${rows}`;
                } else {
                    text = csvText;
                }
            } else {
                 text = csvText;
            }
            break;
        default:
            throw new Error(`Unsupported file type: .${extension}.`);
    }

    return text;
};
