import{supabase}from'../lib/supabase';
export async function listSales(workspaceId:string){return supabase.from('sales').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false});}
