import { supabaseAdmin } from '../supabase';
import { ClerkUser } from '../auth';

export interface Client {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  total_spent: number;
  total_debt: number;
  created_at: string;
  updated_at: string;
}

/**
 * Upsert a client from Clerk user data
 * Creates client if not exists, updates if exists
 */
export async function upsertClientFromClerkUser(user: ClerkUser): Promise<Client> {
  const { userId, email, firstName, lastName } = user;
  
  // Generate name from first/last name or email
  const name = [firstName, lastName].filter(Boolean).join(' ') || 
               email.split('@')[0] || 
               'Customer';

  // Check if client already exists
  const { data: existingClient, error: fetchError } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch client: ${fetchError.message}`);
  }

  if (existingClient) {
    // Update existing client if needed
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('clients')
      .update({
        name,
        email,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingClient.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update client: ${updateError.message}`);
    }

    return updatedClient;
  } else {
    // Create new client
    const { data: newClient, error: insertError } = await supabaseAdmin
      .from('clients')
      .insert({
        clerk_user_id: userId,
        name,
        email,
        phone: '',
        address: '',
        payment_terms: 'on_delivery',
        total_spent: 0,
        total_debt: 0
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create client: ${insertError.message}`);
    }

    return newClient;
  }
}

/**
 * Get client by Clerk user ID
 */
export async function getClientByClerkUserId(clerkUserId: string): Promise<Client | null> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Client not found
    }
    throw new Error(`Failed to fetch client: ${error.message}`);
  }

  return data;
}

/**
 * Get client orders for dashboard stats
 */
export async function getClientOrders(clientId: string) {
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      status,
      total_price,
      created_at,
      order_items (
        id,
        quantity,
        price,
        product:products (
          id,
          brand,
          model,
          storage
        )
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return orders || [];
}
