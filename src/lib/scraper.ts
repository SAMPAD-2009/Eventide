
"use server";

import { createClient } from '@supabase/supabase-js';
import chrome from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

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

export async function runScraper() {
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const day = String(today.getDate());
    const url = `https://www.britannica.com/on-this-day/${monthName}-${day}`;
    console.log(`Scraping ${url}`);

    let browser;
    
    try {
        const executablePath = await chrome.executablePath;

        browser = await puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: executablePath || '/var/task/node_modules/puppeteer/.local-chromium/linux-1022525/chrome-linux/chrome',
            headless: chrome.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const allArticles = await page.evaluate(() => {
            const articles = document.querySelectorAll('.md-history-event, .featured-event-card');
            
            const titleElement = document.querySelector('.card-body > .title');
            if (titleElement) {
                titleElement.remove();
            }

            return Array.from(articles).map(article => {
                const img = article.querySelector<HTMLImageElement>('.card-media > img')?.src;
                const date = article.querySelector<HTMLElement>('.card-media > .date-label')?.textContent?.replace(/\s+/g, ' ').trim();
                const desc = article.querySelector<HTMLElement>('.card-body, .description')?.textContent?.replace(/\s+/g, ' ').trim();

                return { event_year: date, event_description: desc, event_picture: img };
            }).filter(article => article.event_year && article.event_description && article.event_picture);
        });
        
        console.log(`Found ${allArticles.length} articles.`);

        if (allArticles.length > 0) {
            const tableName = 'historical_events';

            const { error: deleteError } = await supabase
                .from(tableName)
                .delete()
                .gt('id', 0);

            if (deleteError) {
                console.error('Service Role Delete FAILED:', deleteError);
                throw new Error(`Supabase delete failed: ${deleteError.message}`);
            }
            console.log('Successfully deleted all old events.');
            
            let nextId = 1;
            const articlesWithId = allArticles.map((article: any) => ({
                id: nextId++, 
                ...article,
            }));

            const { data: insertedData, error: insertError } = await supabase
                .from(tableName)
                .insert(articlesWithId)
                .select();

            if (insertError) {
                console.error('Error inserting data:', insertError);
                throw new Error(`Supabase insert failed: ${insertError.message}`);
            }

            console.log('Successfully inserted data:', insertedData.length, 'rows');
            return { success: true, message: `Successfully scraped and inserted ${insertedData.length} events.` };
        } else {
             return { success: true, message: "No articles found to scrape." };
        }

    } catch (error: any) {
        console.error('Scraper failed:', error);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed.');
        }
    }
}
