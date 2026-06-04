// Generates data/brands.ts. Run with: npm run gen:brands
//
// A hand-curated CORE of iconic brands (with full multi-colour palettes) is
// always included. On top of that we pull single brand colours from
// simple-icons for breadth, skipping near-black / near-white / grey logos
// (a black swatch isn't guessable) and anything already in CORE.
import * as icons from "simple-icons";
import { writeFileSync } from "node:fs";

// ---- curated core: name -> { category, colors } ---------------------------
const CORE = {
  Google: { c: "tech", k: ["#4285F4", "#EA4335", "#FBBC05", "#34A853"] },
  Microsoft: { c: "tech", k: ["#F25022", "#7FBA00", "#00A4EF", "#FFB900"] },
  Instagram: { c: "tech", k: ["#F58529", "#DD2A7B", "#8134AF", "#515BD4"] },
  Slack: { c: "tech", k: ["#36C5F0", "#2EB67D", "#ECB22E", "#E01E5A"] },
  Firefox: { c: "tech", k: ["#FF7139", "#B833E1", "#FFCB39"] },
  TikTok: { c: "tech", k: ["#000000", "#25F4EE", "#FE2C55"] },
  Snapchat: { c: "tech", k: ["#FFFC00", "#000000"] },
  WhatsApp: { c: "tech", k: ["#25D366", "#075E54"] },
  Android: { c: "tech", k: ["#3DDC84", "#073042"] },
  YouTube: { c: "tech", k: ["#FF0000", "#FFFFFF", "#282828"] },
  Spotify: { c: "tech", k: ["#1DB954", "#191414"] },
  Netflix: { c: "media", k: ["#E50914", "#221F1F"] },
  Twitch: { c: "tech", k: ["#9146FF", "#FFFFFF"] },
  Discord: { c: "tech", k: ["#5865F2", "#FFFFFF"] },
  Reddit: { c: "tech", k: ["#FF4500", "#FFFFFF"] },
  Pinterest: { c: "tech", k: ["#BD081C", "#FFFFFF"] },
  "Coca-Cola": { c: "food & drink", k: ["#F40009", "#FFFFFF"] },
  Pepsi: { c: "food & drink", k: ["#004B93", "#EB1933", "#FFFFFF"] },
  "McDonald's": { c: "food & drink", k: ["#FFC72C", "#DA291C"] },
  "Burger King": { c: "food & drink", k: ["#D62300", "#0033A0", "#FFA000"] },
  Starbucks: { c: "food & drink", k: ["#00704A", "#FFFFFF"] },
  "Red Bull": { c: "food & drink", k: ["#001489", "#DB0A40", "#FFC906"] },
  Heineken: { c: "food & drink", k: ["#008200", "#ED1C24"] },
  Cadbury: { c: "food & drink", k: ["#4E2A84", "#FFFFFF"] },
  IKEA: { c: "retail", k: ["#0058A3", "#FFDA1A"] },
  LEGO: { c: "retail", k: ["#DA291C", "#FFCF00", "#000000"] },
  eBay: { c: "retail", k: ["#E53238", "#0064D2", "#F5AF02", "#86B817"] },
  "Tiffany & Co.": { c: "retail", k: ["#0ABAB5", "#FFFFFF"] },
  Barbie: { c: "retail", k: ["#E0218A", "#FFFFFF"] },
  Ferrari: { c: "automotive", k: ["#FF2800", "#FFF200", "#000000"] },
  BMW: { c: "automotive", k: ["#0066B1", "#FFFFFF", "#000000"] },
  Visa: { c: "finance", k: ["#1A1F71", "#F7B600"] },
  Mastercard: { c: "finance", k: ["#EB001B", "#FF5F00", "#F79E1B"] },
  PayPal: { c: "finance", k: ["#003087", "#0070E0"] },
  FedEx: { c: "logistics", k: ["#4D148C", "#FF6600"] },
  UPS: { c: "logistics", k: ["#351C15", "#FFB500"] },
  DHL: { c: "logistics", k: ["#FFCC00", "#D40511"] },
  Shell: { c: "energy", k: ["#FBCE07", "#DD1D21"] },
  PlayStation: { c: "gaming", k: ["#003791", "#0070D1"] },
  Xbox: { c: "gaming", k: ["#107C10", "#FFFFFF"] },
  Nintendo: { c: "gaming", k: ["#E60012", "#FFFFFF"] },
  Amazon: { c: "retail", k: ["#FF9900", "#232F3E"] },
  Walmart: { c: "retail", k: ["#0071CE", "#FFC220"] },
  Gucci: { c: "retail", k: ["#006341", "#BE1E2D"] },
  Sprite: { c: "food & drink", k: ["#008C44", "#FFFFFF"] },
  Fanta: { c: "food & drink", k: ["#FF8200", "#0033A0"] },
  Subway: { c: "food & drink", k: ["#008C15", "#FFC600"] },
  "Domino's": { c: "food & drink", k: ["#E31837", "#006491", "#FFFFFF"] },
  "Dunkin'": { c: "food & drink", k: ["#FF671F", "#DA1884"] },
  Heinz: { c: "food & drink", k: ["#E40521", "#FFFFFF"] },
  "Lay's": { c: "food & drink", k: ["#EAB300", "#E4002B"] },
  Gatorade: { c: "food & drink", k: ["#F47C20", "#00A859"] },
  "7-Eleven": { c: "retail", k: ["#F47B20", "#008061", "#EE1C25"] },
};

// ---- breadth: names to pull single colours from simple-icons --------------
const GROUPS = {
  tech: [
    "Google Chrome", "Opera", "Brave", "Telegram", "Signal", "Zoom", "Skype",
    "SoundCloud", "Dropbox", "GitHub", "GitLab", "Stack Overflow", "Notion",
    "Trello", "Figma", "Canva", "WordPress", "Shopify", "Cloudflare", "Stripe",
    "Salesforce", "Oracle", "IBM", "Intel", "AMD", "NVIDIA", "Qualcomm",
    "Samsung", "Sony", "LG", "Huawei", "Xiaomi", "OnePlus", "Dell", "HP",
    "Lenovo", "Asus", "Razer", "Logitech", "Steam", "Unity", "Roblox", "EA",
    "Ubisoft", "Meta", "Threads", "Vimeo", "WeChat", "Line", "Viber",
    "Airbnb", "Uber", "Lyft", "Duolingo", "Mailchimp", "Patreon", "Kickstarter",
    "Dribbble", "Behance", "Flickr", "Tumblr", "Substack", "Robinhood",
    "Webflow", "Firebase", "Asana", "Atlassian", "Zapier", "Twilio",
    "Deliveroo", "Grammarly", "Evernote", "Zalando",
  ],
  "food & drink": [
    "Sprite", "Fanta", "KFC", "Subway", "Domino's", "Pizza Hut", "Taco Bell",
    "Chipotle", "Nestle", "Budweiser", "Carlsberg", "Guinness", "Monster",
    "Lidl", "Hershey",
  ],
  retail: [
    "Nike", "Adidas", "Puma", "Zara", "H&M", "Uniqlo", "Gucci", "Rolex",
    "Walmart", "Target", "Aldi", "Etsy", "AliExpress", "Alibaba", "Amazon",
    "MediaMarkt",
  ],
  automotive: [
    "Toyota", "Honda", "Ford", "Audi", "Mercedes", "Volkswagen", "Porsche",
    "Lamborghini", "Tesla", "Nissan", "Hyundai", "Kia", "Volvo", "Jeep",
    "Subaru", "Mazda", "Renault", "Peugeot", "Fiat", "Mini", "Bugatti",
    "Maserati", "Jaguar",
  ],
  finance: [
    "American Express", "Revolut", "Wise", "Coinbase", "Binance", "Bitcoin",
    "Ethereum", "Klarna",
  ],
  media: ["HBO", "IMDb", "MTV", "BBC", "CNN", "Paramount"],
  travel: ["Booking.com", "Expedia", "Lufthansa", "Ryanair"],
};

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

const map = new Map();
for (const v of Object.values(icons)) {
  if (v && typeof v === "object" && typeof v.title === "string" && typeof v.hex === "string") {
    if (!map.has(norm(v.title))) map.set(norm(v.title), v);
    if (v.slug && !map.has(norm(v.slug))) map.set(norm(v.slug), v);
  }
}

function tooExtreme(hex) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const grayish = Math.max(r, g, b) - Math.min(r, g, b) < 18;
  return grayish && (Math.max(r, g, b) < 28 || Math.min(r, g, b) > 232);
}

const out = [];
const seen = new Set();

for (const [name, { c, k }] of Object.entries(CORE)) {
  out.push({ name, category: c, colors: k });
  seen.add(norm(name));
}

const misses = [];
for (const [category, names] of Object.entries(GROUPS)) {
  for (const name of names) {
    if (seen.has(norm(name))) continue;
    const hit = map.get(norm(name));
    if (!hit) {
      misses.push(name);
      continue;
    }
    if (tooExtreme(hit.hex)) continue;
    seen.add(norm(name));
    out.push({ name: hit.title, category, colors: ["#" + hit.hex.toUpperCase()] });
  }
}

out.sort((a, b) => a.name.localeCompare(b.name));

const body = out
  .map(
    (b) =>
      `  { name: ${JSON.stringify(b.name)}, category: ${JSON.stringify(b.category)}, colors: [${b.colors
        .map((c) => JSON.stringify(c))
        .join(", ")}] },`,
  )
  .join("\n");

const file = `// AUTO-GENERATED by scripts/gen-brands.mjs — do not edit by hand.
// Curated multi-colour core + single brand colours pulled from simple-icons.
export type BrandEntry = { name: string; category: string; colors: string[] };

export const BRANDS: BrandEntry[] = [
${body}
];
`;

writeFileSync(new URL("../data/brands.ts", import.meta.url), file);
console.log(`wrote data/brands.ts with ${out.length} brands`);
if (misses.length) console.log(`(${misses.length} not in simple-icons: ${misses.join(", ")})`);
