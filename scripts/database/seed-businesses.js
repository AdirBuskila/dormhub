#!/usr/bin/env node

/**
 * Seed script for local businesses data
 * Run with: node scripts/database/seed-businesses.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedBusinesses() {
  console.log('🌱 Seeding businesses data...');

  try {
    // Insert businesses
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .upsert([
        {
          name: "Tuvia's Pizza",
          category: 'restaurant',
          description: 'Delicious pizza and Italian food right below the dorms',
          phone: '02-123-4567',
          address: 'Ground floor, Building A',
          display_order: 1,
        },
        {
          name: 'Quick Stop',
          category: 'minimarket',
          description: 'Your local convenience store for snacks, drinks, and essentials',
          phone: '02-234-5678',
          address: 'Ground floor, Building B',
          display_order: 2,
        },
        {
          name: 'Campus Bakery',
          category: 'bakery',
          description: 'Fresh bread, pastries, and coffee every morning',
          phone: '02-345-6789',
          address: 'Ground floor, Building A',
          display_order: 3,
        },
        {
          name: 'Super Market',
          category: 'supermarket',
          description: 'Full-service supermarket for all your grocery needs',
          phone: '02-456-7890',
          address: 'Ground floor, Building C',
          display_order: 4,
        },
      ], { onConflict: 'name' })
      .select();

    if (businessError) {
      throw businessError;
    }

    console.log(`✅ Inserted ${businesses.length} businesses`);

    // Get business IDs
    const tuviasPizza = businesses.find(b => b.name === "Tuvia's Pizza");
    const quickStop = businesses.find(b => b.name === 'Quick Stop');
    const campusBakery = businesses.find(b => b.name === 'Campus Bakery');
    const superMarket = businesses.find(b => b.name === 'Super Market');

    // Insert opening hours
    const hours = [
      // Tuvia's Pizza
      ...['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].map(day => ({
        business_id: tuviasPizza.id,
        day_of_week: day,
        opens_at: '11:00',
        closes_at: '23:00',
      })),
      { business_id: tuviasPizza.id, day_of_week: 'friday', opens_at: '11:00', closes_at: '15:00' },
      { business_id: tuviasPizza.id, day_of_week: 'saturday', opens_at: '20:00', closes_at: '23:59' },
      
      // Quick Stop
      ...['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].map(day => ({
        business_id: quickStop.id,
        day_of_week: day,
        opens_at: '07:00',
        closes_at: '23:00',
      })),
      { business_id: quickStop.id, day_of_week: 'friday', opens_at: '07:00', closes_at: '16:00' },
      { business_id: quickStop.id, day_of_week: 'saturday', opens_at: '20:00', closes_at: '23:00' },
      
      // Campus Bakery
      ...['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => ({
        business_id: campusBakery.id,
        day_of_week: day,
        opens_at: day === 'friday' ? '06:00' : '06:00',
        closes_at: day === 'friday' ? '14:00' : '20:00',
      })),
      { business_id: campusBakery.id, day_of_week: 'saturday', opens_at: null, closes_at: null, is_closed: true },
      
      // Super Market
      ...['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].map(day => ({
        business_id: superMarket.id,
        day_of_week: day,
        opens_at: '08:00',
        closes_at: '22:00',
      })),
      { business_id: superMarket.id, day_of_week: 'friday', opens_at: '08:00', closes_at: '15:00' },
      { business_id: superMarket.id, day_of_week: 'saturday', opens_at: '20:00', closes_at: '23:00' },
    ];

    const { error: hoursError } = await supabase
      .from('business_hours')
      .upsert(hours, { onConflict: 'business_id,day_of_week' });

    if (hoursError) {
      throw hoursError;
    }

    console.log(`✅ Inserted ${hours.length} business hours entries`);

    // Insert student discounts
    const discounts = [
      {
        business_id: tuviasPizza.id,
        title: '10% Student Discount',
        description: 'Show your student ID and get 10% off your entire order!',
        discount_type: 'percentage',
        discount_value: '10%',
        requires_student_id: true,
      },
      {
        business_id: quickStop.id,
        title: 'Student Special: Buy 2 Get 1 Free',
        description: 'Buy any 2 drinks or snacks and get the cheapest one free! Valid for students only.',
        discount_type: 'buy_one_get_one',
        discount_value: 'Buy 2 Get 1 Free',
        requires_student_id: true,
      },
      {
        business_id: campusBakery.id,
        title: '15% Off Fresh Baked Goods',
        description: 'Students get 15% off all fresh bread, pastries, and baked goods!',
        discount_type: 'percentage',
        discount_value: '15%',
        requires_student_id: true,
      },
    ];

    const { data: insertedDiscounts, error: discountsError } = await supabase
      .from('student_discounts')
      .upsert(discounts, { onConflict: 'business_id,title' })
      .select();

    if (discountsError) {
      throw discountsError;
    }

    console.log(`✅ Inserted ${insertedDiscounts.length} student discounts`);
    console.log('\n✨ Businesses seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding businesses:', error);
    process.exit(1);
  }
}

seedBusinesses();



