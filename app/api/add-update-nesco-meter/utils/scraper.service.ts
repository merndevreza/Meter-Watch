import { load, CheerioAPI } from 'cheerio';
import type { Browser, Page } from 'puppeteer';
import { ScrapedData } from '@/types/scrape-type';
import { AppError, ErrorCode } from '@/lib/errors';
import { logger } from '@/lib/logger';
import {
  extractCustomerData,
  extractMonthlyConsumption,
  extractNotice,
  extractRechargeHistory,
} from '../utils/scraper.utils';

const NESCO_PORTAL_URL = 'https://customer.nesco.gov.bd/pre/panel';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Service for scraping NESCO portal data
 * Handles browser automation and data extraction
 */
export class ScraperService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Main method to scrape customer data
   */
  async scrapeCustomerData(consumerNumber: string): Promise<ScrapedData> {
    try {
      // Initialize browser
      await this.initializeBrowser();

      // Navigate to portal
      await this.navigateToPortal();

      // Scrape recharge history page
      const rechargePageData = await this.scrapeRechargeHistoryPage(consumerNumber);

      // Scrape monthly consumption page
      const monthlyConsumption = await this.scrapeMonthlyConsumptionPage();

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
      throw this.handleScraperError(error);
    }
  }

  /**
   * Initialize Puppeteer browser
   */
  private async initializeBrowser(): Promise<void> {
    const puppeteer = await import('puppeteer');
    
    this.browser = await puppeteer.launch({
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

    this.page = await this.browser.newPage();
    
    // Set realistic user agent
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  /**
   * Navigate to NESCO portal with retry logic
   */
  private async navigateToPortal(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    await this.withRetry(async () => {
      await this.page!.goto(NESCO_PORTAL_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
    }, 'navigateToPortal');
  }

  /**
   * Scrape recharge history page
   */
  private async scrapeRechargeHistoryPage(consumerNumber: string) {
    if (!this.page) throw new Error('Page not initialized');

    try {
      // Wait for consumer number input
      await this.page.waitForSelector('#cust_no', {
        visible: true,
        timeout: 10000,
      });

      // Type consumer number
      await this.page.type('#cust_no', consumerNumber);

      // Click recharge history button
      await this.page.click('#recharge_hist_button');

      // Wait for response
      await this.page.waitForFunction(
        () => {
          const conInfo = document.querySelector('#con_info_div');
          const errorMsg = document.querySelector('.alert-danger');
          return conInfo !== null || errorMsg !== null;
        },
        { timeout: 15000 }
      );

      // Check if consumer info exists
      const conInfoExists = await this.page.$('#con_info_div');
      if (!conInfoExists) {
        throw new AppError(
          ErrorCode.CONSUMER_NOT_FOUND,
          'Invalid consumer number or meter not found',
          404
        );
      }

      // Wait for table to load
      await this.page.waitForSelector('.table-responsive', {
        visible: true,
        timeout: 30000,
      });

      // Wait for table to have data
      await this.page.waitForFunction(
        () => {
          const table = document.querySelector('.table tbody');
          return table && table.querySelectorAll('tr').length > 0;
        },
        { timeout: 10000 }
      );

      // Extract page content
      const content = await this.page.content();
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
  private async scrapeMonthlyConsumptionPage() {
    if (!this.page) throw new Error('Page not initialized');

    try {
      // Click monthly consumption button and wait for navigation
      await Promise.all([
        this.page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 30000,
        }),
        this.page.click('#consumption_hist_button'),
      ]);

      // Wait for consumption table
      await this.page.waitForSelector('.table.bfont_post', {
        visible: true,
        timeout: 30000,
      });

      // Wait for table to have data
      await this.page.waitForFunction(
        () => {
          const table = document.querySelector('.table.bfont_post tbody');
          return table && table.querySelectorAll('tr').length > 0;
        },
        { timeout: 10000 }
      );

      // Extract page content
      const content = await this.page.content();
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
   * Retry wrapper for network operations
   */
  private async withRetry<T>(
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
  private handleScraperError(error: unknown): AppError {
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
   * Cleanup browser resources
   */
  async cleanup(): Promise<void> {
    if (this.page) {
      try {
        await this.page.close();
      } catch (error) {
        logger.warn('Error closing page', {
          error: error instanceof Error ? error.message : 'Unknown',
        });
      }
      this.page = null;
    }

    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        logger.warn('Error closing browser', {
          error: error instanceof Error ? error.message : 'Unknown',
        });
      }
      this.browser = null;
    }
  }
}
