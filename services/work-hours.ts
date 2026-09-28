import{supabase}from'../lib/supabase';
export async function listWorkHours(workspaceId:string){return supabase.from('work_hours').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false});}
