import { NextResponse } from 'next/server';
import { load } from 'cheerio';
import { auth } from '@/auth';
import { ScrapedData } from '@/types/scrape-type';
import connectMongo from '@/database/services/connectMongo';
import { extractCustomerData, extractMonthlyConsumption, extractNotice, extractRechargeHistory } from './utils/scraper.utils';
import { saveCustomerData, saveMonthlyConsumption, saveRechargeHistory } from './utils/database.utils';
import { handleScrapingError } from './utils/error-handler.utils';

/**
 * This API scrapes customer information, recharge history, and monthly consumption
 * from the NESCO (Northern Electricity Supply Company Limited) prepaid customer portal
 * and stores it in MongoDB.
 */

export async function POST(request: Request) {
  let browser;

  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please login first.', status: 401 },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    const body = await request.json();
    const { consumerNumber, meterName } = body;

    if (!consumerNumber || typeof consumerNumber !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid customerNumber or meterName.', status: 400 },
        { status: 400 }
      );
    }

    // 3. Launch headless browser for scraping
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // 4. Navigate to NESCO portal
    const url = 'https://customer.nesco.gov.bd/pre/panel';

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // 5. Fill in customer number and submit for RECHARGE HISTORY
    await page.waitForSelector('#cust_no', { visible: true, timeout: 10000 });
    await page.type('#cust_no', consumerNumber);
    await page.click('#recharge_hist_button');

    // Wait a bit for the page to respond
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Check if consumer info div exists (indicates valid consumer number)
    const conInfoExists = await page.$('#con_info_div');

    if (!conInfoExists) {
      return NextResponse.json(
        { success: false, message: 'Invalid consumer number or meter not found.', status: 404 },
        { status: 404 }
      );
    }

    // Wait for the table to be visible after validation
    await page.waitForSelector('.table-responsive', { timeout: 30000 });

    // Small delay to ensure content is fully loaded
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 7. Extract recharge history page content
    const rechargeContent = await page.content();
    const $recharge = load(rechargeContent);

    // 9. Extract customer data and recharge history
    const customer = extractCustomerData($recharge);
    const rechargeHistory = extractRechargeHistory($recharge);
    const notice = extractNotice($recharge);

    // 10. Click Monthly Consumption button and wait for page reload
    try {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle2', // Wait until network is idle
          timeout: 30000
        }),
        page.click('#consumption_hist_button')
      ]); 
    } catch (error) {
      console.error('Navigation error:', error);
      throw new Error('Failed to load monthly consumption page');
    }

    // 11. Wait for the monthly consumption table to be fully loaded
    await page.waitForSelector('.table.bfont_post', {
      visible: true,
      timeout: 30000
    });

    // Extra safety: Wait for table to have data
    await page.waitForFunction(
      () => {
        const table = document.querySelector('.table.bfont_post tbody');
        return table && table.querySelectorAll('tr').length > 0;
      },
      { timeout: 10000 }
    );

    // Small delay to ensure all content is rendered
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 12. Extract monthly consumption page content
    const consumptionContent = await page.content();
    const $consumption = load(consumptionContent);

    // 13. Extract monthly consumption data
    const monthlyConsumption = extractMonthlyConsumption($consumption);

    // 14. Connect to MongoDB and save all data
    await connectMongo();

    // Save customer data
    await saveCustomerData(
      customer,
      session.user.id,
      meterName,
      notice
    );

    // Save recharge history
    const historyResult = await saveRechargeHistory(
      rechargeHistory,
      customer.consumerNumber,
      session.user.id
    );

    // Save monthly consumption
    const consumptionResult = await saveMonthlyConsumption(
      monthlyConsumption,
      customer.consumerNumber,
      session.user.id
    );

    // 14. Prepare response
    const result: ScrapedData = {
      customer,
      rechargeHistory,
      monthlyConsumption,
      notice
    };

    return NextResponse.json({
      success: true,
      message: 'Customer data scraped and saved successfully',
      status: 200,
      data: result,
      saved: {
        customer: true,
        newRecharges: historyResult.saved,
        duplicateRecharges: historyResult.skipped,
        newConsumption: consumptionResult.saved,
        updatedConsumption: consumptionResult.skipped,
      },
    }, { status: 200 });

  } catch (error) {
    return handleScrapingError(error);
  } finally {
    if (browser) {
      await browser.close(); 
    }
  }
}