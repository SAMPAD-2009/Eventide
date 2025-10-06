
import { runScraper } from '@/lib/scraper';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
  try {
    console.log("Starting scraper via API route...");
    const result = await runScraper();

    if (result.success) {
      console.log("Scraper finished successfully.");
      return NextResponse.json(result);
    } else {
      console.error("Scraper failed:", result.error);
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('Internal server error in API route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
