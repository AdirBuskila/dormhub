// Hebrew to English search mappings for product brands and models
// This enables searching for "אייפון" and finding "iPhone"

import { HebrewSearchMapping } from '@/types/database';

// Brand mappings
export const HEBREW_BRAND_MAPPINGS: HebrewSearchMapping[] = [
  {
    hebrew: 'אייפון',
    english: 'iPhone',
    aliases: ['איפון', 'אייפן', 'איפן']
  },
  {
    hebrew: 'אפל',
    english: 'Apple',
    aliases: ['אייפל', 'אפול']
  },
  {
    hebrew: 'סמסונג',
    english: 'Samsung',
    aliases: ['סמסאנג', 'סאמסונג']
  },
  {
    hebrew: 'גלקסי',
    english: 'Galaxy',
    aliases: ['גלאקסי']
  },
  {
    hebrew: 'שיאומי',
    english: 'Xiaomi',
    aliases: ['שאומי', 'סיאומי']
  },
  {
    hebrew: 'רדמי',
    english: 'Redmi',
    aliases: ['רדמני']
  },
  {
    hebrew: 'נוקיה',
    english: 'Nokia',
    aliases: ['נוקיא']
  },
  {
    hebrew: 'איירפודס',
    english: 'AirPods',
    aliases: ['אירפודס', 'איירפוד', 'אירפוד']
  },
  {
    hebrew: 'איירטאג',
    english: 'AirTag',
    aliases: ['אירטאג', 'איירטג', 'אירטג']
  },
  {
    hebrew: 'אפל ווטש',
    english: 'Apple Watch',
    aliases: ['אפל וואטש', 'אייפל ווטש']
  },
  {
    hebrew: 'איירפודס מקס',
    english: 'AirPods Max',
    aliases: ['אירפודס מקס']
  },
  {
    hebrew: 'איירפודס פרו',
    english: 'AirPods Pro',
    aliases: ['אירפודס פרו']
  },
  {
    hebrew: 'אייפד',
    english: 'iPad',
    aliases: ['איפד']
  },
  {
    hebrew: 'טאבלט',
    english: 'tablet',
    aliases: ['טבלט']
  },
  {
    hebrew: 'שעון חכם',
    english: 'smartwatch',
    aliases: ['שעון']
  },
  {
    hebrew: 'אוזניות',
    english: 'earphones',
    aliases: ['אוזניה']
  },
  {
    hebrew: 'מטען',
    english: 'charger',
    aliases: ['מטעין']
  },
  {
    hebrew: 'כבל',
    english: 'cable',
    aliases: []
  },
  {
    hebrew: 'ג׳יי בי אל',
    english: 'JBL',
    aliases: ['ג\'יי בי אל', 'JBL']
  },
  {
    hebrew: 'בלקוויו',
    english: 'Blackview',
    aliases: ['בלק וויו']
  },
  {
    hebrew: 'פוקו',
    english: 'Poco',
    aliases: []
  }
];

// Model/variant mappings
export const HEBREW_MODEL_MAPPINGS: HebrewSearchMapping[] = [
  {
    hebrew: 'פרו',
    english: 'Pro',
    aliases: ['פרא']
  },
  {
    hebrew: 'מקס',
    english: 'Max',
    aliases: []
  },
  {
    hebrew: 'פלוס',
    english: 'Plus',
    aliases: ['+']
  },
  {
    hebrew: 'מיני',
    english: 'Mini',
    aliases: ['מני']
  },
  {
    hebrew: 'אולטרה',
    english: 'Ultra',
    aliases: ['אלטרה']
  },
  {
    hebrew: 'אייר',
    english: 'Air',
    aliases: ['אייר']
  },
  {
    hebrew: 'חדש',
    english: 'new',
    aliases: []
  },
  {
    hebrew: 'משומש',
    english: 'used',
    aliases: []
  },
  {
    hebrew: 'מחודש',
    english: 'refurbished',
    aliases: []
  }
];

// Storage mappings
export const HEBREW_STORAGE_MAPPINGS: HebrewSearchMapping[] = [
  {
    hebrew: 'גיגה',
    english: 'GB',
    aliases: ['גיגהבייט', 'ג\'יגה']
  },
  {
    hebrew: 'טרה',
    english: 'TB',
    aliases: ['טרהבייט']
  }
];

/**
 * Translates Hebrew search terms to English equivalents
 * @param query - The search query (can be Hebrew or English)
 * @returns Array of search terms to use (includes original + translations)
 */
export function translateHebrewSearch(query: string): string[] {
  const searchTerms = new Set<string>();
  const normalizedQuery = query.trim().toLowerCase();
  
  // Always include the original query
  searchTerms.add(normalizedQuery);
  
  // Check all mappings
  const allMappings = [
    ...HEBREW_BRAND_MAPPINGS,
    ...HEBREW_MODEL_MAPPINGS,
    ...HEBREW_STORAGE_MAPPINGS
  ];
  
  for (const mapping of allMappings) {
    const hebrewTerm = mapping.hebrew.toLowerCase();
    const englishTerm = mapping.english.toLowerCase();
    
    // FIXED: Check if Hebrew term CONTAINS query (partial matching)
    // e.g., "אייפון".includes("אייפ") = true ✓
    if (hebrewTerm.includes(normalizedQuery)) {
      // Add English translation
      searchTerms.add(englishTerm);
    }
    
    // Check if query is exact match or full Hebrew term
    if (normalizedQuery.includes(hebrewTerm)) {
      searchTerms.add(englishTerm);
      
      // Replace Hebrew with English for compound searches
      const translated = normalizedQuery.replace(hebrewTerm, englishTerm);
      searchTerms.add(translated);
    }
    
    // Check aliases for partial and full matches
    if (mapping.aliases) {
      for (const alias of mapping.aliases) {
        const aliasLower = alias.toLowerCase();
        
        // Partial match: alias contains query
        if (aliasLower.includes(normalizedQuery)) {
          searchTerms.add(englishTerm);
        }
        
        // Full match: query contains alias
        if (normalizedQuery.includes(aliasLower)) {
          searchTerms.add(englishTerm);
          
          const translated = normalizedQuery.replace(aliasLower, englishTerm);
          searchTerms.add(translated);
        }
      }
    }
    
    // Reverse: if searching in English (partial or full), also add Hebrew
    if (englishTerm.includes(normalizedQuery)) {
      searchTerms.add(hebrewTerm);
    }
    
    if (normalizedQuery.includes(englishTerm)) {
      searchTerms.add(hebrewTerm);
    }
  }
  
  return Array.from(searchTerms);
}

/**
 * Builds a SQL search condition that works with both Hebrew and English
 * @param searchTerms - Array of search terms from translateHebrewSearch
 * @param columns - Array of column names to search in
 * @returns SQL WHERE clause parts
 */
export function buildHebrewSearchSQL(
  searchTerms: string[],
  columns: string[]
): string {
  const conditions: string[] = [];
  
  for (const term of searchTerms) {
    for (const column of columns) {
      conditions.push(`LOWER(${column}) LIKE '%${term}%'`);
    }
  }
  
  return conditions.join(' OR ');
}

/**
 * Check if a product matches Hebrew or English search terms
 * (Client-side filter helper)
 */
export function matchesHebrewSearch(
  searchQuery: string,
  product: {
    brand?: string;
    model?: string;
    storage?: string;
    category?: string;
    tags?: string[];
  }
): boolean {
  const searchTerms = translateHebrewSearch(searchQuery);
  const searchableText = [
    product.brand,
    product.model,
    product.storage,
    product.category,
    ...(product.tags || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  
  return searchTerms.some(term => searchableText.includes(term));
}

/**
 * Get suggested search terms based on partial Hebrew input
 */
export function getHebrewSearchSuggestions(partialQuery: string): string[] {
  const suggestions = new Set<string>();
  const normalized = partialQuery.trim().toLowerCase();
  
  if (normalized.length < 2) {
    return [];
  }
  
  // Check brand mappings
  for (const mapping of HEBREW_BRAND_MAPPINGS) {
    if (mapping.hebrew.toLowerCase().startsWith(normalized)) {
      suggestions.add(mapping.hebrew);
      suggestions.add(mapping.english);
    }
    
    if (mapping.aliases) {
      for (const alias of mapping.aliases) {
        if (alias.toLowerCase().startsWith(normalized)) {
          suggestions.add(mapping.hebrew);
          suggestions.add(mapping.english);
        }
      }
    }
  }
  
  return Array.from(suggestions).slice(0, 5);
}

