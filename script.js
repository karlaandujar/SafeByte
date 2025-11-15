
// ---------- CONFIG ----------

// Allergen severity weights
const ALLERGEN_WEIGHTS = {
  peanuts: 10,
  peanut: 10,
  "tree nuts": 8,
  "tree nut": 8,
  treenuts: 8,
  shellfish: 8,
  "shell fish": 8,
  fish: 6,
  eggs: 5,
  egg: 5,
  milk: 5,
  dairy: 5,
  soy: 4,
  soybeans: 4,
  wheat: 4,
  gluten: 4,
  sesame: 5
};

// Hazard keywords in ingredient text
const HAZARD_KEYWORDS = [
  { pattern: "may contain", weight: 10 },
  { pattern: "made in a facility that also processes", weight: 8 },
  { pattern: "processed in a facility that also handles", weight: 8 },
  { pattern: "shared fryer", weight: 12 },
  { pattern: "same fryer", weight: 12 },
  { pattern: "same equipment", weight: 12 },
  { pattern: "cross contamination", weight: 12 },
  { pattern: "cross-contamination", weight: 12 },
  { pattern: "cannot guarantee", weight: 8 }
];

// Terms to highlight in ingredients
const HIGHLIGHT_TERMS = [
  "peanut", "tree nut", "nut", "gluten", "wheat", "milk",
  "egg", "soy", "shellfish", "fish", "sesame", "dairy"
];

// ---------- SCORING LOGIC ----------

function lc(str) {
  return (str || "").toString().toLowerCase();
}

function computeAllergenScore(allergens) {
  let score = 0;
  (allergens || []).forEach(a => {
    const key = lc(a).trim();
    if (ALLERGEN_WEIGHTS[key] != null) {
      score += ALLERGEN_WEIGHTS[key];
    } else if (key.length > 0) {
      // unknown allergen gets small default weight
      score += 3;
    }
  });
  return score;
}

function computeIngredientHazardScore(ingredients) {
  const text = lc(ingredients || "");
  let score = 0;
  HAZARD_KEYWORDS.forEach(({ pattern, weight }) => {
    if (text.includes(pattern)) {
      score += weight;
    }
  });
  return score;
}

function computeItemRisk(item) {
  const allergenScore = computeAllergenScore(item.allergens);
  const hazardScore = computeIngredientHazardScore(item.ingredients);
  let rawScore = allergenScore + hazardScore;

  if (rawScore > 100) rawScore = 100;
  if (rawScore < 0) rawScore = 0;

  let riskCategory;
  if (rawScore <= 30) riskCategory = "Low Risk";
  else if (rawScore <= 60) riskCategory = "Medium Risk";
  else riskCategory = "High Risk";

  return { rawScore, riskCategory, allergenScore, hazardScore };
}

function computeHallRisk(items) {
  const grouped = {};

  items.forEach(it => {
    const hall = it.hallName || "Unknown Hall";
    if (!grouped[hall]) {
      grouped[hall] = { hallName: hall, items: [], totalScore: 0 };
    }
    grouped[hall].items.push(it);
    grouped[hall].totalScore += it.risk.rawScore;
  });

  return Object.values(grouped).map(h => {
    const count = h.items.length || 1;
    const avg = h.totalScore / count;
    let category;
    if (avg <= 30) category = "Low Risk";
    else if (avg <= 60) category = "Medium Risk";
    else category = "High Risk";

    return {
      hallName: h.hallName,
      averageScore: Math.round(avg),
      hallCategory: category,
      items: h.items
    };
  });
}

// ---------- UI HELPERS ----------

function createBadge(category, score) {
  const span = document.createElement("span");
  span.classList.add("badge");
  if (category === "Low Risk") span.classList.add("low");
  else if (category === "Medium Risk") span.classList.add("medium");
  else if (category === "High Risk") span.classList.add("high");

  span.textContent = `${category} (${Math.round(score)}/100)`;
  return span;
}

function highlightIngredients(text) {
  if (!text) return "";
  let result = text;
  HIGHLIGHT_TERMS.forEach(term => {
    const regex = new RegExp(`(${term})`, "gi");
    result = result.replace(regex, "<mark>$1</mark>");
  });
  return result;
}

// ---------- MAIN APP LOGIC ----------

let allItems = [];
let itemsWithRisk = [];
let hallSummaries = [];

const searchInput = document.getElementById("search");
const hallFilterSelect = document.getElementById("hallFilter");
const riskFilterSelect = document.getElementById("riskFilter");
const hallOverviewDiv = document.getElementById("hallOverview");
const itemListDiv = document.getElementById("itemList");
const itemCountSpan = document.getElementById("itemCount");

function renderHallOverview() {
  hallOverviewDiv.innerHTML = "";
  hallSummaries.forEach(hall => {
    const card = document.createElement("div");
    card.className = "hall-card";

    const name = document.createElement("div");
    name.className = "hall-name";
    name.textContent = hall.hallName;

    const badge = createBadge(hall.hallCategory, hall.averageScore);

    const stats = document.createElement("div");
    stats.className = "muted";
    stats.textContent = `${hall.items.length} items analyzed`;

    card.appendChild(name);
    card.appendChild(badge);
    card.appendChild(stats);

    hallOverviewDiv.appendChild(card);
  });
}

function renderItems() {
  const search = (searchInput.value || "").toLowerCase();
  const hallFilter = hallFilterSelect.value;
  const riskFilter = riskFilterSelect.value;

  const filtered = itemsWithRisk.filter(item => {
    const matchesSearch =
      !search ||
      item.itemName.toLowerCase().includes(search);

    const matchesHall =
      hallFilter === "all" || item.hallName === hallFilter;

    const matchesRisk =
      riskFilter === "all" || item.risk.riskCategory === riskFilter;

    return matchesSearch && matchesHall && matchesRisk;
  });

  itemCountSpan.textContent = `${filtered.length} items shown`;

  itemListDiv.innerHTML = "";

  if (filtered.length === 0) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No items match your filters.";
    itemListDiv.appendChild(p);
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    const header = document.createElement("div");
    header.className = "item-header";

    const left = document.createElement("div");
    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = item.itemName;

    const hall = document.createElement("div");
    hall.className = "item-hall";
    hall.textContent = item.hallName;

    left.appendChild(name);
    left.appendChild(hall);

    const badge = createBadge(item.risk.riskCategory, item.risk.rawScore);

    header.appendChild(left);
    header.appendChild(badge);

    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = `Allergen severity: ${item.risk.allergenScore} · Hazard score: ${item.risk.hazardScore}`;

    const allergensDiv = document.createElement("div");
    allergensDiv.innerHTML =
      `<span class="item-section-title">Allergens:</span> ` +
      (item.allergens && item.allergens.length
        ? item.allergens.join(", ")
        : "<span class='muted'>None listed</span>");

    const ingredientsDiv = document.createElement("div");
    ingredientsDiv.innerHTML =
      `<span class="item-section-title">Ingredients:</span> ` +
      `<span>${highlightIngredients(item.ingredients)}</span>`;

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(allergensDiv);
    card.appendChild(ingredientsDiv);

    itemListDiv.appendChild(card);
  });
}

function populateHallFilter() {
  const halls = Array.from(new Set(allItems.map(i => i.hallName))).sort();
  halls.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = h;
    hallFilterSelect.appendChild(opt);
  });
}

// Event listeners
searchInput.addEventListener("input", renderItems);
hallFilterSelect.addEventListener("change", renderItems);
riskFilterSelect.addEventListener("change", renderItems);

// ---------- LOAD DATA ----------

fetch("menuItems.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load menuItems.json");
    return res.json();
  })
  .then(data => {
    allItems = data || [];
    itemsWithRisk = allItems.map(item => ({
      ...item,
      risk: computeItemRisk(item)
    }));
    hallSummaries = computeHallRisk(itemsWithRisk);
    populateHallFilter();
    renderHallOverview();
    renderItems();
  })
  .catch(err => {
    console.error("Error loading data:", err);
    itemListDiv.innerHTML =
      "<p class='muted'>Failed to load menu items. Check the console for details.</p>";
  });


