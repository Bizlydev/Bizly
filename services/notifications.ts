import{supabase}from'../lib/supabase';
export async function listNotifications(workspaceId:string){return supabase.from('notifications').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false});}
