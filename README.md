SafeByte Food Allergen & Risk Information
A web application for Virginia Tech’s dining halls that analyzes menu items for food allergens and cross-contact risks. The site helps students and staff quickly assess the risk level for each dish and make safer dining choices.

Features
Interactive menu for campus dining halls.

Risk scores and categories (Low, Medium, High) based on allergen severity and hazard keywords.

Prominent highlighting of major allergens in ingredient lists.

Searchable and filterable by dining hall, risk level, and item name.

Automatically processes structured data from a JSON source.

How It Works
Data Source:
Menu items are stored in menuItems.json, with fields for item name, allergens, ingredients, and dining hall.

Scoring Logic:
Each item is scored using a weighted system—major allergens (like peanuts, tree nuts, milk, eggs, wheat, soy, sesame, fish, shellfish) and cross-contamination warnings increase the score.

Risk Display:
Items are labeled Low, Medium, or High risk based on their computed score, with major allergens highlighted for visibility.

Intended Use
For students, staff, and visitors seeking quick allergen info in Virginia Tech dining halls.

Provides automated detection of common allergens and risk factors.

Improves food safety awareness and offers actionable info before eating.

Disclaimer
Informational only: Always check with dining staff about allergens in food products.

Automated scoring may not match real-world risks exactly, and new information or recipe changes may not be immediately reflected.

Individuals with severe allergies should use this site as a guide, not the sole basis for dining decisions.

Technical Info
Built with JavaScript, HTML, and CSS.

Hosted via GitHub Pages: https://karlaandujar.github.io/SafeByte/

Core data and logic live in menuItems.json and index.html.

Allergen weights and risk calculations are transparent and fully open source.

Contributing
Found an issue or want to add new menu data?
Fork the repo and open a pull request, or raise an issue for discussion.