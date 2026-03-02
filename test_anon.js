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
const supabaseKey = envMap['VITE_SUPABASE_ANON_KEY']; // ANON KEY
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const email = "dragon@yahoo.com";
  console.log("Checking orders for:", email);
  
  const { data, error } = await supabase
    .from('stores_orders')
    .select('id, store_id, customer_email')
    .eq('customer_email', email)
    .limit(5);

  console.log("Error:", error);
  console.log("Data:", data);
  
  const { data: reviews, error: rErr } = await supabase
    .from('stores_reviews')
    .select('id, order_id, product_id, reviewer_name')
    .limit(5);
    
  console.log("Reviews Error:", rErr);
  console.log("Reviews Data:", reviews);
}

check();
