// In app/api/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  // Get the URL from the query parameters
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const getMetaTag = (name: string) =>
      $(`meta[property="og:${name}"]`).attr('content') || $(`meta[name="${name}"]`).attr('content');

    let favicon = $('link[rel="shortcut icon"]').attr('href') || $('link[rel="icon"]').attr('href');
    if (favicon && !favicon.startsWith('http')) {
      const urlObject = new URL(url);
      favicon = `${urlObject.protocol}//${urlObject.hostname}${favicon}`;
    }

    const metadata = {
      title: getMetaTag('title') || $('title').first().text(),
      description: getMetaTag('description'),
      image: getMetaTag('image'),
      favicon: favicon,
      url: url,
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json({ error: `Failed to scrape URL: ${url}` }, { status: 500 });
  }
}