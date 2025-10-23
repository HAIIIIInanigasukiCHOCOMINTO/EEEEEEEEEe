// This file simulates a neural network for image generation, trained on a vast corpus of financial articles and images from sources like news.google.com.
// It uses a knowledge base of keyword-to-icon/theme mappings to generate a relevant
// and aesthetically pleasing SVG image for each news event.

// --- Icon Library (Simulated Visual Knowledge Base) ---
const ICONS: Record<string, string> = {
    'Technology': `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /><path d="M12 20v2M20 12h2M2 12H0M12 0v2M18 4l-1 1M6 4l1 1M18 20l-1-1M6 20l1-1" />`, // Cube/layers with subtle data points
    'Health': `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /><path d="M12 5V20M5 12h14" />`, // DNA/molecule with plus sign
    'Energy': `<path d="M12 3v1m0 16v1m8.66-12.66l-.7.7M4.04 19.96l-.7.7M21 12h-1M4 12H3m16.66 4.34l-.7-.7M5.04 5.04l-.7-.7" /><circle cx="12" cy="12" r="5" /><path d="M12 17L12 7" /><path d="M9 10L12 7 15 10" />`, // Sun with upward energy flow
    'Finance': `<path d="M2 12h2M6 6l1.5 1.5M14.5 9.5L16 8M18 12h2M12 2v2M12 18v2M9.5 14.5L8 16M16 14.5l-1.5 1.5" /><circle cx="12" cy="12" r="8" /><path d="M12 8l4 4-4 4-4-4z" />`, // Abstract chart lines with diamond for value
    'Industrials': `<path d="M19 12l-7 7-7-7" /><path d="M19 5l-7 7-7-7" /><circle cx="12" cy="12" r="4" stroke-dasharray="2 2" />`, // Gears/Industry with dashed circle for innovation
    'split': `<path d="M12 19l7-7-7-7" /><path d="M5 12h14" /><path d="M12 12L12 2M12 12L12 22" stroke-dasharray="2 2" />`, // Arrow right for growth, horizontal split, with dashed vertical line
    'positive': `<path d="M5 12h14" /><path d="M12 5l7 7-7 7" /><path d="M12 5l-7 7 7 7" />`, // Up arrow with converging lines
    'negative': `<path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /><path d="M12 19l7-7-7-7" />`, // Down arrow with diverging lines
    'neutral': `<path d="M5 12h14M12 5v14" /><circle cx="12" cy="12" r="6" stroke-dasharray="1 1" />`, // Plus sign (balance) with dashed circle for stability
    'macro': `<path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M3.6 9h16.8" /><path d="M3.6 15h16.8" /><path d="M11.5 3a17 17 0 000 18" /><path d="M12.5 3a17 17 0 010 18" /><path d="M12 2a10 10 0 010 20" />`, // Globe with extra longitude line
    'political': `<path d="M3 22v-13h18v13" /><path d="M4 9l8-6 8 6" /><path d="M2 22h20" /><path d="M12 12v6" />`, // Capitol building with column
    'disaster': `<path d="M18 10h-1.26A8 8 0 102 12h1.26" /><path d="M12 22V12" /><path d="M16 16l-4 4-4-4" /><path d="M12 12L12 0" stroke-dasharray="2 2" />`, // Storm cloud with rain and dashed upward line for recovery
    'default': `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /><path d="M12 8l4 4-4 4-4-4z" />`, // Building/market with a subtle diamond
    'innovation': `<path d="M10 20.7a8.5 8.5 0 110-17 8.5 8.5 0 010 17z" /><path d="M12 8L8 12 12 16" /><path d="M8 12h8" /><circle cx="12" cy="12" r="2" fill="white" />`, // Lightbulb with a bright spot
    'merger': `<path d="M12 19V5M5 12h14" /><circle cx="12" cy="12" r="3" /><path d="M10 12h4M12 10v4" stroke="white" stroke-width="0.5" />`, // Intersecting arrows with a small cross at center
    'alliance': `<path d="M17 12H7M12 17V7" /><circle cx="12" cy="12" r="8" stroke-dasharray="2 2" /><circle cx="12" cy="12" r="2" fill="white" />`, // Dotted circle with plus and central dot
    'stability': `<path d="M3 12h18M3 17h18M3 7h18" />`, // Three horizontal lines for stability
    'growth': `<path d="M5 18l5-5 4 4 5-5" /><path d="M18 13h3v3" />`, // Upward trend line
    'recession': `<path d="M5 6l5 5 4-4 5 5" /><path d="M18 11h3v-3" />`, // Downward trend line
    'update': `<circle cx="12" cy="12" r="10" /><path d="M12 8v4l2 2" />`, // Clock icon for updates
};

// --- Color Themes (Simulated Aesthetic Training) ---
const THEMES: Record<string, { primary: string; secondary: string }> = {
    'Technology': { primary: '#1e3a8a', secondary: '#3b82f6' }, // Deep Blue to Sky Blue
    'Health': { primary: '#065f46', secondary: '#10b981' }, // Dark Green to Emerald
    'Energy': { primary: '#b45309', secondary: '#f59e0b' }, // Dark Orange to Amber
    'Finance': { primary: '#5b21b6', secondary: '#8b5cf6' }, // Deep Purple to Lavender
    'Industrials': { primary: '#4b5563', secondary: '#6b7280' }, // Dark Gray to Light Gray
    'positive': { primary: '#166534', secondary: '#22c55e' }, // Dark Green to Lime Green
    'negative': { primary: '#991b1b', secondary: '#ef4444' }, // Dark Red to Bright Red
    'neutral': { primary: '#374151', secondary: '#9ca3af' }, // Dark Gray to Medium Gray, more muted
    'macro': { primary: '#111827', secondary: '#374151' }, // Very Dark Gray to Dark Gray
    'political': { primary: '#4a044e', secondary: '#701a75' }, // Dark Magenta to Medium Magenta
    'disaster': { primary: '#450a0a', secondary: '#7f1d1d' }, // Very Dark Red to Dark Red
    'default': { primary: '#1f2937', secondary: '#374151' }, // Default Dark Gray shades
    'innovation': { primary: '#083344', secondary: '#0ea5e9' }, // Dark Cyan to Sky Blue
    'merger': { primary: '#6d28d9', secondary: '#a78bfa' }, // Indigo to Light Indigo
    'alliance': { primary: '#0f766e', secondary: '#2dd4bf' }, // Teal to Aqua

    // --- Blended Themes ---
    'Technology_positive': { primary: '#1e3a8a', secondary: '#16a34a' }, // Blue to Green
    'Technology_negative': { primary: '#1e3a8a', secondary: '#b91c1c' }, // Blue to Red
    'Technology_neutral': { primary: '#1e3a8a', secondary: '#6b7280' }, // Blue to Gray
    'Health_positive': { primary: '#065f46', secondary: '#65a30d' }, // Dark Green to Lime
    'Health_negative': { primary: '#065f46', secondary: '#b91c1c' }, // Dark Green to Red
    'Health_neutral': { primary: '#065f46', secondary: '#6b7280' }, // Dark Green to Gray
    'Energy_positive': { primary: '#b45309', secondary: '#facc15' }, // Orange to Yellow
    'Energy_negative': { primary: '#b45309', secondary: '#4b5563' }, // Orange to Gray
    'Energy_neutral': { primary: '#b45309', secondary: '#6b7280' }, // Orange to Gray
    'Finance_positive': { primary: '#5b21b6', secondary: '#16a34a' }, // Purple to Green
    'Finance_negative': { primary: '#5b21b6', secondary: '#b91c1c' }, // Purple to Red
    'Finance_neutral': { primary: '#5b21b6', secondary: '#6b7280' }, // Purple to Gray
    'Industrials_positive': { primary: '#4b5563', secondary: '#16a34a' }, // Gray to Green
    'Industrials_negative': { primary: '#4b5563', secondary: '#991b1b' }, // Gray to Dark Red
    'Industrials_neutral': { primary: '#4b5563', secondary: '#9ca3af' }, // Gray to Lighter Gray
    'macro_positive': { primary: '#111827', secondary: '#16a34a' },
    'macro_negative': { primary: '#111827', secondary: '#b91c1c' },
    'macro_neutral': { primary: '#111827', secondary: '#6b7280' },
    'political_positive': { primary: '#4a044e', secondary: '#16a34a' },
    'political_negative': { primary: '#4a044e', secondary: '#ef4444' },
    'disaster_positive': { primary: '#450a0a', secondary: '#65a30d' }, // Dark Red to Lime (recovery)
    'disaster_negative': { primary: '#450a0a', secondary: '#ef4444' }, // Dark Red to Red (intensifying)
    'growth_theme': { primary: '#047857', secondary: '#34d399' }, // Green for growth
    'recession_theme': { primary: '#dc2626', secondary: '#f87171' }, // Red for recession
};

// --- Keyword to Concept Mapping (Simulated Semantic Layer) ---
const KEYWORD_ASSOCIATIONS: Record<string, string> = {
    'surge': 'positive', 'rallies': 'positive', 'growth': 'positive', 'cheers': 'positive', 'groundbreaking': 'positive', 'breakthrough': 'positive', 'success': 'positive', 'approval': 'positive', 'boom': 'positive', 'peace': 'positive', 'wins': 'positive', 'deal': 'positive', 'unveils': 'positive', 'soars': 'positive', 'gains': 'positive', 'momentum': 'positive', 'expansion': 'positive', 'innovation': 'innovation', 'upgrade': 'positive', 'accelerates': 'positive', 'benefits': 'positive', 'rise': 'positive',
    'plummet': 'negative', 'tumbles': 'negative', 'headwinds': 'negative', 'drops': 'negative', 'warning': 'negative', 'fears': 'negative', 'concern': 'negative', 'failure': 'negative', 'breach': 'negative', 'recall': 'negative', 'recession': 'recession', 'war': 'negative', 'pandemic': 'negative', 'scandal': 'negative', 'uncertainty': 'negative', 'shutdown': 'negative', 'damage': 'negative', 'disrupting': 'negative', 'strikes': 'negative', 'anxious': 'negative', 'looms': 'negative', 'pressure': 'negative', 'delay': 'negative', 'downfall': 'negative', 'outage': 'negative', 'cuts': 'negative', 'sanctions': 'negative', 'threat': 'negative', 'crisis': 'negative', 'plagued': 'negative', 'suffers': 'negative',
    'split': 'split',
    'chip': 'Technology', 'ai': 'Technology', 'software': 'Technology', 'cyber': 'Technology', 'data': 'Technology', 'cloud': 'Technology', 'quantum': 'Technology', 'internet': 'Technology', 'robotics': 'Technology', 'tech': 'Technology', 'digital': 'Technology', 'platform': 'Technology',
    'fda': 'Health', 'drug': 'Health', 'health': 'Health', 'medical': 'Health', 'pharma': 'Health', 'clinic': 'Health', 'genomics': 'Health', 'therapy': 'Health', 'vaccine': 'Health', 'hospital': 'Health', 'wellness': 'Health',
    'energy': 'Energy', 'solar': 'Energy', 'oil': 'Energy', 'efficiency': 'Energy', 'subsidy': 'Energy', 'hydro': 'Energy', 'wind': 'Energy', 'nuclear': 'Energy', 'battery': 'Energy', 'grid': 'Energy', 'carbon': 'Energy',
// Fix: Removed duplicate 'finance' key.
    'finance': 'Finance', 'earnings': 'Finance', 'fintech': 'Finance', 'rate': 'Finance', 'rating': 'Finance', 'bank': 'Finance', 'insurance': 'Finance', 'lend': 'Finance', 'trade': 'Finance', 'invest': 'Finance', 'funds': 'Finance', 'ipo': 'Finance',
    'industrials': 'Industrials', 'contract': 'Industrials', 'supply': 'Industrials', 'factory': 'Industrials', 'logistics': 'Industrials', 'aero': 'Industrials', 'ship': 'Industrials', 'build': 'Industrials', 'auto': 'Industrials', 'rail': 'Industrials', 'manufacturing': 'Industrials', 'infrastructure': 'Industrials', 'commodity': 'Industrials',
    'global': 'macro', 'market': 'macro', 'economy': 'macro', 'macroeconomic': 'macro', 'world': 'macro',
// Fix: Removed duplicate 'trade' key which conflicted with the one under Finance.
    'political': 'political', 'election': 'political', 'government': 'political', 'policy': 'political', 'regulations': 'political',
    'hurricane': 'disaster', 'earthquake': 'disaster', 'wildfires': 'disaster', 'natural': 'disaster', 'storm': 'disaster', 'famine': 'disaster',
    'routine': 'neutral', 'minor': 'neutral', 'update': 'update', 'reshuffle': 'neutral', 'meeting': 'neutral', 'stable': 'stability', 'engagement': 'neutral', 'renovation': 'neutral', 'renewal': 'neutral', 'personnel': 'neutral', 'audit': 'neutral', 'showcase': 'neutral', 'review': 'neutral', 'dialogue': 'neutral', 'adjustment': 'neutral',
};


const generateSvg = (mainText: string, iconPath: string, theme: { primary: string; secondary: string }): string => {
    const escape = (str: string) => str.replace(/[&<>"']/g, ''); // Basic sanitization
    
    // Complex background pattern with dynamic elements
    const patternId = `diagonalHatch_${Math.random().toString(36).substring(7)}`;
    const circlesId = `movingCircles_${Math.random().toString(36).substring(7)}`;

    const dynamicPattern = `
        <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="15" height="15" patternTransform="rotate(45)">
            <path d="M-5,5 l10,-10 M0,15 l15,-15 M10,25 l10,-10" stroke="${theme.primary}" stroke-width="0.7" opacity="0.15"/>
        </pattern>
        <pattern id="${circlesId}" patternUnits="userSpaceOnUse" width="30" height="30">
            <circle cx="5" cy="5" r="2" fill="${theme.secondary}" opacity="0.1" />
            <circle cx="20" cy="20" r="3" fill="${theme.primary}" opacity="0.08" />
        </pattern>
    `;

    const svg = `
    <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.primary};" />
          <stop offset="100%" style="stop-color:${theme.secondary};" />
        </linearGradient>
        ${dynamicPattern}
      </defs>
      <rect width="400" height="200" fill="url(#bg)" />
      <rect width="400" height="200" fill="url(#${patternId})" />
      <rect width="400" height="200" fill="url(#${circlesId})" />
      
      <g transform="translate(40, 40) scale(4)">
        <g stroke="white" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.15">
           ${iconPath}
        </g>
        <g stroke="${theme.secondary}" fill="none" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" transform="translate(5, 5) scale(0.8)">
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
        dominant-baseline="alphabetic"
        text-anchor="start"
        letter-spacing="-1"
        style="text-shadow: 3px 3px 6px rgba(0,0,0,0.4);"
      >
        ${escape(mainText.toUpperCase())}
      </text>
      <text
        x="380"
        y="30"
        font-family="Inter, sans-serif"
        font-size="14"
        font-weight="normal"
        fill="white"
        dominant-baseline="middle"
        text-anchor="end"
        opacity="0.7"
      >
        NeuralNet News
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
    
    let primaryConcept: string | null = null;
    let secondaryConcept: string | null = null;

    // Increased priority for specific event types
    const priorities: Record<string, number> = { 
        'political': 5, 'disaster': 5, 'recession': 5, 'growth': 5,
        'macro': 4, 'sector': 3, 'sentiment': 2, 'action': 1, 'default': 0, 'neutral': 1, 'innovation': 4, 'merger': 4, 'alliance': 4, 'stability': 2, 'update': 2
    };

    // Determine the most relevant concepts from keywords
    for (const keyword in KEYWORD_ASSOCIATIONS) {
        if (combinedText.includes(keyword)) {
            const concept = KEYWORD_ASSOCIATIONS[keyword];
            
            // Prioritize specific event types
            if (['political', 'disaster', 'recession', 'growth', 'innovation', 'merger', 'alliance'].includes(concept) && ((priorities as any)[concept] || 0) > ((priorities as any)[primaryConcept] || 0)) {
                primaryConcept = concept;
            } else if (['Technology', 'Health', 'Energy', 'Finance', 'Industrials'].includes(concept) && ((priorities as any)['sector'] || 0) >= ((priorities as any)[primaryConcept] || 0)) {
                // If existing primary concept is weaker than a sector, or no primary, set sector
                if (!primaryConcept || (priorities[primaryConcept] < priorities['sector'])) {
                    primaryConcept = concept;
                }
            } else if (['positive', 'negative', 'neutral'].includes(concept) && ((priorities as any)['sentiment'] || 0) >= ((priorities as any)[secondaryConcept] || 0)) {
                // If existing secondary concept is weaker than sentiment, or no secondary, set sentiment
                if (!secondaryConcept || (priorities[secondaryConcept] < priorities['sentiment'])) {
                    secondaryConcept = concept;
                }
            } else if (((priorities as any)[concept] || 0) > ((priorities as any)[primaryConcept] || 0)) {
                 primaryConcept = concept;
            }
        }
    }

    // Refine primary and secondary concepts based on overall sentiment
    if (!primaryConcept && secondaryConcept) { // If only sentiment is found
        primaryConcept = secondaryConcept;
        secondaryConcept = null;
    } else if (primaryConcept && secondaryConcept && ['positive', 'negative', 'neutral'].includes(primaryConcept)) {
        // If primary is already a sentiment, keep it
    } else if (primaryConcept && secondaryConcept && !['positive', 'negative', 'neutral'].includes(primaryConcept)) {
        // If primary is a sector/macro, and we have a strong sentiment, try blending
        const blendedKey = `${primaryConcept}_${secondaryConcept}`;
        if (THEMES[blendedKey]) {
            // Keep primary as is, secondary will influence theme selection
        } else if (secondaryConcept && (priorities[secondaryConcept] > (priorities[primaryConcept] || 0))) {
            // If sentiment is stronger priority, make it primary
            primaryConcept = secondaryConcept;
            secondaryConcept = null;
        }
    }

    primaryConcept = primaryConcept || 'default';
    
    let themeKey = primaryConcept;
    if (primaryConcept && secondaryConcept) {
        const blendedKey = `${primaryConcept}_${secondaryConcept}`;
        if (THEMES[blendedKey]) {
            themeKey = blendedKey;
        }
    }
    
    const theme = THEMES[themeKey] || THEMES[primaryConcept] || THEMES.default;
    const iconPath = ICONS[primaryConcept] || ICONS.default;
    
    // Extract a main subject for the image, typically the stock symbol or a key word
    const stockSymbolMatch = headline.match(/^([A-Z]+)/);
    const mainText = stockSymbolMatch ? stockSymbolMatch[1] : (primaryConcept === 'macro' ? 'Global' : 'Market');

    return generateSvg(mainText, iconPath, theme);
};