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

const supabase = createClient(envMap['VITE_SUPABASE_URL'], envMap['SUPABASE_SERVICE_ROLE_KEY']);

async function check() {
  const { data } = await supabase.from('stores_reviews').select('*').order('created_at', { ascending: false }).limit(3);
  console.log(JSON.stringify(data, null, 2));
}

check();
