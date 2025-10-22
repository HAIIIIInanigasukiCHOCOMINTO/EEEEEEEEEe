// This file simulates a neural network for image generation, trained on financial news.
// It uses a knowledge base of keyword-to-icon/theme mappings to generate a relevant
// and aesthetically pleasing SVG image for each news event.

// --- Icon Library (Simulated Visual Knowledge Base) ---
const ICONS: Record<string, string> = {
    'Technology': `<path d="M13 10V3L4 14h7v7l9-11h-7z" />`, // lightning bolt
    'Health': `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />`, // layers/molecule
    'Energy': `<path d="M12 3v1m0 16v1m8.66-12.66l-.7.7M4.04 19.96l-.7.7M21 12h-1M4 12H3m16.66 4.34l-.7-.7M5.04 5.04l-.7-.7" /><circle cx="12" cy="12" r="5" />`, // sun
    'Finance': `<path d="M2 12h2M6 6l1.5 1.5M14.5 9.5L16 8M18 12h2M12 2v2M12 18v2M9.5 14.5L8 16M16 14.5l-1.5 1.5" /><circle cx="12" cy="12" r="8" />`, // abstract/chart
    'Industrials': `<path d="M19 12l-7 7-7-7" /><path d="M19 5l-7 7-7-7" />`, // arrows/logistics
    'split': `<path d="M12 19l7-7-7-7" /><path d="M5 12h14" />`, // arrow right
    'positive': `<path d="M5 12h14" /><path d="M12 5l7 7-7 7" />`, // arrow right
    'negative': `<path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />`, // arrow left
    'macro': `<path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M3.6 9h16.8" /><path d="M3.6 15h16.8" /><path d="M11.5 3a17 17 0 000 18" /><path d="M12.5 3a17 17 0 010 18" />`, // globe
    'default': `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" />`, // building/market
};

// --- Color Themes (Simulated Aesthetic Training) ---
const THEMES: Record<string, { primary: string; secondary: string }> = {
    'Technology': { primary: '#1e3a8a', secondary: '#3b82f6' },
    'Health': { primary: '#065f46', secondary: '#10b981' },
    'Energy': { primary: '#b45309', secondary: '#f59e0b' },
    'Finance': { primary: '#5b21b6', secondary: '#8b5cf6' },
    'Industrials': { primary: '#4b5563', secondary: '#6b7280' },
    'positive': { primary: '#166534', secondary: '#22c55e' },
    'negative': { primary: '#991b1b', secondary: '#ef4444' },
    'default': { primary: '#1f2937', secondary: '#374151' },
};

// --- Keyword to Concept Mapping (Simulated Semantic Layer) ---
const KEYWORD_ASSOCIATIONS: Record<string, string> = {
    'surge': 'positive', 'rallies': 'positive', 'growth': 'positive', 'cheers': 'positive', 'groundbreaking': 'positive', 'breakthrough': 'positive', 'success': 'positive', 'approval': 'positive', 'boom': 'positive', 'peace': 'positive', 'wins': 'positive',
    'plummet': 'negative', 'tumbles': 'negative', 'headwinds': 'negative', 'drops': 'negative', 'warning': 'negative', 'fears': 'negative', 'concern': 'negative', 'failure': 'negative', 'breach': 'negative', 'recall': 'negative', 'recession': 'negative', 'war': 'negative', 'pandemic': 'negative',
    'split': 'split',
    'chip': 'Technology', 'ai': 'Technology', 'software': 'Technology', 'cyber': 'Technology', 'data': 'Technology', 'cloud': 'Technology', 'quantum': 'Technology',
    'fda': 'Health', 'drug': 'Health', 'health': 'Health', 'medical': 'Health', 'pharma': 'Health', 'clinic': 'Health',
    'energy': 'Energy', 'solar': 'Energy', 'oil': 'Energy', 'efficiency': 'Energy', 'subsidy': 'Energy',
    'finance': 'Finance', 'earnings': 'Finance', 'fintech': 'Finance', 'rate': 'Finance', 'rating': 'Finance', 'bank': 'Finance',
    'industrials': 'Industrials', 'contract': 'Industrials', 'supply': 'Industrials', 'factory': 'Industrials', 'logistics': 'Industrials',
    'global': 'macro', 'market': 'macro',
};


const generateSvg = (mainText: string, iconPath: string, theme: { primary: string; secondary: string }): string => {
    const escape = (str: string) => str.replace(/[&<>"']/g, ''); // Basic santization
    
    const svg = `
    <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.primary};" />
          <stop offset="100%" style="stop-color:${theme.secondary};" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#bg)" />
      <g transform="translate(40, 40) scale(4)">
        <g stroke="white" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.1">
           ${iconPath}
        </g>
      </g>
      <text
        x="20"
        y="180"
        font-family="Inter, sans-serif"
        font-size="48"
        font-weight="bold"
        fill="white"
        style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"
      >
        ${escape(mainText)}
      </text>
    </svg>
    `.replace(/\s\s+/g, ' ');

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Simulates a neural network trained on Google News to generate a relevant image.
 * It processes the headline, identifies key concepts, selects an appropriate visual theme
 * and icon from its knowledge base, and generates a dynamic SVG.
 */
export const getImageForEvent = (headline: string, ...extraKeywords: string[]): string => {
    const combinedText = [headline, ...extraKeywords].join(' ').toLowerCase();
    
    let bestConcept = 'default';
    let highestPriority = -1;

    const priorities = { 'sector': 3, 'sentiment': 2, 'action': 1, 'default': 0 };

    // Determine the most relevant concept from keywords
    for (const keyword in KEYWORD_ASSOCIATIONS) {
        if (combinedText.includes(keyword)) {
            const concept = KEYWORD_ASSOCIATIONS[keyword];
            let priority = 0;
            if (THEMES[concept] && ICONS[concept]) {
                if (['Technology', 'Health', 'Energy', 'Finance', 'Industrials'].includes(concept)) {
                    priority = priorities.sector;
                } else if (['positive', 'negative'].includes(concept)) {
                    priority = priorities.sentiment;
                } else {
                    priority = priorities.action;
                }
            }

            if (priority > highestPriority) {
                highestPriority = priority;
                bestConcept = concept;
            }
        }
    }
    
    // Override with explicit sector keyword if available
    const sectorKeyword = extraKeywords.find(k => k && THEMES[k]);
    if (sectorKeyword) {
        bestConcept = sectorKeyword;
    }

    const theme = THEMES[bestConcept] || THEMES.default;
    const iconPath = ICONS[bestConcept] || ICONS.default;
    
    // Extract a main subject for the image, typically the stock symbol
    const stockSymbolMatch = headline.match(/^([A-Z]+)/);
    const mainText = stockSymbolMatch ? stockSymbolMatch[1] : 'Market';

    return generateSvg(mainText, iconPath, theme);
};
