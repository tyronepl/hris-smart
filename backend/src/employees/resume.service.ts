import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';
import { CanvasFactory } from 'pdf-parse/worker';
import * as mammoth from 'mammoth';

@Injectable()
export class ResumeService {
  private readonly uploadDirectory = path.join(
    process.cwd(),
    'uploads',
    'resumes',
  );

  private readonly n8nWebhookUrl =
    process.env.N8N_WEBHOOK_URL ||
    'http://localhost:5678/webhook/resume-autofill';

  constructor() {
    fs.mkdirSync(this.uploadDirectory, {
      recursive: true,
    });
  }

  // =========================
  // EXTRACT RESUME TEXT
  // =========================

  async extractText(file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException(
        'Resume file is required.',
      );
    }

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    // =========================
    // PDF
    // =========================

    if (extension === '.pdf') {
      if (!file.buffer) {
        throw new BadRequestException(
          'Unable to read the uploaded PDF file.',
        );
      }

      const parser = new PDFParse({
        data: file.buffer,
        CanvasFactory,
      });

      try {
        const result = await parser.getText();

        return result.text.trim();
      } catch (error) {
        console.error(
          'PDF extraction error:',
          error,
        );

        throw new BadRequestException(
          'Unable to extract text from the PDF resume.',
        );
      } finally {
        await parser.destroy();
      }
    }

    // =========================
    // DOCX
    // =========================

    if (extension === '.docx') {
      if (!file.buffer) {
        throw new BadRequestException(
          'Unable to read the uploaded DOCX file.',
        );
      }

      try {
        const result =
          await mammoth.extractRawText({
            buffer: file.buffer,
          });

        return result.value.trim();
      } catch (error) {
        console.error(
          'DOCX extraction error:',
          error,
        );

        throw new BadRequestException(
          'Unable to extract text from the DOCX resume.',
        );
      }
    }

    // =========================
    // LEGACY DOC
    // =========================

    if (extension === '.doc') {
      throw new BadRequestException(
        'Legacy DOC files are not supported for AI parsing. Please use PDF or DOCX.',
      );
    }

    throw new BadRequestException(
      'Unsupported resume format. Please upload PDF or DOCX.',
    );
  }

  // =========================
  // AI RESUME AUTOFILL
  // =========================

  async parseResumeWithAI(file: any) {
    const text =
      await this.extractText(file);

    if (!text) {
      throw new BadRequestException(
        'Unable to extract text from the resume.',
      );
    }

    try {
      const response =
        await fetch(this.n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            resumeText: text,
            fileName:
              file.originalname,
          }),
        });

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          'n8n webhook error:',
          errorText,
        );

        throw new InternalServerErrorException(
          'AI resume processing failed.',
        );
      }

      const result =
        await response.json();

      return result;
    } catch (error) {
      console.error(
        'AI resume parsing error:',
        error,
      );

      if (
        error instanceof
        InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Unable to connect to the AI resume processing service.',
      );
    }
  }

  // =========================
  // SAVE RESUME
  // =========================

  async saveResume(
    file: any,
    employeeId: number,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Resume file is required.',
      );
    }

    if (!file.buffer) {
      throw new BadRequestException(
        'Unable to read the uploaded resume file.',
      );
    }

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename =
      `employee-${employeeId}-${Date.now()}${extension}`;

    const filePath = path.join(
      this.uploadDirectory,
      filename,
    );

    fs.writeFileSync(
      filePath,
      file.buffer,
    );

    return {
      resumeOriginalName:
        file.originalname,
      resumePath: filePath,
    };
  }
}