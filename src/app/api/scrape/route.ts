
import { runScraper } from '@/lib/scraper';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures the route is not statically cached

export async function GET() {
  // Secure this endpoint if necessary, e.g., with a secret token
  console.log('Scrape API route triggered.');
  try {
    const result = await runScraper();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in scraper API route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
