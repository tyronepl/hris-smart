import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class ResumeService {
  async extractText(file: any): Promise<string> {
    const buffer = await fs.readFile(file.path);

    if (file.mimetype === 'application/pdf') {
      const parser = new PDFParse({
        data: buffer,
      });

      const result = await parser.getText();

      await parser.destroy();

      return result.text.trim();
    }

    if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({
        buffer,
      });

      return result.value.trim();
    }

    throw new Error('Unsupported resume format');
  }
}