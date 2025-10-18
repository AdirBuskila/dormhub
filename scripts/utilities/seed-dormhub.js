#!/usr/bin/env node

/**
 * DormHub Seed Script
 * Populates the database with sample data for testing
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample profiles (matching Clerk test users)
const sampleProfiles = [
  {
    clerk_id: 'user_demo_001',
    full_name: 'Alex Chen',
    username: 'alexc',
    room: 'A-204',
    phone: '+972-50-123-4567',
  },
  {
    clerk_id: 'user_demo_002',
    full_name: 'Sarah Miller',
    username: 'sarahm',
    room: 'B-301',
    phone: '+972-54-987-6543',
  },
  {
    clerk_id: 'user_demo_003',
    full_name: 'David Levi',
    username: 'davidl',
    room: 'C-105',
  },
];

// Sample listings
const sampleListings = [
  {
    type: 'sell',
    title: 'Mini Fridge - Excellent Condition',
    description: 'Barely used mini fridge, perfect for dorm room. Selling because I\'m moving out. 1.7 cubic feet capacity.',
    price_ils: 250,
    condition: 'like_new',
    category: 'appliances',
    tags: ['fridge', 'dorm-essentials', 'mini-fridge'],
    location: 'Dorm A',
  },
  {
    type: 'sell',
    title: 'Calculus Textbook - 12th Edition',
    description: 'Calculus: Early Transcendentals, 12th edition. No markings, like new. Includes solution manual.',
    price_ils: 150,
    condition: 'good',
    category: 'books',
    tags: ['textbook', 'math', 'calculus'],
  },
  {
    type: 'giveaway',
    title: 'Free Desk Lamp',
    description: 'Working desk lamp, don\'t need it anymore. Free to whoever wants it.',
    condition: 'good',
    category: 'furniture',
    tags: ['lamp', 'free', 'desk'],
    location: 'Dorm B',
  },
  {
    type: 'sell',
    title: 'Electric Kettle',
    description: 'Fast boiling electric kettle, 1.7L capacity. Great for tea, coffee, instant noodles.',
    price_ils: 80,
    condition: 'good',
    category: 'kitchen',
    tags: ['kettle', 'kitchen', 'appliance'],
  },
  {
    type: 'buy',
    title: 'Looking for Microwave',
    description: 'Need a microwave for my dorm room. Willing to pay up to 200 NIS. Must be in good working condition.',
    price_ils: 200,
    category: 'appliances',
    tags: ['wanted', 'microwave'],
  },
  {
    type: 'swap',
    title: 'Economics Textbook - Want to Swap',
    description: 'Have: Principles of Economics by Mankiw. Want: Any Microeconomics textbook in good condition.',
    condition: 'good',
    category: 'books',
    tags: ['swap', 'textbook', 'economics'],
  },
  {
    type: 'sell',
    title: 'Gaming Mouse - Logitech G502',
    description: 'Logitech G502 HERO gaming mouse. Used for 6 months, works perfectly. Includes original box.',
    price_ils: 180,
    condition: 'like_new',
    category: 'electronics',
    tags: ['gaming', 'mouse', 'logitech'],
  },
  {
    type: 'sell',
    title: 'Study Chair with Back Support',
    description: 'Comfortable study chair with good lumbar support. Black mesh back, adjustable height.',
    price_ils: 300,
    condition: 'good',
    category: 'furniture',
    tags: ['chair', 'study', 'furniture'],
    location: 'Dorm C',
  },
  {
    type: 'giveaway',
    title: 'Storage Bins (Set of 3)',
    description: 'Three plastic storage bins, various sizes. Good for organizing stuff. Pick up from my room.',
    condition: 'fair',
    category: 'misc',
    tags: ['storage', 'free', 'organization'],
  },
  {
    type: 'sell',
    title: 'Bluetooth Speaker - JBL Flip 5',
    description: 'JBL Flip 5 portable speaker. Great sound quality, waterproof. Barely used.',
    price_ils: 250,
    condition: 'like_new',
    category: 'electronics',
    tags: ['speaker', 'bluetooth', 'jbl', 'music'],
  },
];

// Sample tips
const sampleTips = [
  {
    title: 'Best Times to Do Laundry',
    body: 'Avoid Sunday evenings and Monday mornings - everyone does laundry then! The best time is weekday afternoons between 2-4 PM. Almost always empty machines available.',
    tags: ['laundry', 'time-management'],
    status: 'approved',
  },
  {
    title: 'Quiet Study Spots on Campus',
    body: 'The 3rd floor of the library is designated as a silent study area. Much better than the noisy common rooms. Also, the engineering building has empty classrooms after 6 PM that are great for studying.',
    tags: ['study', 'campus', 'quiet'],
    status: 'approved',
  },
  {
    title: 'Save Money on Food',
    body: 'The cafeteria offers 20% off if you buy meal plans for the month. Also, the grocery store near campus has student discounts on Tuesdays. Stock up on non-perishables!',
    tags: ['food', 'money', 'deals'],
    status: 'approved',
  },
  {
    title: 'Making Friends in the Dorm',
    body: 'Keep your door open when you\'re in your room (especially first few weeks). People will stop by to say hi. Also, attend the floor events - they\'re actually pretty fun and a great way to meet people.',
    tags: ['social', 'friends', 'move-in'],
    status: 'approved',
  },
  {
    title: 'Dealing with Noisy Neighbors',
    body: 'Talk to them directly first before going to the RA. Most people don\'t realize they\'re being loud. If that doesn\'t work, the RA can help mediate. Quiet hours are 10 PM - 8 AM on weekdays.',
    tags: ['dorm-life', 'noise', 'neighbors'],
    status: 'approved',
  },
  {
    title: 'Essential Items Often Forgotten',
    body: 'Don\'t forget: surge protectors (you\'ll need multiple), under-bed storage containers, a good desk lamp, and a water filter pitcher. Also bring a first aid kit!',
    tags: ['move-in', 'essentials', 'packing'],
    status: 'approved',
  },
  {
    title: 'Bike Security Tips',
    body: 'Always use a U-lock, not just a cable lock. Register your bike with campus security. Lock it in well-lit areas. I\'ve seen too many bikes stolen!',
    tags: ['bike', 'security', 'campus'],
    status: 'approved',
  },
  {
    title: 'WiFi Connectivity Issues',
    body: 'If the dorm WiFi is slow, try connecting via Ethernet cable - much faster and more reliable. You can buy a USB-to-Ethernet adapter cheaply. Also, restart your router if you have one.',
    tags: ['wifi', 'internet', 'tech'],
    status: 'approved',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting DormHub seeding...\n');

  try {
    // 1. Seed Profiles
    console.log('📝 Seeding profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .upsert(sampleProfiles, { onConflict: 'clerk_id' })
      .select();

    if (profileError) {
      console.error('Error seeding profiles:', profileError);
      throw profileError;
    }

    console.log(`✅ Created ${profiles.length} profiles\n`);

    // 2. Seed Listings
    console.log('🏪 Seeding marketplace listings...');
    const listingsWithOwners = sampleListings.map((listing, index) => ({
      ...listing,
      owner_id: profiles[index % profiles.length].id,
    }));

    const { data: listings, error: listingError } = await supabase
      .from('listings')
      .insert(listingsWithOwners)
      .select();

    if (listingError) {
      console.error('Error seeding listings:', listingError);
      throw listingError;
    }

    console.log(`✅ Created ${listings.length} listings\n`);

    // 3. Seed Tips
    console.log('💡 Seeding tips...');
    const tipsWithAuthors = sampleTips.map((tip, index) => ({
      ...tip,
      author_id: profiles[index % profiles.length].id,
    }));

    const { data: tips, error: tipError } = await supabase
      .from('tips')
      .insert(tipsWithAuthors)
      .select();

    if (tipError) {
      console.error('Error seeding tips:', tipError);
      throw tipError;
    }

    console.log(`✅ Created ${tips.length} tips\n`);

    // Summary
    console.log('🎉 Seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${profiles.length} profiles`);
    console.log(`  - ${listings.length} listings`);
    console.log(`  - ${tips.length} tips`);
    console.log('\n✨ Your DormHub database is ready for testing!\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();

