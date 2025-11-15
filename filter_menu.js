const fs = require('fs');
const path = require('path');

const IN = path.join(__dirname, 'menuItems.json');
const OUT = path.join(__dirname, 'menuItems.filtered.json');

function lc(s){return (s||'').toString().toLowerCase();}

const EXCLUDE_TERMS = [
  'cereal','cereals','granola','oatmeal','muesli','granola bar','cereal bar',
  'sauce','sauces','gravy','marinade','marinades','dressing','dressings',
  'condiment','condiments','ketchup','mustard','relish','jam','jelly','syrup',
  'topping','toppings','pickle','pickles'
];

function looksExcluded(item){
  const name = lc(item.itemName || item.name || '');
  const ingredients = lc(item.ingredients || '');
  const category = lc(item.category || item.station || '');
  for(const term of EXCLUDE_TERMS){
    if(name.includes(term) || ingredients.includes(term) || category.includes(term)) return true;
  }
  return false;
}

try{
  const raw = fs.readFileSync(IN, 'utf8');
  const arr = JSON.parse(raw);
  const removed = [];
  const kept = [];
  for(const it of arr){
    if(looksExcluded(it)) removed.push(it);
    else kept.push(it);
  }
  fs.writeFileSync(OUT, JSON.stringify(kept, null, 2), 'utf8');
  console.log(`Total items: ${arr.length}`);
  console.log(`Kept items:  ${kept.length}`);
  console.log(`Removed items: ${removed.length}`);
  console.log(`Wrote ${OUT}`);
  if(removed.length>0){
    console.log('\nFirst 20 removed item names:');
    removed.slice(0,20).forEach((r,i)=>{
      const n = r.itemName || r.name || '<no name>';
      console.log(`${i+1}. ${n}`);
    });
  }
}catch(err){
  console.error('Error filtering menu items:', err.message);
  process.exit(2);
}
