import{supabase}from'../lib/supabase';
export async function listDebts(workspaceId:string){return supabase.from('debts').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false});}
