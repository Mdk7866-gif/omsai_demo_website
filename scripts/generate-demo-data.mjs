// Deterministic fictional fixtures. Run only to deliberately regenerate the editable JSON files.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const root = join(process.cwd(), "dummy_data");
mkdirSync(root, { recursive: true });
const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const DAY = "2026-10-14";
const nextDate = (date, days = 1) =>
  new Date(Date.parse(date + "T12:00:00Z") + days * 86400000)
    .toISOString()
    .slice(0, 10);
const productDefs = [
  ["Urea 45 kg", "IFFCO", "Fertilizers", "bags", 245, 270, 4],
  ["DAP 50 kg", "Coromandel", "Fertilizers", "bags", 1220, 1350, 42],
  ["Cotton Seeds BG-II 450 g", "Mahyco", "Seeds", "packets", 710, 850, 7],
  ["Bio Pesticide 500 ml", "Bayer", "Pesticides", "bottles", 330, 450, 6],
  ["Paddy Seeds BPT 5204 25 kg", "Nuziveedu", "Seeds", "bags", 1420, 1650, 36],
  ["Neem Oil 1 L", "Multiplex", "Pesticides", "bottles", 270, 380, 18],
  ["NPK 19:19:19 1 kg", "Coromandel", "Fertilizers", "packets", 145, 190, 64],
  ["MOP 50 kg", "IPL", "Fertilizers", "bags", 1510, 1700, 22],
  ["Chilli Seeds Teja 10 g", "Syngenta", "Seeds", "packets", 365, 480, 8],
  ["Imidacloprid 100 ml", "Bayer", "Pesticides", "bottles", 135, 185, 31],
  ["Groundnut Seeds K6 30 kg", "AP Seeds", "Seeds", "bags", 2250, 2700, 27],
  ["Paddy Seeds Loose", "AP Seeds", "Seeds", "kg", 42, 55, 125.5],
  ["Super Phosphate 50 kg", "Coromandel", "Fertilizers", "bags", 390, 470, 58],
  ["Zinc Sulphate 5 kg", "Multiplex", "Fertilizers", "bags", 470, 610, 15],
  ["Chlorantraniliprole 60 ml", "FMC", "Pesticides", "bottles", 520, 690, 12],
  [
    "Micronutrient Mix Loose",
    "Aries Agro",
    "Fertilizers",
    "kg",
    125,
    175,
    68.5,
  ],
  ["Maize Seeds 4 kg", "Pioneer", "Seeds", "packets", 1180, 1450, 17],
  ["Mancozeb 75 WP 1 kg", "UPL", "Pesticides", "packets", 260, 340, 24],
  ["Potassium Nitrate 1 kg", "Haifa", "Fertilizers", "packets", 125, 175, 0],
  ["Tomato Seeds Hybrid 10 g", "Namdhari", "Seeds", "packets", 275, 390, 20],
  ["Humic Acid 1 L", "Multiplex", "Fertilizers", "bottles", 220, 310, 29],
  ["Emamectin Benzoate 100 g", "Crystal", "Pesticides", "packets", 185, 260, 9],
  ["Red Gram Seeds LRG 41 5 kg", "AP Seeds", "Seeds", "bags", 560, 710, 18],
  [
    "Water-soluble Boron 250 g",
    "Aries Agro",
    "Fertilizers",
    "packets",
    110,
    160,
    46,
  ],
  ["Pendimethalin 1 L", "BASF", "Pesticides", "bottles", 395, 520, 23],
  ["Sunflower Seeds 1 kg", "Advanta", "Seeds", "packets", 310, 425, 32],
  [
    "Seaweed Extract 500 ml",
    "Sagarika",
    "Fertilizers",
    "bottles",
    145,
    215,
    37,
  ],
  ["Copper Oxychloride 500 g", "UPL", "Pesticides", "packets", 155, 220, 14],
  ["Black Gram Seeds 5 kg", "AP Seeds", "Seeds", "bags", 525, 680, 25],
  [
    "Organic Vermicompost Loose",
    "Local Growers",
    "Fertilizers",
    "kg",
    8,
    12,
    380,
  ],
  [
    "Trichoderma Viride 1 kg",
    "Biostadt",
    "Pesticides",
    "packets",
    125,
    190,
    34,
  ],
  ["Legacy Cotton Seeds 450 g", "Mahyco", "Seeds", "packets", 580, 720, 0],
];
const products = productDefs.map((d, i) => ({
  id: i + 1,
  name: d[0],
  brand: d[1],
  category: d[2],
  unit: d[3],
  purchasePrice: d[4],
  price: d[5],
  stock: d[6],
  batch: `${d[2].slice(0, 2).toUpperCase()}-26${String(700 + i).padStart(3, "0")}`,
  expiry: d[2] === "Fertilizers" ? "" : "2027-06-30",
  archived: i === 31,
}));
const places = [
  [
    "Tadepalli",
    "Tadepalli",
    "Guntur",
    "522501",
    "near Sri Venkateswara temple",
  ],
  [
    "Duggirala",
    "Duggirala",
    "Guntur",
    "522330",
    "opposite the primary agricultural cooperative society",
  ],
  [
    "Kollipara",
    "Kollipara",
    "Guntur",
    "522304",
    "near the village panchayat office",
  ],
  [
    "Chebrolu",
    "Chebrolu",
    "Guntur",
    "522212",
    "behind the government high school",
  ],
  [
    "Pedakakani",
    "Pedakakani",
    "Guntur",
    "522509",
    "near Sri Bhramaramba Malleswara Swamy temple",
  ],
  [
    "Chilakaluripet",
    "Chilakaluripet",
    "Palnadu",
    "522616",
    "beside the old rice mill road",
  ],
  [
    "Narasaraopet",
    "Narasaraopet",
    "Palnadu",
    "522601",
    "near the agricultural market yard",
  ],
  [
    "Mangalagiri",
    "Mangalagiri",
    "Guntur",
    "522503",
    "off the Panakala Swamy temple road",
  ],
  [
    "Penamaluru",
    "Penamaluru",
    "Krishna",
    "521139",
    "near the irrigation canal bridge",
  ],
  [
    "Pamarru",
    "Pamarru",
    "Krishna",
    "521157",
    "opposite the village milk collection centre",
  ],
  [
    "Bapatla",
    "Bapatla",
    "Bapatla",
    "522101",
    "near the agricultural college approach road",
  ],
  ["Chirala", "Chirala", "Bapatla", "523155", "behind the cooperative bank"],
  [
    "Kandukur",
    "Kandukur",
    "Nellore",
    "523105",
    "near the weekly farmers market",
  ],
  [
    "Atmakur",
    "Atmakur",
    "Nellore",
    "524322",
    "beside the main irrigation channel",
  ],
  [
    "Peddapuram",
    "Peddapuram",
    "Kakinada",
    "533437",
    "near the government junior college",
  ],
  [
    "Mandapeta",
    "Mandapeta",
    "Konaseema",
    "533308",
    "near the old canal-side warehouse",
  ],
  [
    "Amalapuram",
    "Amalapuram",
    "Konaseema",
    "533201",
    "off the coconut growers society road",
  ],
  [
    "Tadepalligudem",
    "Tadepalligudem",
    "West Godavari",
    "534101",
    "opposite the municipal water tank",
  ],
  [
    "Anantapur",
    "Anantapur",
    "Anantapur",
    "515001",
    "near the groundnut procurement centre",
  ],
  ["Nandyal", "Nandyal", "Nandyal", "518501", "beside the cotton market road"],
];
const firstNames = [
  "Ramesh",
  "Suresh",
  "Sunitha",
  "Vijay",
  "Annapurna",
  "Ganesh",
  "Prakash",
  "Lakshmi",
  "Venkateswara",
  "Srinivas",
  "Ramakrishna",
  "Padmavathi",
  "Krishna",
  "Narasimha",
  "Bhavani",
  "Satyanarayana",
  "Subba",
  "Durga",
  "Madhavi",
  "Raghava",
  "Ravi",
  "Savitri",
  "Chandra",
  "Nageswara",
];
const surnames = ["Reddy", "Naidu", "Rao", "Chowdary", "Varma"];
const farmers = Array.from({ length: 120 }, (_, i) => {
  const p = places[i % places.length];
  return {
    id: i + 1,
    name: `${firstNames[i % 24]} ${surnames[Math.floor(i / 24)]}`,
    phone: `9${String(800000000 + i * 7919).padStart(9, "0")}`,
    address: `D.No. ${3 + (i % 17)}-${12 + (i % 39)}, ${i % 2 ? "Canal Bund Road" : "Farmers Colony, Main Street"}, ${p[0]} village, ${p[1]} mandal, ${p[2]} district, Andhra Pradesh - ${p[3]}; ${p[4]}.`,
    due: 0,
    principal: 0,
    interest: 0,
    rate: 2,
    compound: false,
    created: "2026-09-01",
    archived: i >= 116,
    ...(i % 11 === 0 && i < 116 ? { aadhaar: "/demo-document.svg" } : {}),
  };
});
const supplierNames = [
  "Sri Lakshmi Agro Agencies",
  "Coromandel Regional Distributors",
  "Nuziveedu Seeds Trade Centre",
  "Venkateswara Crop Care",
  "Sai Durga Fertiliser Depot",
  "Coastal Seeds & Crop Solutions",
  "Andhra Farmers Supply Company",
  "Krishna Delta Agro Traders",
  "Green Harvest Inputs",
  "Bapatla Agriculture Distributors",
  "Rayalaseema Agri Depot",
  "Godavari Crop Protection",
];
const suppliers = supplierNames.map((name, i) => {
  const p = places[(i * 2) % places.length];
  return {
    id: i + 1,
    name,
    phone: `0863 ${String(2201400 + i * 113)}`,
    address: `Shop No. ${21 + i}, ${i % 2 ? "Agricultural Market Yard, Warehouse Road" : "Ground Floor, Lakshmi Commercial Complex, Main Road"}, ${p[0]}, ${p[2]} district, Andhra Pradesh - ${p[3]}.`,
    archived: i === 11,
  };
});
const line = (p, quantity, discount = false) => ({
  productId: p.id,
  name: p.name,
  brand: p.brand,
  category: p.category,
  batch: p.batch,
  unit: p.unit,
  quantity,
  purchasePrice: p.purchasePrice,
  sellingPrice: p.price,
  discountedPrice: discount ? round(p.price * 0.95) : null,
  total: round(quantity * (discount ? round(p.price * 0.95) : p.price)),
});
let serial = 1;
const raw = [];
const changes = [];
for (const f of farmers) {
  const i = f.id - 1;
  const dates = [
    nextDate("2026-09-04", i % 7),
    nextDate("2026-09-16", i % 6),
    nextDate("2026-09-25", i % 5),
    "2026-10-05",
    nextDate("2026-10-07", i % 6),
  ];
  if (i < 18) dates.push("2026-10-14");
  dates.forEach((date, j) => {
    const lines = Array.from({ length: 2 + ((i + j) % 2) }, (_, k) => {
      const p = products[(i * 3 + j * 5 + k * 7) % products.length];
      return line(
        p,
        p.unit === "kg" ? round(2.5 + ((i + k) % 5)) : 1 + ((i + j + k) % 4),
        (i + j + k) % 4 === 0,
      );
    });
    if (i % 17 === 0 && j === 2) {
      lines.push({
        productId: null,
        name: "Local paddy nursery seedlings",
        brand: "Village nursery",
        category: "Seeds",
        batch: "",
        unit: "bundles",
        quantity: 6,
        purchasePrice: 95,
        sellingPrice: 120,
        discountedPrice: null,
        total: 720,
      });
    }
    raw.push({
      id: serial++,
      farmer: f.id,
      name: f.name,
      type: "Credit",
      amount: round(lines.reduce((s, l) => s + l.total, 0)),
      date,
      time: `${String(9 + ((i + j) % 3)).padStart(2, "0")}:${j % 2 ? "35" : "10"} AM`,
      detail: `${lines.length} farm inputs supplied`,
      lines,
      dueBefore: 0,
      dueAfter: 0,
    });
  });
  [
    nextDate(dates[0], 4),
    nextDate(dates[2], 2),
    "2026-10-05",
    i < 30 ? "2026-10-14" : "2026-10-13",
  ].forEach((date, j) =>
    raw.push({
      id: serial++,
      farmer: f.id,
      name: f.name,
      type: "Payment",
      amount: 0,
      date,
      time: `${String(2 + ((i + j) % 3)).padStart(2, "0")}:20 PM`,
      detail: "Payment received at the shop",
      lines: [],
      dueBefore: 0,
      dueAfter: 0,
      fraction: j === 3 && i % 11 === 3 ? 1 : 0.18 + (i % 4) * 0.05,
    }),
  );
  if (i % 9 === 5)
    changes.push({
      farmer: f.id,
      date: "2026-09-09",
      newRate: 2,
      newCompound: true,
      note: "Monthly compounding enabled by the proprietor",
    });
  if (i % 7 === 0) {
    changes.push({
      farmer: f.id,
      date: "2026-09-20",
      newRate: 1.5,
      newCompound: false,
      note: "Monthly rate reduced after discussion with the farmer",
    });
    changes.push({
      farmer: f.id,
      date: "2026-10-05",
      newRate: 1.75,
      newCompound: false,
      note: "Rate revised for the new crop season",
    });
  }
  if (i % 13 === 0)
    changes.push({
      farmer: f.id,
      date: "2026-10-10",
      newRate: 2,
      newCompound: true,
      note: "Monthly compounding enabled prospectively",
    });
}
const events = [],
  interestHistory = [],
  snapshots = new Map();
let historyId = 1;
for (const f of farmers) {
  let principal = 0,
    interest = 0,
    rate = 2,
    compound = false,
    boundary = null,
    segment = "2026-09-01",
    segmentInterest = 0;
  const entries = raw
    .filter((e) => e.farmer === f.id)
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.type.localeCompare(b.type),
    );
  const settings = changes.filter((c) => c.farmer === f.id);
  const flush = (date) => {
    if (segmentInterest > 0) {
      interestHistory.push({
        id: historyId++,
        farmer: f.id,
        date,
        type: "Accrual",
        oldRate: rate,
        newRate: rate,
        oldCompound: compound,
        newCompound: compound,
        amount: round(segmentInterest),
        from: segment,
        to: date,
        note: `Interest accrued at ${rate}% per 30 elapsed days`,
      });
    }
    segment = date;
    segmentInterest = 0;
  };
  for (let date = "2026-09-01"; date <= DAY; date = nextDate(date)) {
    if (principal > 0) {
      const accrued = (principal * rate) / 100 / 30;
      interest += accrued;
      segmentInterest += accrued;
    }
    if (compound && boundary === date) {
      flush(date);
      const capitalized = round(interest);
      principal += capitalized;
      interest = 0;
      interestHistory.push({
        id: historyId++,
        farmer: f.id,
        date,
        type: "Capitalization",
        oldRate: rate,
        newRate: rate,
        oldCompound: true,
        newCompound: true,
        amount: capitalized,
        from: nextDate(date, -30),
        to: date,
        note: "Completed 30-day cycle; unpaid interest added to the interest-bearing principal",
      });
      boundary = nextDate(date, 30);
    }
    for (const c of settings.filter((c) => c.date === date)) {
      flush(date);
      interestHistory.push({
        id: historyId++,
        farmer: f.id,
        date,
        type: "Settings",
        oldRate: rate,
        newRate: c.newRate,
        oldCompound: compound,
        newCompound: c.newCompound,
        amount: 0,
        from: date,
        to: date,
        note: c.note,
      });
      if (c.newCompound && !compound) {
        const capitalized = round(interest);
        if (capitalized) {
          principal += capitalized;
          interest = 0;
          interestHistory.push({
            id: historyId++,
            farmer: f.id,
            date,
            type: "Capitalization",
            oldRate: rate,
            newRate: c.newRate,
            oldCompound: false,
            newCompound: true,
            amount: capitalized,
            from: date,
            to: date,
            note: "Existing unpaid interest capitalized once on starting compound mode",
          });
        }
        boundary = nextDate(date, 30);
      }
      if (!c.newCompound) boundary = null;
      rate = c.newRate;
      compound = c.newCompound;
    }
    for (const e of entries.filter((e) => e.date === date)) {
      flush(date);
      e.dueBefore = round(principal + interest);
      if (e.type === "Credit") {
        principal += e.amount;
        if (compound && !boundary) boundary = nextDate(date, 30);
      } else {
        e.amount =
          e.fraction === 1
            ? round(principal + interest)
            : round((principal + interest) * e.fraction);
        e.interestPaid = round(Math.min(e.amount, interest));
        e.principalPaid = round(e.amount - e.interestPaid);
        if (e.amount === round(principal + interest)) {
          principal = 0;
          interest = 0;
          boundary = null;
        } else {
          interest = Math.max(0, interest - e.interestPaid);
          principal = Math.max(0, principal - e.principalPaid);
        }
        delete e.fraction;
      }
      e.dueAfter = round(principal + interest);
      events.push(e);
    }
    if (["2026-10-05", "2026-10-10", "2026-10-13", DAY].includes(date)) {
      flush(date);
      snapshots.set(`${f.id}-${date}`, {
        principal: round(principal),
        interest: round(interest),
        due: round(round(principal) + round(interest)),
        rate,
        compound,
      });
    }
  }
  Object.assign(f, snapshots.get(`${f.id}-${DAY}`));
}
events.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
const purchases = [];
for (let i = 0; i < 96; i++) {
  const s = suppliers[i % suppliers.length],
    date = nextDate("2026-09-01", i % 44),
    lines = [
      line(products[i % 31], 15 + (i % 25)),
      line(products[(i + 8) % 31], 10 + (i % 18)),
    ];
  const paid = i % 3 !== 0;
  purchases.push({
    id: i + 1,
    supplier: s.id,
    name: s.name,
    date,
    paid,
    lines: lines.map((l) => ({
      ...l,
      productId: null,
      sellingPrice: 0,
      discountedPrice: null,
      total: round(l.quantity * l.purchasePrice),
    })),
    amount: round(lines.reduce((a, l) => a + l.purchasePrice * l.quantity, 0)),
    detail: lines.map((l) => `${l.name} × ${l.quantity} ${l.unit}`).join("; "),
    statusHistory: [
      { date, paid: false },
      ...(paid
        ? [
            {
              date: nextDate(
                date,
                Math.min(
                  3,
                  Math.max(0, (Date.parse(DAY) - Date.parse(date)) / 86400000),
                ),
              ),
              paid: true,
            },
          ]
        : []),
    ],
  });
}
const invoices = Array.from({ length: 48 }, (_, i) => {
  const f = farmers[i],
    date = ["2026-10-05", "2026-10-10", "2026-10-13", DAY][i % 4],
    snapshot = snapshots.get(`${f.id}-${date}`);
  return {
    id: 1001 + i,
    farmer: f.id,
    name: f.name,
    phone: f.phone,
    address: f.address,
    date,
    ...snapshot,
    events: events.filter((e) => e.farmer === f.id && e.date <= date),
    interestHistory: interestHistory.filter(
      (e) => e.farmer === f.id && e.date <= date,
    ),
  };
}).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
let movementId = 1;
const stockMovements = [];
for (const p of products) {
  const sold = round(
    events.reduce(
      (s, e) =>
        s +
        e.lines
          .filter((l) => l.productId === p.id)
          .reduce((n, l) => n + l.quantity, 0),
      0,
    ),
  );
  const restock = p.id % 4 === 0 ? 30 : 0;
  const opening = round(sold + p.stock - restock);
  stockMovements.push({
    id: movementId++,
    product: p.id,
    date: "2026-09-01",
    time: "08:30 AM",
    direction: "In",
    quantity: opening,
    reason: "Opening inventory entered by the proprietor",
  });
  if (restock)
    stockMovements.push({
      id: movementId++,
      product: p.id,
      date: "2026-10-05",
      time: "08:45 AM",
      direction: "In",
      quantity: restock,
      reason: "Manual restock for the October crop season",
    });
}
for (const e of events.filter((e) => e.type === "Credit"))
  for (const l of e.lines.filter((l) => l.productId !== null))
    stockMovements.push({
      id: movementId++,
      product: l.productId,
      date: e.date,
      time: e.time,
      direction: "Out",
      quantity: l.quantity,
      reason: `Credit sale to ${e.name}`,
    });
for (const [filename, data] of Object.entries({
  farmers,
  products,
  suppliers,
  transactions: events,
  purchases,
  invoices,
  interest_history: interestHistory,
  stock_movements: stockMovements,
}))
  writeFileSync(
    join(root, `${filename}.json`),
    JSON.stringify(data, null, 2) + "\n",
  );
console.log(
  JSON.stringify({
    farmers: farmers.length,
    products: products.length,
    suppliers: suppliers.length,
    transactions: events.length,
    purchases: purchases.length,
    invoices: invoices.length,
    interestEntries: interestHistory.length,
    stockMovements: stockMovements.length,
    october5Transactions: events.filter((e) => e.date === "2026-10-05").length,
  }),
);
