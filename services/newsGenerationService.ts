import { ActiveEvent } from '../types';

// This file simulates a text-generation neural network using templates and vocabulary pools,
// designed to mimic the style of financial news outlets.

const VOCABULARY = {
    headlines: {
        positive: ["Surges After Announcing", "Rallies on News of", "Poised for Growth Following", "Jumps as Market Cheers", "Announces Groundbreaking", "Gets a Boost from", "Shares Climb as Unveils", "Stock Soars on Positive Outlook", "Gains Momentum with"],
        negative: ["Plummets Amid Fears of", "Tumbles After Revealing", "Faces Headwinds Due to", "Stock Drops on Concern Over", "Issues Warning Regarding", "Braces for Impact of", "Investors Anxious as Faces", "Uncertainty Looms Over Following", "Under Pressure Amid"],
        split: ["Announces Stock Split to", "Moves to Increase Liquidity with", "Approves Share Split Following"],
    },
    openers: {
        positive: ["In a significant move that buoyed investor confidence,", "Shares of {company} saw a dramatic uptick today following the announcement of", "The market responded with enthusiasm to news from {company} regarding", "A wave of optimism swept through the markets today after the confirmation of", "{company} captured the market's attention on Tuesday with news of"],
        negative: ["A shadow was cast over the markets today as {company} confirmed troubling reports of", "{company} is facing a challenging period ahead after it revealed", "Investor sentiment soured for {company} following the release of news concerning", "Global markets are on edge following the breaking news of", "An air of uncertainty surrounds {company} today, as the firm grapples with"],
    },
    details: {
        positive: ["This development is seen by many as a validation of the company's strategic direction.", "The announcement is expected to solidify its market position and create new revenue streams.", "Experts believe this could be a major catalyst for future earnings, pending successful execution.", "The move is widely interpreted as a proactive step to address market demands and stay ahead of the competition."],
        negative: ["The full financial impact of this event remains to be seen, but early indicators are concerning.", "This raises serious questions about the company's internal controls and risk management protocols.", "The company's leadership is now under intense pressure to formulate a response and mitigate the damage.", "The ripple effects of this event could be felt across the economy for months to come, impacting supply chains and consumer confidence."],
    },
    analyst_titles: [ "a senior market analyst at OmniCap", "a technology sector expert from Innovest", "a lead researcher at Capital Insights", "a veteran strategist with MacroView Analytics", "an industry watchdog from SectorPulse", "a geopolitical risk consultant from Strata-G"],
    analyst_quotes: {
        positive: ['"This is a clear and decisive move by {company}. It demonstrates their ability to innovate and adapt in a rapidly changing landscape," commented {analyst}. "We\'re seeing a fundamental strength here that could set a new benchmark for the industry."', '"The market has been waiting for a positive signal, and this is it. We are upgrading our rating to \'Buy\' based on this news," stated {analyst}.', '"This political development is exactly the kind of catalyst the markets needed to break out of their recent slump," explained {analyst}. "It removes a significant layer of uncertainty."'],
        negative: ['"The situation is still developing, but this is certainly a major headwind for {company}," stated {analyst}. "The key question now is how leadership will respond and whether they can restore confidence. We advise a cautious \'Hold\' for now."', '"This was an unforced error, and it\'s going to take significant time and resources to rebuild trust with both consumers and investors," said {analyst}.', '"Geopolitical instability or natural disasters of this scale introduce a level of uncertainty that markets simply hate," said {analyst}. "Expect increased volatility as the situation unfolds, with safe-haven assets likely outperforming."'],
    },
    market_context: ["This news comes amid a period of heightened volatility in the {sector} sector.", "The development is particularly noteworthy given the current macroeconomic climate of rising inflation.", "In a market hungry for direction, this event has provided a clear focal point for traders and algorithms alike.", "The event serves as a stark reminder of how interconnected global markets and geopolitical events are in the modern economy."],
    outlooks: {
        positive: ["Looking ahead, the company appears well-positioned to capitalize on this momentum.", "Analysts will be watching the next earnings call closely to see if this development translates to the bottom line.", "This move could pave the way for further innovation and market share capture in the coming quarters."],
        negative: ["The company faces a challenging road to recovery, with several quarters of uncertainty likely ahead.", "The full repercussions of this development may not be clear for some time, as secondary effects are still being assessed.", "This event will likely be a drag on performance for the foreseeable future, potentially impacting their next earnings report.", "The long-term economic consequences are still being calculated, but the short-term outlook appears grim for the affected regions and sectors."],
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
    const articleParts = [];

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
    
    articleParts.push(`${opener} ${event.description}.`);
    articleParts.push(detail);

    const context = pick(VOCABULARY.market_context).replace('{sector}', sector);
    articleParts.push(context);

    // Occasionally skip the analyst quote for variety
    if (Math.random() > 0.15) {
        articleParts.push(quote);
    }

    articleParts.push(outlook);

    return articleParts.join('\n\n');
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