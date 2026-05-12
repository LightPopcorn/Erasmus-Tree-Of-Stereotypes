import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://etmsieenthoajxofkhuc.supabase.co"
const supabaseAnonKey = "sb_publishable_kfwWxc6K5MTo_uHmRTDjXA_yj_o-Hai"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)