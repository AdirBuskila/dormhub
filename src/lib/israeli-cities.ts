/**
 * List of Israeli cities for autocomplete
 * Organized alphabetically in Hebrew
 */
export const ISRAELI_CITIES = [
  'אבו גוש',
  'אבו סנאן',
  'אופקים',
  'אור עקיבא',
  'אור יהודה',
  'אזור',
  'אילת',
  'אלעד',
  'אריאל',
  'אשדוד',
  'אשקלון',
  'באר שבע',
  'בית שאן',
  'בית שמש',
  'בני ברק',
  'בת ים',
  'גבעת שמואל',
  'גבעתיים',
  'גדרה',
  'דימונה',
  'הוד השרון',
  'הרצליה',
  'זכרון יעקב',
  'חדרה',
  'חולון',
  'חיפה',
  'טבריה',
  'טירה',
  'טייבה',
  'טמרה',
  'יבנה',
  'יהוד-מונוסון',
  'יקנעם עילית',
  'ירושלים',
  'כרמיאל',
  'כפר סבא',
  'כפר קאסם',
  'לוד',
  'מגדל העמק',
  'מודיעין-מכבים-רעות',
  'מודיעין עילית',
  'מעלה אדומים',
  'מעלות-תרשיחא',
  'נהריה',
  'נס ציונה',
  'נצרת',
  'נצרת עילית',
  'נשר',
  'נתיבות',
  'נתניה',
  'סח\'נין',
  'עכו',
  'עפולה',
  'עראבה',
  'ערד',
  'פתח תקווה',
  'צפת',
  'קלנסווה',
  'קריית אונו',
  'קריית אתא',
  'קריית ביאליק',
  'קריית גת',
  'קריית ים',
  'קריית מוצקין',
  'קריית מלאכי',
  'קריית שמונה',
  'ראש העין',
  'ראשון לציון',
  'רהט',
  'רחובות',
  'רכסים',
  'רמלה',
  'רמת גן',
  'רמת השרון',
  'רעננה',
  'שדרות',
  'שפרעם',
  'תל אביב-יפו'
];

/**
 * Filter cities based on user input
 */
export function filterCities(query: string): string[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const normalizedQuery = query.trim().toLowerCase();
  
  return ISRAELI_CITIES.filter(city => 
    city.toLowerCase().includes(normalizedQuery)
  ).slice(0, 5); // Limit to 5 suggestions
}

/**
 * Validate Israeli phone number
 * Accepts formats: 050-1234567, 0501234567, +972501234567, 972501234567
 */
export function validateIsraeliPhone(phone: string): { valid: boolean; message?: string } {
  // Remove spaces, dashes, and plus signs
  const cleaned = phone.replace(/[\s\-+]/g, '');
  
  // Check if it's a valid Israeli mobile number
  // Israeli mobile: 05X-XXXXXXX (10 digits starting with 05)
  // Or with country code: 97205X-XXXXXXX
  
  // Pattern 1: 05X-XXXXXXX (10 digits)
  const localPattern = /^05[0-9]{8}$/;
  
  // Pattern 2: 97205X-XXXXXXX (12 digits with country code)
  const intlPattern = /^97205[0-9]{8}$/;
  
  if (localPattern.test(cleaned) || intlPattern.test(cleaned)) {
    return { valid: true };
  }
  
  return { 
    valid: false, 
    message: 'נא להזין מספר טלפון ישראלי תקין (לדוגמה: 050-1234567)' 
  };
}

/**
 * Format phone number for display
 */
export function formatIsraeliPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  
  if (cleaned.startsWith('972')) {
    // International format: +972-50-1234567
    const number = cleaned.substring(3);
    return `+972-${number.substring(0, 2)}-${number.substring(2)}`;
  } else if (cleaned.startsWith('05')) {
    // Local format: 050-1234567
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
  }
  
  return phone;
}

