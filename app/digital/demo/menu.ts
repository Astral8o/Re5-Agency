// Fictional business for the RE5 Digital demo. Not a real restaurant.

export type Item = {
  id: string;
  name: string;
  desc: string;
  price: number; // TT$
  emoji: string;
  tags?: ("Popular" | "Spicy" | "Vegetarian" | "House special")[];
  soldOut?: boolean;
};
export type Category = { id: string; name: string; items: Item[] };

export const BUSINESS = {
  name: "Kiskadee Bar & Kitchen",
  tagline: "Local flavours, cold drinks and good vibes by the water.",
  area: "Western Main Road, Chaguaramas",
  hours: [
    ["Mon to Thu", "11:00 am to 10:00 pm"],
    ["Fri & Sat", "11:00 am to 12:00 am"],
    ["Sunday", "12:00 pm to 9:00 pm"],
  ] as const,
  phone: "+1 868 000 0000",
};

export const MENU: Category[] = [
  {
    id: "starters",
    name: "Starters",
    items: [
      { id: "pholourie", name: "Pholourie", desc: "Golden split-pea fritters with tamarind and mango chutney.", price: 35, emoji: "🧆", tags: ["Vegetarian", "Popular"] },
      { id: "accra", name: "Saltfish Accra", desc: "Crispy saltfish fritters with a chadon beni dip.", price: 45, emoji: "🐟" },
      { id: "wings", name: "Tamarind Wings", desc: "Six wings glazed in sweet and spicy tamarind sauce.", price: 75, emoji: "🍗", tags: ["Spicy", "Popular"] },
      { id: "corn-soup", name: "Corn Soup", desc: "Hearty split-pea corn soup with dumplings and corn on the cob.", price: 40, emoji: "🥣" },
    ],
  },
  {
    id: "mains",
    name: "Mains",
    items: [
      { id: "bake-shark", name: "Bake & Shark", desc: "Fried bake with seasoned shark, salad and all the sauces.", price: 75, emoji: "🥙", tags: ["House special", "Popular"] },
      { id: "curry-duck", name: "Curry Duck & Roti", desc: "Slow-cooked curry duck with buss-up-shut roti.", price: 110, emoji: "🍛", tags: ["Spicy"] },
      { id: "pelau", name: "Chicken Pelau", desc: "One-pot rice, pigeon peas and caramelised chicken, with coleslaw.", price: 85, emoji: "🍚" },
      { id: "kingfish", name: "Grilled Kingfish", desc: "Kingfish steak with garlic butter, provision and steamed veg.", price: 140, emoji: "🐠" },
      { id: "channa-aloo", name: "Curry Channa & Aloo", desc: "Chickpea and potato curry with dhalpuri roti.", price: 70, emoji: "🫓", tags: ["Vegetarian"] },
      { id: "sunday-lunch", name: "Sunday Lunch Plate", desc: "Stew chicken, macaroni pie, callaloo, rice and peas. Sundays only.", price: 95, emoji: "🍽️", soldOut: true },
    ],
  },
  {
    id: "sides",
    name: "Sides",
    items: [
      { id: "mac-pie", name: "Macaroni Pie", desc: "Baked, cheesy and generous.", price: 25, emoji: "🧀", tags: ["Vegetarian"] },
      { id: "plantain", name: "Fried Plantain", desc: "Sweet ripe plantain, fried golden.", price: 20, emoji: "🍌", tags: ["Vegetarian"] },
      { id: "callaloo", name: "Callaloo", desc: "Dasheen bush, okra and coconut milk.", price: 25, emoji: "🥬", tags: ["Vegetarian"] },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    items: [
      { id: "rum-punch", name: "Kiskadee Rum Punch", desc: "Our house rum punch with fresh lime and bitters. 18+ only.", price: 55, emoji: "🍹", tags: ["House special"] },
      { id: "sorrel-cocktail", name: "Sorrel Spritz", desc: "Spiced sorrel, sparkling water and a splash of rum. 18+ only.", price: 60, emoji: "🍷" },
      { id: "beer", name: "Ice-Cold Local Beer", desc: "Ask about today's selection. 18+ only.", price: 25, emoji: "🍺", tags: ["Popular"] },
      { id: "coconut", name: "Fresh Coconut Water", desc: "Straight from the nut.", price: 25, emoji: "🥥" },
      { id: "mauby", name: "Mauby", desc: "Bittersweet and refreshing, served over ice.", price: 20, emoji: "🧋" },
      { id: "passion", name: "Passion Fruit Juice", desc: "Freshly made every morning.", price: 25, emoji: "🥤" },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    items: [
      { id: "sweetbread", name: "Coconut Sweet Bread", desc: "A warm slice with butter.", price: 25, emoji: "🍞", tags: ["Vegetarian"] },
      { id: "black-cake", name: "Black Cake", desc: "Rich, rum-soaked fruit cake.", price: 35, emoji: "🍰" },
      { id: "sugar-cake", name: "Sugar Cake", desc: "Coconut candy, pink and white.", price: 10, emoji: "🍬", tags: ["Vegetarian"] },
    ],
  },
];

export const tt = (n: number) => `TT$${n.toLocaleString("en-US")}`;
