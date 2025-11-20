import { TimerData } from '@/services/websocket';
import * as XLSX from 'xlsx';

/**
 * Escapes CSV values by wrapping in quotes and escaping internal quotes
 */
const escapeCSVValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  // Wrap in quotes if contains comma, quotes, or newlines
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Converts seconds to HH:MM:SS format
 */
const formatSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Converts an array of timers to CSV format
 */
export const timersToCSV = (timers: TimerData[]): string => {
  // Define CSV headers
  const headers = [
    'ID',
    'Title',
    'Speaker',
    'Notes',
    'Type',
    'Duration (HH:MM:SS)',
    'Manual Start',
    'Scheduled Date',
    'Scheduled Time',
    'Created At',
  ];

  // Create header row
  const csvLines: string[] = [headers.map(escapeCSVValue).join(',')];

  // Add data rows
  timers.forEach((timer, index) => {
    const row = [
      index,
      timer.title,
      timer.speaker || '',
      timer.notes || '',
      timer.timer_type,
      timer.duration_seconds ? formatSeconds(timer.duration_seconds) : '',
      timer.is_manual_start ? 'Yes' : 'No',
      timer.scheduled_start_date || '',
      timer.scheduled_start_time || '',
      new Date(timer.created_at).toLocaleString(),
    ];

    csvLines.push(row.map(escapeCSVValue).join(','));
  });

  return csvLines.join('\n');
};

/**
 * Triggers a CSV download with the provided content
 */
export const downloadCSV = (csvContent: string, filename: string = 'timers.csv'): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports timers as a CSV file download
 */
export const exportTimersAsCSV = (timers: TimerData[], roomName?: string): void => {
  const csvContent = timersToCSV(timers);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = roomName
    ? `timers-${roomName.replace(/\s+/g, '-')}-${timestamp}.csv`
    : `timers-${timestamp}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Converts timers to Excel workbook format
 */
export const timersToExcel = (timers: TimerData[]): XLSX.WorkBook => {
  // Define headers
  const headers = [
    'ID',
    'Title',
    'Speaker',
    'Notes',
    'Type',
    'Duration (HH:MM:SS)',
    'Manual Start',
    'Scheduled Date',
    'Scheduled Time',
    'Created At',
  ];

  // Create data rows
  const data: (string | number)[][] = [headers];

  timers.forEach((timer, index) => {
    const row = [
      index,
      timer.title,
      timer.speaker || '',
      timer.notes || '',
      timer.timer_type,
      timer.duration_seconds ? formatSeconds(timer.duration_seconds) : '',
      timer.is_manual_start ? 'Yes' : 'No',
      timer.scheduled_start_date || '',
      timer.scheduled_start_time || '',
      new Date(timer.created_at).toLocaleString(),
    ];
    data.push(row);
  });

  // Create workbook
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Timers');

  return wb;
};

/**
 * Exports timers as an Excel file download
 */
export const exportTimersAsExcel = (timers: TimerData[], roomName?: string): void => {
  const workbook = timersToExcel(timers);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = roomName
    ? `timers-${roomName.replace(/\s+/g, '-')}-${timestamp}.xlsx`
    : `timers-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, filename);
};
