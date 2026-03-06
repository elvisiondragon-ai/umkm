import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let env = '';
try { env = fs.readFileSync('.env.local', 'utf8'); } catch(e) {}
if (!env) {
  try { env = fs.readFileSync('.env', 'utf8'); } catch(e) {}
}

const envMap = {};
env.split('
').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k) envMap[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
});

const supabaseUrl = envMap['VITE_SUPABASE_URL'];
const supabaseKey = envMap['VITE_SUPABASE_SERVICE_ROLE_KEY'] || envMap['SUPABASE_SERVICE_ROLE_KEY']; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: soto_orders, error: e1 } = await supabase
    .from('stores_orders')
    .select('id, store_id, customer, customer_email, items')
    .eq('customer_email', 'soto@yahoo.com')
    .order('created_at', { ascending: false });
  console.log("Orders by soto@yahoo.com:", soto_orders || e1);

  const { data: all_orders } = await supabase.from('stores_orders').select('id, store_id, customer, customer_email').order('created_at', {ascending: false}).limit(10);
  console.log("Latest 10 orders:", all_orders);

  // Check soto's store
  const { data: soto_stores } = await supabase.from('stores').select('*').eq('user_email', 'soto@yahoo.com');
  console.log("Soto's stores:", soto_stores);
}
run();