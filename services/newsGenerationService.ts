import { ActiveEvent } from '../types';

// This file simulates a text-generation neural network using templates and vocabulary pools,
// designed to mimic the style of financial news outlets.

const VOCABULARY = {
    headlines: {
        positive: ["Surges After Announcing", "Rallies on News of", "Poised for Growth Following", "Jumps as Market Cheers", "Announces Groundbreaking"],
        negative: ["Plummets Amid Fears of", "Tumbles After Revealing", "Faces Headwinds Due to", "Stock Drops on Concern Over", "Issues Warning Regarding"],
        split: ["Announces Stock Split to", "Moves to Increase Liquidity with", "Approves Share Split Following"],
    },
    openers: {
        positive: ["In a significant move that buoyed investor confidence,", "Shares of {company} saw a dramatic uptick today following the announcement of", "The market responded with enthusiasm to news from {company} regarding"],
        negative: ["A shadow was cast over the markets today as {company} confirmed troubling reports of", "{company} is facing a challenging period ahead after it revealed", "Investor sentiment soured for {company} following the release of news concerning"],
    },
    details: {
        positive: ["This development is seen by many as a validation of the company's strategic direction.", "The announcement is expected to solidify its market position.", "Experts believe this could be a major catalyst for future earnings."],
        negative: ["The full financial impact of this event remains to be seen, but early indicators are concerning.", "This raises serious questions about the company's internal controls and risk management.", "The company's leadership is now under pressure to formulate a response to mitigate the damage."],
    },
    analyst_titles: [ "a senior market analyst at OmniCap", "a technology sector expert from Innovest", "a lead researcher at Capital Insights", "a veteran strategist with MacroView Analytics", "an industry watchdog from SectorPulse"],
    analyst_quotes: {
        positive: ['"This is a clear and decisive move by {company}. It demonstrates their ability to innovate and adapt," commented {analyst}. "We\'re seeing a fundamental strength here that could set a new benchmark for the industry."', '"The market has been waiting for a positive signal, and this is it. We are upgrading our rating based on this news," stated {analyst}.'],
        negative: ['"The situation is still developing, but this is certainly a headwind for {company}," stated {analyst}. "The key question now is how they will respond and whether they can mitigate the fallout. We advise a cautious approach for now."', '"This was an unforced error, and it\'s going to take time to rebuild trust," said {analyst}. "Shareholders will be looking for accountability."'],
    },
    market_context: ["This news comes amid a period of heightened volatility in the {sector} sector.", "The development is particularly noteworthy given the current macroeconomic climate.", "In a market hungry for direction, this event has provided a clear focal point for traders."],
    outlooks: {
        positive: ["Looking ahead, the company is well-positioned for future growth.", "Analysts will be watching closely to see if this momentum can be sustained.", "This move could pave the way for further innovation and market capture."],
        negative: ["The company faces a challenging road to recovery.", "The full repercussions of this development may not be clear for several quarters.", "This event will likely be a drag on performance for the foreseeable future."],
    }
};

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const getCompanyName = (event: ActiveEvent) => event.stockName || 'The Market';
const getSectorName = (event: ActiveEvent) => event.stockSymbol ? `${event.stockName?.split(' ')[1] || 'Corporate'}` : 'Global Markets';

const generateHeadline = (event: ActiveEvent): string => {
    const company = getCompanyName(event);
    switch (event.type) {
        case 'positive':
            return `${company} ${pick(VOCABULARY.headlines.positive)} ${event.eventName}`;
        case 'negative':
            return `${company} ${pick(VOCABULARY.headlines.negative)} ${event.eventName}`;
        case 'split':
             return `${company} ${pick(VOCABULARY.headlines.split)} ${event.splitDetails?.ratio}-for-1 Split`;
        default:
            return event.eventName;
    }
}

const generateFullText = (event: ActiveEvent): string => {
    const company = getCompanyName(event);
    const sector = getSectorName(event);

    let opener: string;
    let detail: string;
    let quote: string;
    let outlook: string;

    if (event.type === 'positive' || event.type === 'split') {
        opener = pick(VOCABULARY.openers.positive).replace('{company}', company);
        detail = pick(VOCABULARY.details.positive);
        quote = pick(VOCABULARY.analyst_quotes.positive).replace('{company}', company).replace('{analyst}', pick(VOCABULARY.analyst_titles));
        outlook = pick(VOCABULARY.outlooks.positive);
    } else {
        opener = pick(VOCABULARY.openers.negative).replace('{company}', company);
        detail = pick(VOCABULARY.details.negative);
        quote = pick(VOCABULARY.analyst_quotes.negative).replace('{company}', company).replace('{analyst}', pick(VOCABULARY.analyst_titles));
        outlook = pick(VOCABULARY.outlooks.negative);
    }
    
    const context = pick(VOCABULARY.market_context).replace('{sector}', sector);

    return [
        `${opener} ${event.description}.`,
        detail,
        context,
        quote,
        outlook
    ].join('\n\n');
}


/**
 * Simulates a "neural network" for news generation by assembling an article
 * from pre-defined templates and vocabulary pools, tailored to the event.
 * Returns a complete article object with headline, summary, and full text.
 */
export const generateNewsArticle = (event: ActiveEvent): { headline: string; summary: string; fullText: string } => {
    const headline = generateHeadline(event);
    const fullText = generateFullText(event);
    // Use the raw description as the summary for card views
    const summary = event.description;

    return { headline, summary, fullText };
};