import { CheerioAPI } from 'cheerio';
import { CustomerData, RechargeRecord, MonthlyConsumption, ArrearNotice } from '@/types/scrape-type';
// Unescapes HTML entities in a string
function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export function extractCustomerData($: CheerioAPI): CustomerData {
  const inputValues = $('.card-body .form-horizontal input[disabled]')
    .map((_: number, el: any) => {
      const value = $(el).val();
      return (typeof value === 'string' ? value : '')?.trim().replace(/\s+/g, ' ') || '';
    })
    .get();

  if (inputValues.length < 10) {
    throw new Error('Incomplete customer data - customer number may be invalid');
  }

  return {
    customerName: unescapeHtml(inputValues[0]),
    fatherHusbandName: unescapeHtml(inputValues[1]),
    address: unescapeHtml(inputValues[2]),
    mobile: unescapeHtml(inputValues[3]),
    electricityOffice: unescapeHtml(inputValues[4]),
    feederName: unescapeHtml(inputValues[5]),
    consumerNumber: unescapeHtml(inputValues[6]),
    meterNumber: unescapeHtml(inputValues[7]),
    sanctionedLoadKw: unescapeHtml(inputValues[8]),
    tariff: unescapeHtml(inputValues[9]),
    meterType: inputValues[10] ? unescapeHtml(inputValues[10]) : '',
    meterStatus: inputValues[11] ? unescapeHtml(inputValues[11]) : '',
    meterInstallationDate: inputValues[12] ? unescapeHtml(inputValues[12]) : '',
    minimumRechargeAmount: inputValues[13] ? Number(unescapeHtml(inputValues[13])) : 0,
    remainingBalance: inputValues[14] ? Number(unescapeHtml(inputValues[14])) : 0,
  };
}

export function extractRechargeHistory($: CheerioAPI): RechargeRecord[] {
  return $('.table tbody tr')
    .map((_: number, row: any) => {
      const tds = $(row).find('td');

      if (tds.length < 15) return null;

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
    .filter((record: RechargeRecord | null): record is RechargeRecord => record !== null);
}

export function extractMonthlyConsumption($: CheerioAPI): MonthlyConsumption[] {
  // Target the table with monthly consumption data
  const rows = $('.table.bfont_post tbody tr');

  return rows
    .map((_: number, row: any) => {
      const tds = $(row).find('td');

      // Should have 13 columns based on the HTML
      if (tds.length < 13) return null;

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
    .filter((record: MonthlyConsumption | null): record is MonthlyConsumption => record !== null);
}

export function extractNotice($: CheerioAPI): ArrearNotice {
  const noticeDiv = $('#arrear_notice_div');

  // Check if notice div exists and is visible
  if (!noticeDiv.length || noticeDiv.css('display') === 'none') {
    return {
      hasNotice: false,
      noticeMessage: null
    };
  }

  try {
    // Get the label text which contains the notice message
    const noticeLabel = noticeDiv.find('label.control-label');
    const noticeText = noticeLabel.text();

    // Get the full message text and clean it up
    const noticeMessage = noticeText
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n'); // Clean up excessive newlines

    console.log("noticeMessage", noticeMessage);

    return {
      hasNotice: true,
      noticeMessage
    };
  } catch (error) {
    console.error('Error extracting notice:', error);
    return {
      hasNotice: false,
      noticeMessage: null
    };
  }
}