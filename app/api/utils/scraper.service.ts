import { load } from 'cheerio';
import type { Browser, Page } from 'puppeteer';
import { ScrapedData } from '@/types';
import { AppError, ErrorCode } from '@/lib/errors';
import { logger } from '@/lib/logger';
import {
  extractCustomerData,
  extractMonthlyConsumption,
  extractNotice,
  extractRechargeHistory,
} from './scraper.utils';

const NESCO_PORTAL_URL = 'https://customer.nesco.gov.bd/pre/panel';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const NAVIGATION_TIMEOUT = 20000; // 20 seconds per attempt
const SELECTOR_TIMEOUT = 8000; // 8 seconds for selector waits

/**
 * Retry wrapper for network operations
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  context: string,
  maxRetries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      logger.warn(`Retry attempt ${attempt}/${maxRetries}`, {
        context,
        error: lastError.message,
      });

      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, RETRY_DELAY * attempt)
        );
      }
    }
  }

  throw lastError || new Error(`Failed after ${maxRetries} retries`);
}

/**
 * Handle scraper errors and convert to AppError
 */
function handleScraperError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Unknown error';

  // Timeout errors
  if (message.includes('timeout') || message.includes('waiting')) {
    return new AppError(
      ErrorCode.TIMEOUT,
      'Request timeout. NESCO portal may be slow',
      504
    );
  }

  // Navigation/network errors
  if (message.includes('Navigation') || message.includes('net::')) {
    return new AppError(
      ErrorCode.NETWORK_ERROR,
      'Unable to connect to NESCO portal',
      503
    );
  }

  // Generic scraping error
  return new AppError(
    ErrorCode.SCRAPING_FAILED,
    'Failed to scrape data from NESCO portal',
    500
  );
}

/**
 * Initialize Puppeteer browser
 * Uses Browserless.io for serverless/Vercel environments
 * Falls back to local Chrome for development
 */
async function initializeBrowser(): Promise<{ browser: Browser; page: Page }> {
  const puppeteer = await import('puppeteer');
  
  // Detect if running on Vercel or using Browserless
  const isVercel = !!process.env.VERCEL;
  const browserlessToken = process.env.BROWSERLESS_TOKEN;
  console.log("browserlessToken check", browserlessToken);
  
  let browser: Browser;
  
  if (isVercel || browserlessToken) {
    // Use Browserless.io on Vercel or when token is configured
    if (!browserlessToken) {
      logger.error('BROWSERLESS_TOKEN not set but running on Vercel');
      throw new AppError(
        ErrorCode.SCRAPING_FAILED,
        'Browserless.io token not configured',
        500
      );
    }
    
    try {
      logger.info('Connecting to Browserless.io');
      browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${browserlessToken}`,
      });
      logger.info('Connected to Browserless.io');
    } catch (error) {
      logger.error('Failed to connect to Browserless.io', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AppError(
        ErrorCode.SCRAPING_FAILED,
        'Failed to connect to browser service',
        500
      );
    }
  } else {
    // Use local Chrome for development
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });
  }

  const page = await browser.newPage();
  
  // Set realistic user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Disable images to speed up page load
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });

  return { browser, page };
}

/**
 * Navigate to NESCO portal with retry logic
 */
async function navigateToPortal(page: Page): Promise<void> {
  await withRetry(async () => {
    await page.goto(NESCO_PORTAL_URL, {
      waitUntil: 'networkidle0',
      timeout: NAVIGATION_TIMEOUT,
    });
  }, 'navigateToPortal');
}

/**
 * Scrape recharge history page
 */
async function scrapeRechargeHistoryPage(page: Page, consumerNumber: string) {
  try {
    // Wait for consumer number input
    await page.waitForSelector('#cust_no', {
      visible: true,
      timeout: SELECTOR_TIMEOUT,
    });

    // Type consumer number
    await page.type('#cust_no', consumerNumber);

    // Click recharge history button
    await page.click('#recharge_hist_button');

    // Wait for response
    await page.waitForFunction(
      () => {
        const conInfo = document.querySelector('#con_info_div');
        const errorMsg = document.querySelector('.alert-danger');
        return conInfo !== null || errorMsg !== null;
      },
      { timeout: SELECTOR_TIMEOUT }
    );

    // Check if consumer info exists
    const conInfoExists = await page.$('#con_info_div');
    if (!conInfoExists) {
      throw new AppError(
        ErrorCode.CONSUMER_NOT_FOUND,
        'Invalid consumer number or meter not found',
        404
      );
    }

    // Wait for table to load
    await page.waitForSelector('.table-responsive', {
      visible: true,
      timeout: SELECTOR_TIMEOUT,
    });

    // Wait for table to have data
    await page.waitForFunction(
      () => {
        const table = document.querySelector('.table tbody');
        return table && table.querySelectorAll('tr').length > 0;
      },
      { timeout: SELECTOR_TIMEOUT }
    );

    // Extract page content
    const content = await page.content();
    const $ = load(content);

    // Extract data
    const customer = extractCustomerData($);
    const rechargeHistory = extractRechargeHistory($);
    const notice = extractNotice($);

    return { customer, rechargeHistory, notice };

  } catch (error) {
    if (error instanceof AppError) throw error;
    
    throw new AppError(
      ErrorCode.SCRAPING_FAILED,
      'Failed to scrape recharge history',
      500
    );
  }
}

/**
 * Scrape monthly consumption page
 */
async function scrapeMonthlyConsumptionPage(page: Page) {
  try {
    // Click monthly consumption button and wait for navigation
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: NAVIGATION_TIMEOUT,
      }),
      page.click('#consumption_hist_button'),
    ]);

    // Wait for consumption table
    await page.waitForSelector('.table.bfont_post', {
      visible: true,
      timeout: SELECTOR_TIMEOUT,
    });

    // Wait for table to have data
    await page.waitForFunction(
      () => {
        const table = document.querySelector('.table.bfont_post tbody');
        return table && table.querySelectorAll('tr').length > 0;
      },
      { timeout: SELECTOR_TIMEOUT }
    );

    // Extract page content
    const content = await page.content();
    const $ = load(content);

    // Extract monthly consumption data
    return extractMonthlyConsumption($);

  } catch (error) {
    throw new AppError(
      ErrorCode.SCRAPING_FAILED,
      'Failed to scrape monthly consumption',
      500
    );
  }
}

/**
 * Cleanup browser resources
 */
async function cleanupBrowser(browser: Browser | null, page: Page | null): Promise<void> {
  if (page) {
    try {
      await page.close();
    } catch (error) {
      logger.warn('Error closing page', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      logger.warn('Error closing browser', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

/**
 * Service factory for scraping NESCO portal data
 * Handles browser automation and data extraction
 * Returns an object with methods for scraping and cleanup
 */
export async function createScraperService() {
  let browser: Browser | null = null;
  let page: Page | null = null;

  return {
    /**
     * Main method to scrape customer data
     */
    async scrapeCustomerData(consumerNumber: string): Promise<ScrapedData> {
      try {
        // Initialize browser
        const initialized = await initializeBrowser();
        browser = initialized.browser;
        page = initialized.page;

        // Navigate to portal
        await navigateToPortal(page);

        // Scrape recharge history page
        const rechargePageData = await scrapeRechargeHistoryPage(page, consumerNumber);

        // Scrape monthly consumption page
        const monthlyConsumption = await scrapeMonthlyConsumptionPage(page);

        return {
          customer: rechargePageData.customer,
          rechargeHistory: rechargePageData.rechargeHistory,
          notice: rechargePageData.notice,
          monthlyConsumption,
        };
      } catch (error) {
        logger.error('Scraper service error', {
          error: error instanceof Error ? error.message : 'Unknown',
          consumerNumber,
        });
        throw handleScraperError(error);
      }
    },

    /**
     * Cleanup browser resources
     */
    async cleanup(): Promise<void> {
      await cleanupBrowser(browser, page);
      browser = null;
      page = null;
    },
  };
}
