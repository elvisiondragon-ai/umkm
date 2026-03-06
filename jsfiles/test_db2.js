import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let env = '';
try { env = fs.readFileSync('.env.local', 'utf8'); } catch(e) {}
if (!env) {
  try { env = fs.readFileSync('.env', 'utf8'); } catch(e) {}
}

const envMap = {};
env.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k) envMap[k.trim()] = v.join('=').trim().replace(/['"]/g, '');
});

const supabaseUrl = envMap['VITE_SUPABASE_URL'];
// USE SERVICE ROLE KEY to bypass RLS
const supabaseKey = envMap['SUPABASE_SERVICE_ROLE_KEY']; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: o1 } = await supabase.from('stores_orders').select('id, store_id, customer, customer_email').in('id', [1, 3, 4, 7]);
  console.log("Orders 1,3,4,7:", o1);

  const { data: o17 } = await supabase.from('stores_orders').select('id, store_id, customer, customer_email').eq('id', 17);
  console.log("Order 17:", o17);
  
  if (o1 && o17 && o1.length > 0 && o17.length > 0) {
    console.log("Are store IDs same?", o1[0].store_id === o17[0].store_id);
    const { data: s17 } = await supabase.from('stores').select('id, user_id, name').eq('id', o17[0].store_id);
    console.log("Store 17 info:", s17);
    const { data: s1 } = await supabase.from('stores').select('id, user_id, name').eq('id', o1[0].store_id);
    console.log("Store 1 info:", s1);
  }
}

check();
