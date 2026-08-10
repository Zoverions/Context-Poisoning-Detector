import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Papa from 'papaparse';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 400_000;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const enforceExtractedLimit = (text: string): string => {
  if (text.length > MAX_EXTRACTED_CHARS) {
    throw new Error('Extracted text exceeds the 400,000-character analysis limit.');
  }
  return text;
};

export const parseFile = async (file: File): Promise<string> => {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('File exceeds the 8 MiB ingestion limit.');
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let text = '';

  switch (extension) {
    case 'txt':
    case 'md':
      text = await file.text();
      break;
    case 'docx': {
      const arrayBuffer = await file.arrayBuffer();
      const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
      const doc = new DOMParser().parseFromString(mammothResult.value, 'text/html');
      text = doc.body.textContent || '';
      break;
    }
    case 'pdf': {
      const pdfBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) =>
            typeof item === 'object' && item !== null && 'str' in item
              ? String((item as { str: unknown }).str)
              : '',
          )
          .join(' ');
        fullText += `${pageText}\n`;
        if (fullText.length > MAX_EXTRACTED_CHARS) {
          throw new Error('Extracted text exceeds the 400,000-character analysis limit.');
        }
      }
      text = fullText;
      break;
    }
    case 'csv': {
      const csvText = await file.text();
      const parsed = Papa.parse<Record<string, unknown>>(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      if (parsed.errors.length > 0) {
        throw new Error(`CSV parsing failed: ${parsed.errors[0].message}`);
      }

      if (parsed.data.length > 0) {
        const headers = parsed.meta.fields || Object.keys(parsed.data[0] || {});
        if (headers.length > 0) {
          const headerRow = `| ${headers.join(' | ')} |`;
          const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
          const rows = parsed.data
            .map(row => `| ${headers.map(header => String(row[header] ?? '')).join(' | ')} |`)
            .join('\n');
          text = `${headerRow}\n${separatorRow}\n${rows}`;
        } else {
          text = csvText;
        }
      } else {
        text = csvText;
      }
      break;
    }
    default:
      throw new Error(`Unsupported file type: .${extension}.`);
  }

  return enforceExtractedLimit(text);
};
