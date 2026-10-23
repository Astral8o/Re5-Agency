// Fictional business for the RE5 Digital demo. Not a real restaurant.

export type Item = {
  id: string;
  name: string;
  desc: string;
  price: number; // TT$
  emoji: string;
  photo?: boolean; // /digital/menu/<id>.webp exists
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

// Fictional bank details, shown when a customer picks bank deposit.
export const BANK = {
  bank: "Island Commercial Bank (demo)",
  accountName: "Kiskadee Bar & Kitchen Ltd",
  accountNo: "000 000 000 0",
  branch: "Chaguaramas",
};

export const MENU: Category[] = [
  {
    id: "starters",
    name: "Starters",
    items: [
      { id: "pholourie", photo: true, name: "Pholourie", desc: "Golden split-pea fritters with tamarind and mango chutney.", price: 35, emoji: "🧆", tags: ["Vegetarian", "Popular"] },
      { id: "accra", photo: true, name: "Saltfish Accra", desc: "Crispy saltfish fritters with a chadon beni dip.", price: 45, emoji: "🐟" },
      { id: "wings", photo: true, name: "Tamarind Wings", desc: "Six wings glazed in sweet and spicy tamarind sauce.", price: 75, emoji: "🍗", tags: ["Spicy", "Popular"] },
      { id: "corn-soup", photo: true, name: "Corn Soup", desc: "Hearty split-pea corn soup with dumplings and corn on the cob.", price: 40, emoji: "🥣" },
    ],
  },
  {
    id: "mains",
    name: "Mains",
    items: [
      { id: "bake-shark", photo: true, name: "Bake & Shark", desc: "Fried bake with seasoned shark, salad and all the sauces.", price: 75, emoji: "🥙", tags: ["House special", "Popular"] },
      { id: "curry-chicken", photo: true, name: "Curry Chicken & Roti", desc: "Curry chicken and potato with buss-up-shut roti and rice.", price: 110, emoji: "🍛", tags: ["Spicy"] },
      { id: "pelau", photo: true, name: "Chicken Pelau", desc: "One-pot rice, pigeon peas and caramelised chicken, with fresh salsa.", price: 85, emoji: "🍚" },
      { id: "kingfish", photo: true, name: "Grilled Kingfish", desc: "Char-grilled kingfish with fresh tomato salsa and lime.", price: 140, emoji: "🐠" },
      { id: "channa-aloo", photo: true, name: "Curry Channa & Aloo", desc: "Chickpea and potato curry with white rice.", price: 70, emoji: "🫓", tags: ["Vegetarian"] },
      { id: "sunday-lunch", name: "Sunday Lunch Plate", desc: "Stew chicken, macaroni pie, callaloo, rice and peas. Sundays only.", price: 95, emoji: "🍽️", soldOut: true },
    ],
  },
  {
    id: "sides",
    name: "Sides",
    items: [
      { id: "mac-pie", photo: true, name: "Macaroni Pie", desc: "Baked, cheesy and generous.", price: 25, emoji: "🧀", tags: ["Vegetarian"] },
      { id: "plantain", photo: true, name: "Fried Plantain", desc: "Sweet ripe plantain, fried golden.", price: 20, emoji: "🍌", tags: ["Vegetarian"] },
      { id: "callaloo", photo: true, name: "Callaloo", desc: "Dasheen bush, okra, coconut milk and salt beef.", price: 25, emoji: "🥬" },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    items: [
      { id: "rum-punch", photo: true, name: "Kiskadee Rum Punch", desc: "Our house rum punch with fresh lime and bitters. 18+ only.", price: 55, emoji: "🍹", tags: ["House special"] },
      { id: "sorrel-cocktail", photo: true, name: "Sorrel Spritz", desc: "Spiced sorrel, sparkling water and a splash of rum. 18+ only.", price: 60, emoji: "🍷" },
      { id: "beer", photo: true, name: "Ice-Cold Local Beer", desc: "Ask about today's selection. 18+ only.", price: 25, emoji: "🍺", tags: ["Popular"] },
      { id: "coconut", photo: true, name: "Fresh Coconut Water", desc: "Chilled and served over ice.", price: 25, emoji: "🥥" },
      { id: "mauby", photo: true, name: "Mauby", desc: "Bittersweet and refreshing, served over ice.", price: 20, emoji: "🧋" },
      { id: "passion", photo: true, name: "Passion Fruit Juice", desc: "Freshly made every morning.", price: 25, emoji: "🥤" },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    items: [
      { id: "sweetbread", photo: true, name: "Coconut Sweet Bread", desc: "A warm slice with butter.", price: 25, emoji: "🍞", tags: ["Vegetarian"] },
      { id: "black-cake", photo: true, name: "Black Cake", desc: "Rich, rum-soaked fruit cake.", price: 35, emoji: "🍰" },
      { id: "sugar-cake", photo: true, name: "Sugar Cake", desc: "Coconut candy, pink and white.", price: 10, emoji: "🍬", tags: ["Vegetarian"] },
    ],
  },
];

export const tt = (n: number) => `TT$${n.toLocaleString("en-US")}`;
