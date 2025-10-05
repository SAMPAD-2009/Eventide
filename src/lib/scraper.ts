
'use server';

import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function runScraper() {
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${monthName}-${day}`;
    const url = `https://www.britannica.com/on-this-day/${formattedDate}`;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const allarticles = await page.evaluate(() => {
            const articles = document.querySelectorAll('.md-history-event, .featured-event-card');
            
            const titleElement = document.querySelector('.card-body > .title');
            if (titleElement) {
                titleElement.remove();
            }

            return Array.from(articles).map((article: Element) => {
                const imgElement = article.querySelector('.card-media > img') as HTMLImageElement;
                const img = imgElement ? imgElement.src : '';

                const dateElement = article.querySelector('.card-media > .date-label');
                const dateText = dateElement ? dateElement.textContent!.replace(/\s+/g, ' ').trim() : '';
                const year = dateText.match(/\d{4}/)?.[0] ?? dateText;


                const descElement = article.querySelector('.card-body, .description');
                const desc = descElement ? descElement.textContent!.replace(/\s+/g, ' ').trim() : '';

                return { event_year: year, event_description: desc, event_picture: img };
            }).filter(item => item.event_year && item.event_description);
        });

        if (allarticles.length > 0) {
            const { error: deleteError } = await supabase.from('historical_events').delete().gt('id', 0);
            if (deleteError) {
                throw new Error(`Supabase delete failed: ${deleteError.message}`);
            }

            const { error: insertError } = await supabase.from('historical_events').insert(allarticles);
            if (insertError) {
                throw new Error(`Supabase insert failed: ${insertError.message}`);
            }
             return { success: true, message: `Scraped and inserted ${allarticles.length} events.` };
        } else {
            return { success: false, message: 'No articles found to scrape.' };
        }

    } catch (error: any) {
        console.error('Scraper failed:', error);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
