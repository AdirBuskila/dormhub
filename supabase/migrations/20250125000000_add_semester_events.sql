-- Add semester start events to dorm calendar

-- Event 1: First Day of Studies
-- Simple single-day event
INSERT INTO dorm_events (
  title,
  description,
  event_type,
  location,
  start_time,
  end_time,
  tags
) VALUES (
  'היום הראשון ללימודים',
  'תחילת סמסטר א'' - בהצלחה לכולם! 🎓',
  'other',
  'קמפוס המכון הטכנולוגי',
  '2025-11-02 08:00:00+02',
  '2025-11-02 23:59:59+02',
  ARRAY['לימודים', 'סמסטר', 'אירוע מיוחד']
);

-- Event 2: Academic Year Start Happening (Multi-day event)
-- This creates multiple event entries for each day of the happening
-- Day 1: November 2, 2025
INSERT INTO dorm_events (
  title,
  description,
  event_type,
  location,
  start_time,
  end_time,
  tags
) VALUES (
  'הפנינג תחילת שנת הלימודים - יום 1',
  E'🎉 פעילות אגודת הסטודנטים\n\nהפנינג פתיחת הלימודים בשלושת הימים הראשונים של סמסטר א''.\n\n⏰ מידי יום יתקיימו הפסקות לימודים בנות שעה בין השעות:\n• 13:00-14:00\n• 18:00-19:00\n\nבואו ליהנות מאוכל, מוזיקה, פעילויות והנחות מעסקים מקומיים! 🎊',
  'party',
  'קמפוס המכון - כיכר מרכזית',
  '2025-11-02 13:00:00+02',
  '2025-11-02 19:00:00+02',
  ARRAY['אגודת סטודנטים', 'הפנינג', 'פעילויות', 'אוכל', 'מוזיקה']
);

-- Day 2: November 3, 2025
INSERT INTO dorm_events (
  title,
  description,
  event_type,
  location,
  start_time,
  end_time,
  tags
) VALUES (
  'הפנינג תחילת שנת הלימודים - יום 2',
  E'🎉 פעילות אגודת הסטודנטים\n\nהפנינג פתיחת הלימודים בשלושת הימים הראשונים של סמסטר א''.\n\n⏰ מידי יום יתקיימו הפסקות לימודים בנות שעה בין השעות:\n• 13:00-14:00\n• 18:00-19:00\n\nבואו ליהנות מאוכל, מוזיקה, פעילויות והנחות מעסקים מקומיים! 🎊',
  'party',
  'קמפוס המכון - כיכר מרכזית',
  '2025-11-03 13:00:00+02',
  '2025-11-03 19:00:00+02',
  ARRAY['אגודת סטודנטים', 'הפנינג', 'פעילויות', 'אוכל', 'מוזיקה']
);

-- Day 3: November 4, 2025
INSERT INTO dorm_events (
  title,
  description,
  event_type,
  location,
  start_time,
  end_time,
  tags
) VALUES (
  'הפנינג תחילת שנת הלימודים - יום 3',
  E'🎉 פעילות אגודת הסטודנטים\n\nהפנינג פתיחת הלימודים בשלושת הימים הראשונים של סמסטר א''.\n\n⏰ מידי יום יתקיימו הפסקות לימודים בנות שעה בין השעות:\n• 13:00-14:00\n• 18:00-19:00\n\nבואו ליהנות מאוכל, מוזיקה, פעילויות והנחות מעסקים מקומיים! 🎊\n\n🎯 יום אחרון להפנינג - אל תפספסו!',
  'party',
  'קמפוס המכון - כיכר מרכזית',
  '2025-11-04 13:00:00+02',
  '2025-11-04 19:00:00+02',
  ARRAY['אגודת סטודנטים', 'הפנינג', 'פעילויות', 'אוכל', 'מוזיקה']
);

