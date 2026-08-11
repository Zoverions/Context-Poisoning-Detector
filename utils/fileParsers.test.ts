import { parseFile } from './fileParsers';
import { JSDOM } from 'jsdom';
import { describe, it, expect, vi } from 'vitest';

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
    GlobalWorkerOptions: {
        workerSrc: ''
    },
    getDocument: vi.fn(() => ({
        promise: Promise.resolve({
            numPages: 1,
            getPage: vi.fn(() => Promise.resolve({
                getTextContent: vi.fn(() => Promise.resolve({
                    items: [{ str: 'PDF Content' }]
                }))
            }))
        })
    })),
    version: '1.0.0'
}));

// Mock mammoth
vi.mock('mammoth', () => ({
    default: {
        convertToHtml: vi.fn(() => Promise.resolve({ value: '<p>DOCX Content</p>' }))
    }
}));

// Use a real standards-based parser in the test environment. A regex-based
// HTML stripper both misrepresents browser behavior and creates a misleading
// sanitizer pattern for security analysis.
global.DOMParser = new JSDOM('').window.DOMParser;


describe('parseFile', () => {
    it('should parse .txt files', async () => {
        const file = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
        const text = await parseFile(file);
        expect(text).toBe('Hello World');
    });

    it('should parse .md files', async () => {
        const file = new File(['# Title'], 'test.md', { type: 'text/markdown' });
        const text = await parseFile(file);
        expect(text).toBe('# Title');
    });

    it('should parse .csv files', async () => {
        const csvContent = 'name,age\nAlice,30\nBob,25';
        const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
        const text = await parseFile(file);
        expect(text).toContain('| name | age |');
        expect(text).toContain('| Alice | 30 |');
        expect(text).toContain('| Bob | 25 |');
    });

    it('should parse .docx files', async () => {
        // Since we mocked mammoth, we expect the mocked return value
        const file = new File(['fake docx content'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const text = await parseFile(file);
        expect(text).toBe('DOCX Content');
    });

    it('should parse .pdf files', async () => {
        // Since we mocked pdfjs-dist, we expect the mocked return value
        const file = new File(['fake pdf content'], 'test.pdf', { type: 'application/pdf' });
        const text = await parseFile(file);
        expect(text).toContain('PDF Content');
    });

    it('should throw error for unsupported files', async () => {
        const file = new File([''], 'test.xyz');
        await expect(parseFile(file)).rejects.toThrow('Unsupported file type: .xyz');
    });
});
