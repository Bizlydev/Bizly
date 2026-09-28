import{supabase}from'../lib/supabase';
export async function listTasks(workspaceId:string){return supabase.from('tasks').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false});}
