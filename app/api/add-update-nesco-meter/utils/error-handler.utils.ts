import { NextResponse } from 'next/server';

export function handleScrapingError(error: unknown): NextResponse {
  console.error('Scraping error:', error);

  let errorMessage = 'Unknown error occurred';
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Timeout-related errors (common with Puppeteer waits/selectors)
  if (errorMessage.includes('timeout') || errorMessage.includes('waiting')) {
    return NextResponse.json(
      { success: false, message: 'Request timeout. NESCO portal may be slow.', status: 504 },
      { status: 504 }
    );
  }

  // Navigation / network errors
  if (errorMessage.includes('Navigation') || errorMessage.includes('net::')) {
    return NextResponse.json(
      { success: false, message: 'Unable to connect to NESCO portal.', status: 503 },
      { status: 503 }
    );
  }

  // Specific data extraction issue
  if (errorMessage.includes('Incomplete customer data')) {
    return NextResponse.json(
      { success: false, message: 'Invalid customer number or incomplete data.', status: 404 },
      { status: 404 }
    );
  }

  // Database-related errors
  if (errorMessage.includes('mongo') || errorMessage.includes('database')) {
    return NextResponse.json(
      { success: false, message: 'Database error. Please try again.', status: 500 },
      { status: 500 }
    );
  }

  // Generic fallback
  return NextResponse.json(
    { success: false, message: `Failed to scrape data: ${errorMessage}`, status: 500 },
    { status: 500 }
  );
}