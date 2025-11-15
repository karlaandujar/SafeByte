const fs = require("fs");
const csv = require("csv-parser");

// Input CSV (your scraped dining data)
const INPUT = "vt_dining_allergy_nutrition.csv";

// Output JSON (you will import/use this anywhere)
const OUTPUT = "menuItems.json";

function parseAllergens(text) {
  if (!text) return [];
  return text
    .split(/[;,]/)
    .map(a => a.trim())
    .filter(a => a.length > 0);
}

const rows = [];
const seen = new Set();

fs.createReadStream(INPUT)
  .pipe(csv())
  .on("data", row => {
    const hall = row.hall_name;
    const item = row.item_name;
    const allergens = parseAllergens(row.allergens_inline);
    const ingredients = row.ingredients_text || "";

    if (!hall || !item) return;

    const key = `${hall}::${item}`;
    if (seen.has(key)) return;
    seen.add(key);

    rows.push({
      id: rows.length + 1,
      hallName: hall,
      itemName: item,
      allergens,
      ingredients
    });
  })
  .on("end", () => {
    fs.writeFileSync(OUTPUT, JSON.stringify(rows, null, 2), "utf8");
    console.log(`Created ${OUTPUT} with ${rows.length} items`);
  });
