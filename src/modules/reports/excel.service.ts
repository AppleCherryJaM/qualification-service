/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelService {
  /**
   * Генерация Excel-файла из массива объектов
   */
  generateExcel<T extends Record<string, any>>(
    data: T[],
    sheetName: string = 'Report',
    headers?: Record<string, string>, // маппинг полей на русские заголовки
  ): Buffer {
    const processedData = headers
      ? data.map((item) => {
          const row: Record<string, any> = {};
          for (const [key, label] of Object.entries(headers)) {
            row[label] = item[key] ?? '-';
          }
          return row;
        })
      : data;

    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Автоширина колонок
    if (processedData.length > 0) {
      const colWidths = Object.keys(processedData[0]).map((key) => ({
        wch: Math.min(Math.max(key.length, 10), 50),
      }));
      worksheet['!cols'] = colWidths;
    }

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
