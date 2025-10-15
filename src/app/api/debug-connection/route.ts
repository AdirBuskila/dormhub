import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG CONNECTION TEST ===');
    
    // Test 1: Environment variables
    console.log('1. Environment Variables:');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
    // Test 2: Clerk authentication
    console.log('2. Clerk Authentication:');
    try {
      const authResult = await auth();
      console.log('Auth result:', authResult);
      console.log('User ID:', authResult.userId);
    } catch (authError) {
      console.error('Auth error:', authError);
    }
    
    // Test 3: Supabase connection
    console.log('3. Supabase Connection:');
    try {
      const { data, error } = await supabaseAdmin
        .from('clients')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase query error:', error);
        return NextResponse.json({
          success: false,
          errors: {
            supabase: error.message,
            code: error.code,
            hint: error.hint
          }
        }, { status: 500 });
      }
      
      console.log('Supabase query success:', data);
    } catch (supabaseError) {
      console.error('Supabase connection error:', supabaseError);
      return NextResponse.json({
        success: false,
        errors: {
          supabase: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
        }
      }, { status: 500 });
    }
    
    // Test 4: Simple insert test
    console.log('4. Simple Insert Test:');
    try {
      const testId = `test-${Date.now()}`;
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('clients')
        .insert({
          id: testId,
          name: 'Test User',
          phone: '050-1234567',
          address: 'Test City',
          payment_terms: 'on_delivery',
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Insert error:', insertError);
        return NextResponse.json({
          success: false,
          errors: {
            insert: insertError.message,
            code: insertError.code,
            hint: insertError.hint
          }
        }, { status: 500 });
      }
      
      console.log('Insert success:', insertData);
      
      // Clean up test record
      await supabaseAdmin
        .from('clients')
        .delete()
        .eq('id', testId);
      
    } catch (insertError) {
      console.error('Insert test error:', insertError);
      return NextResponse.json({
        success: false,
        errors: {
          insert: insertError instanceof Error ? insertError.message : 'Unknown error'
        }
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'All tests passed!'
    });
    
  } catch (error) {
    console.error('Debug connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
