import{supabase}from'../lib/supabase';
export async function listCustomers(workspaceId:string){return supabase.from('customers').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false});}
