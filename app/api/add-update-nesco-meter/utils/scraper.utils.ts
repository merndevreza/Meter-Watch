import { CheerioAPI } from 'cheerio';
import { decode } from 'he';
import { 
  ScrapedCustomerData, 
  ScrapedRechargeRecord, 
  ScrapedMonthlyConsumption, 
  ArrearNotice 
} from '@/types';
import { AppError, ErrorCode } from '@/lib/errors';

// Constants for validation
const REQUIRED_CUSTOMER_FIELDS = 15;
const REQUIRED_RECHARGE_FIELDS = 15;
const REQUIRED_CONSUMPTION_FIELDS = 13;

/**
 * Safely decode HTML entities
 */
function decodeHtml(str: string): string {
  if (!str) return '';
  return decode(str).trim().replace(/\s+/g, ' ');
}

/**
 * Safely parse number from string
 */
function parseNumber(str: string): number {
  const cleaned = str.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Extract customer data from the page
 */
export function extractCustomerData($: CheerioAPI): ScrapedCustomerData {
  try {
    const inputValues = $('.card-body .form-horizontal input[disabled]')
      .map((_: number, el: any) => {
        const value = $(el).val();
        return decodeHtml(typeof value === 'string' ? value : '');
      })
      .get();

    if (inputValues.length < REQUIRED_CUSTOMER_FIELDS) {
      throw new AppError(
        ErrorCode.INCOMPLETE_DATA,
        `Expected at least ${REQUIRED_CUSTOMER_FIELDS} customer fields, got ${inputValues.length}`,
        422
      );
    }

    return {
      customerName: inputValues[0] || '',
      fatherHusbandName: inputValues[1] || '',
      address: inputValues[2] || '',
      mobile: inputValues[3] || '',
      electricityOffice: inputValues[4] || '',
      feederName: inputValues[5] || '',
      consumerNumber: inputValues[6] || '',
      meterNumber: inputValues[7] || '',
      sanctionedLoadKw: inputValues[8] || '',
      tariff: inputValues[9] || '',
      meterType: inputValues[10] || '',
      meterStatus: inputValues[11] || '',
      meterInstallationDate: inputValues[12] || '',
      minimumRechargeAmount: inputValues[13] ? parseNumber(inputValues[13]) : 0,
      remainingBalance: inputValues[14] ? parseNumber(inputValues[14]) : 0,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    
    throw new AppError(
      ErrorCode.EXTRACTION_FAILED,
      'Failed to extract customer data',
      500
    );
  }
}

/**
 * Extract recharge history records from the table
 */
export function extractRechargeHistory($: CheerioAPI): ScrapedRechargeRecord[] {
  try {
    const records = $('.table tbody tr')
      .map((_: number, row: any) => {
        const tds = $(row).find('td');

        if (tds.length < REQUIRED_RECHARGE_FIELDS) {
          return null;
        }

        return {
          serialNo: tds.eq(0).text().trim(),
          token: tds.eq(2).find('a').text().trim(),
          meterRent: tds.eq(3).text().trim(),
          demandCharge: tds.eq(4).text().trim(),
          pfcCharge: tds.eq(5).text().trim(),
          vat: tds.eq(6).text().trim(),
          paidDebtFine: tds.eq(7).text().trim(),
          rebate: tds.eq(8).text().trim(),
          electricityAmount: tds.eq(9).text().trim(),
          rechargeAmount: tds.eq(10).text().trim(),
          estimatedEnergyKwh: tds.eq(11).text().trim(),
          rechargeMethod: tds.eq(12).text().trim(),
          rechargeDate: tds.eq(13).text().trim(),
          remoteRechargeStatus: tds.eq(14).text().trim(),
        };
      })
      .get()
      .filter((record: ScrapedRechargeRecord | null): record is ScrapedRechargeRecord => 
        record !== null && record.token !== ''
      );

    return records;
  } catch (error) {
    throw new AppError(
      ErrorCode.EXTRACTION_FAILED,
      'Failed to extract recharge history',
      500
    );
  }
}

/**
 * Extract monthly consumption records from the table
 */
export function extractMonthlyConsumption($: CheerioAPI): ScrapedMonthlyConsumption[] {
  try {
    const rows = $('.table.bfont_post tbody tr');

    const records = rows
      .map((_: number, row: any) => {
        const tds = $(row).find('td');

        if (tds.length < REQUIRED_CONSUMPTION_FIELDS) {
          return null;
        }

        return {
          year: tds.eq(0).text().trim(),
          month: tds.eq(1).text().trim(),
          totalRecharge: tds.eq(2).text().trim(),
          rebate: tds.eq(3).text().trim(),
          energyUsage: tds.eq(4).text().trim(),
          meterRent: tds.eq(5).text().trim(),
          demandCharge: tds.eq(6).text().trim(),
          pfcCharge: tds.eq(7).text().trim(),
          paidDebt: tds.eq(8).text().trim(),
          vat: tds.eq(9).text().trim(),
          totalUsageDeduction: tds.eq(10).text().trim(),
          monthEndMeterBalance: tds.eq(11).text().trim(),
          energyUsageKwh: tds.eq(12).text().trim(),
        };
      })
      .get()
      .filter((record: ScrapedMonthlyConsumption | null): record is ScrapedMonthlyConsumption => 
        record !== null && record.year !== '' && record.month !== ''
      );

    return records;
  } catch (error) {
    throw new AppError(
      ErrorCode.EXTRACTION_FAILED,
      'Failed to extract monthly consumption',
      500
    );
  }
}

/**
 * Extract arrear notice information
 */
export function extractNotice($: CheerioAPI): ArrearNotice {
  try {
    const noticeDiv = $('#arrear_notice_div');

    // Check if notice div exists and is visible
    if (!noticeDiv.length || noticeDiv.css('display') === 'none') {
      return {
        hasNotice: false,
        noticeMessage: null,
      };
    }

    // Get the notice message
    const noticeLabel = noticeDiv.find('label.control-label');
    const rawNoticeText = noticeLabel.text();

    // Clean up the notice message
    const noticeMessage = rawNoticeText
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n');

    return {
      hasNotice: !!noticeMessage,
      noticeMessage: noticeMessage || null,
    };
  } catch (error) {
    // If notice extraction fails, just return no notice
    return {
      hasNotice: false,
      noticeMessage: null,
    };
  }
}