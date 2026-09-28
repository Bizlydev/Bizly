import{supabase}from'../lib/supabase';
export async function listReports(workspaceId:string){return supabase.from('reports').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false});}
