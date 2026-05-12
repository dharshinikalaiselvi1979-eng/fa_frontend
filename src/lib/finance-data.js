import {
  Utensils,
  Car,
  Film,
  Zap,
  Heart,
  ShoppingBag,
  GraduationCap,
  Receipt,
} from "lucide-react";

export const CATEGORIES = {
  food: {
    label: "Food",
    icon: Utensils,
    color: "bg-orange-500",
    hsl: "24 95% 53%",
  },
  travel: {
    label: "Travel",
    icon: Car,
    color: "bg-blue-500",
    hsl: "217 91% 60%",
  },
  entertainment: {
    label: "Entertainment",
    icon: Film,
    color: "bg-purple-500",
    hsl: "271 91% 65%",
  },
  utilities: {
    label: "Utilities",
    icon: Zap,
    color: "bg-yellow-500",
    hsl: "48 96% 53%",
  },
  health: {
    label: "Health",
    icon: Heart,
    color: "bg-pink-500",
    hsl: "330 81% 60%",
  },
  shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    color: "bg-emerald-500",
    hsl: "160 84% 39%",
  },
  education: {
    label: "Education",
    icon: GraduationCap,
    color: "bg-indigo-500",
    hsl: "239 84% 67%",
  },
  bills: {
    label: "Bills",
    icon: Receipt,
    color: "bg-rose-500",
    hsl: "350 89% 60%",
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);

export const formatINR = (n) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

// Simple keyword based AI categorizer
export function autoCategorize(title) {
  const t = title.toLowerCase();
  const map = [
    [
      /swiggy|zomato|restaurant|cafe|food|pizza|burger|dominos|kfc|mcdonald/i,
      "food",
    ],
    [/uber|ola|metro|train|flight|petrol|fuel|bus|cab/i, "travel"],
    [/netflix|spotify|movie|cinema|prime|hotstar|game/i, "entertainment"],
    [/electricity|water|gas|wifi|internet|broadband/i, "utilities"],
    [/pharmacy|hospital|doctor|medicine|gym|health/i, "health"],
    [/amazon|flipkart|myntra|shop|mall|store/i, "shopping"],
    [/course|udemy|coursera|book|college|tuition/i, "education"],
    [/rent|emi|loan|insurance|bill/i, "bills"],
  ];
  for (const [re, cat] of map) if (re.test(t)) return cat;
  return "shopping";
}

const today = new Date();
const d = (offset) => {
  const x = new Date(today);
  x.setDate(x.getDate() - offset);
  return x.toISOString();
};

export const SEED_EXPENSES = [
  {
    id: "1",
    title: "Swiggy Order",
    amount: 450,
    category: "food",
    date: d(0),
    source: "manual",
  },
  {
    id: "2",
    title: "Uber Ride",
    amount: 280,
    category: "travel",
    date: d(1),
    source: "manual",
  },
  {
    id: "3",
    title: "Netflix",
    amount: 199,
    category: "entertainment",
    date: d(2),
    source: "manual",
  },
  {
    id: "4",
    title: "Amazon Headphones",
    amount: 1899,
    category: "shopping",
    date: d(3),
    source: "manual",
  },
  {
    id: "5",
    title: "Electricity Bill",
    amount: 1240,
    category: "utilities",
    date: d(4),
    source: "manual",
  },
  {
    id: "6",
    title: "Pharmacy",
    amount: 320,
    category: "health",
    date: d(5),
    source: "manual",
  },
  {
    id: "7",
    title: "Udemy Course",
    amount: 499,
    category: "education",
    date: d(7),
    source: "manual",
  },
  {
    id: "8",
    title: "Rent",
    amount: 8000,
    category: "bills",
    date: d(10),
    source: "manual",
  },
  {
    id: "9",
    title: "Zomato",
    amount: 380,
    category: "food",
    date: d(11),
    source: "manual",
  },
  {
    id: "10",
    title: "Metro Card",
    amount: 200,
    category: "travel",
    date: d(12),
    source: "manual",
  },
  {
    id: "11",
    title: "Spotify",
    amount: 119,
    category: "entertainment",
    date: d(15),
    source: "manual",
  },
  {
    id: "12",
    title: "Myntra T-Shirt",
    amount: 799,
    category: "shopping",
    date: d(18),
    source: "manual",
  },
];

export const BANK_TRANSACTIONS = {
  SBI: [
    { title: "Swiggy", amount: 450, category: "food" },
    { title: "Uber", amount: 300, category: "travel" },
    { title: "Amazon", amount: 1200, category: "shopping" },
  ],
  HDFC: [
    { title: "Zomato", amount: 520, category: "food" },
    { title: "BookMyShow", amount: 350, category: "entertainment" },
    { title: "Flipkart", amount: 2299, category: "shopping" },
  ],
  ICICI: [
    { title: "Ola", amount: 220, category: "travel" },
    { title: "Pharmeasy", amount: 480, category: "health" },
  ],
  Axis: [
    { title: "Electricity Bill", amount: 1340, category: "utilities" },
    { title: "Coursera", amount: 999, category: "education" },
  ],
};
