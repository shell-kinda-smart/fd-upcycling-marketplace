import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import https from "node:https";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  price: number;
  category: "Bags" | "Clothing" | "Accessories" | "Home";
  material: string;
  story: string;
  symbol: string;
  tradeEnabled: boolean;
  seed: string;
};

const products: SeedProduct[] = [
  // ── Bags (13) ─────────────────────────────────────────────
  {
    name: "Denim Revival Tote",
    price: 899,
    category: "Bags",
    material: "Discarded denim jeans",
    story:
      "Old jeans were cleaned, cut and reinforced into a durable everyday tote.",
    symbol: "👜",
    tradeEnabled: true,
    seed: "rethread-denim-revival-tote",
  },
  {
    name: "Banner Utility Pouch",
    price: 549,
    category: "Bags",
    material: "Retired vinyl event banner",
    story:
      "A weatherproof college banner gets a second life as a compact utility pouch.",
    symbol: "👜",
    tradeEnabled: true,
    seed: "rethread-banner-utility-pouch",
  },
  {
    name: "Sailcloth Weekender",
    price: 1799,
    category: "Bags",
    material: "Upcycled sailcloth from decommissioned boats",
    story:
      "Heavy-duty sail panels are stitched into a weekend duffle that ages like leather.",
    symbol: "👜",
    tradeEnabled: false,
    seed: "rethread-sailcloth-weekender",
  },
  {
    name: "Coffee Sack Backpack",
    price: 1299,
    category: "Bags",
    material: "Burlap coffee bean sacks",
    story:
      "Grain sacks from a local roaster are reinforced with cotton webbing into a sturdy daypack.",
    symbol: "👜",
    tradeEnabled: true,
    seed: "rethread-coffee-sack-backpack",
  },
  {
    name: "Curtain Panel Shopper",
    price: 749,
    category: "Bags",
    material: "Vintage curtain panels",
    story:
      "Faded floral curtains find new purpose as a structured market tote.",
    symbol: "👜",
    tradeEnabled: false,
    seed: "rethread-curtain-panel-shopper",
  },
  {
    name: "Tarp Roll-top Sling",
    price: 1099,
    category: "Bags",
    material: "Salvaged truck tarpaulin",
    story:
      "Industrial tarp scraps are heat-sealed into a roll-top sling that shrugs off rain.",
    symbol: "👜",
    tradeEnabled: true,
    seed: "rethread-tarp-roll-top-sling",
  },
  {
    name: "Denim Patchwork Holdall",
    price: 1499,
    category: "Bags",
    material: "Mixed denim offcuts",
    story:
      "Jeans from three different decades are patchwork-stitched into a one-of-one holdall.",
    symbol: "👜",
    tradeEnabled: true,
    seed: "rethread-denim-patchwork-holdall",
  },
  {
    name: "Tent-fly Fanny Pack",
    price: 599,
    category: "Bags",
    material: "Retired tent rainfly",
    story: "A torn tent fly becomes a waterproof waist pack with welded seams.",
    symbol: "👜",
    tradeEnabled: false,
    seed: "rethread-tent-fly-fanny-pack",
  },
  {
    name: "Seatbelt Webbing Belt-bag",
    price: 499,
    category: "Bags",
    material: "Salvaged car seatbelt webbing",
    story:
      "Cut car seatbelts are woven into a slim belt-bag with industrial hardware.",
    symbol: "👜",
    tradeEnabled: true,
    seed: "rethread-seatbelt-belt-bag",
  },
  {
    name: "Linen Tea-towel Tote",
    price: 649,
    category: "Bags",
    material: "Vintage linen tea towels",
    story:
      "Faded kitchen linens are overdyed and stitched into a soft everyday tote.",
    symbol: "👜",
    tradeEnabled: false,
    seed: "rethread-linen-tea-towel-tote",
  },
  {
    name: "Recycled Leather Portfolio",
    price: 1899,
    category: "Bags",
    material: "Reclaimed leather scraps",
    story:
      "Offcuts from a furniture studio are bonded into a slim document portfolio.",
    symbol: "👜",
    tradeEnabled: false,
    seed: "rethread-recycled-leather-portfolio",
  },
  {
    name: "Fire-hose Duffel",
    price: 2199,
    category: "Bags",
    material: "Decommissioned fire hose",
    story:
      "Retired fire hoses are pressure-washed and re-cut into a heavy-duty duffle.",
    symbol: "👜",
    tradeEnabled: true,
    seed: "rethread-fire-hose-duffel",
  },
  {
    name: "Burlap Lunch Sack",
    price: 349,
    category: "Bags",
    material: "Coffee burlap with cotton lining",
    story:
      "Grain sacks are lined with reclaimed cotton to make a sturdy, washable lunch sack.",
    symbol: "👜",
    tradeEnabled: false,
    seed: "rethread-burlap-lunch-sack",
  },

  // ── Clothing (13) ─────────────────────────────────────────
  {
    name: "Patchwork Bucket Hat",
    price: 649,
    category: "Clothing",
    material: "Tailoring fabric scraps",
    story:
      "Small cotton remnants are joined into a reversible, one-of-one bucket hat.",
    symbol: "👕",
    tradeEnabled: true,
    seed: "rethread-patchwork-bucket-hat",
  },
  {
    name: "Sari Silk Quilted Vest",
    price: 1599,
    category: "Clothing",
    material: "Vintage sari silk",
    story:
      "Pre-loved sari silk is hand-quilted into a reversible statement vest.",
    symbol: "👕",
    tradeEnabled: true,
    seed: "rethread-sari-silk-quilted-vest",
  },
  {
    name: "Tee Remnant Raglan",
    price: 799,
    category: "Clothing",
    material: "Upcycled cotton tees",
    story:
      "Stained or torn tees are deconstructed and remixed into a relaxed raglan tee.",
    symbol: "👕",
    tradeEnabled: false,
    seed: "rethread-tee-remnant-raglan",
  },
  {
    name: "Denim Cut-off Jacket",
    price: 1899,
    category: "Clothing",
    material: "Two pairs of old jeans",
    story:
      "Two pairs of worn jeans are spliced together to make a fitted cropped jacket.",
    symbol: "👕",
    tradeEnabled: true,
    seed: "rethread-denim-cutoff-jacket",
  },
  {
    name: "Linen Curtain Trousers",
    price: 1199,
    category: "Clothing",
    material: "Vintage linen curtains",
    story:
      "Sun-bleached linen curtains are unpicked and tailored into wide-leg trousers.",
    symbol: "👕",
    tradeEnabled: false,
    seed: "rethread-linen-curtain-trousers",
  },
  {
    name: "Kantha Stitch Wrap",
    price: 1399,
    category: "Clothing",
    material: "Layered cotton sari scraps",
    story:
      "Layered sari remnants are hand-stitched in running kantha stitch into a soft wrap.",
    symbol: "👕",
    tradeEnabled: true,
    seed: "rethread-kantha-stitch-wrap",
  },
  {
    name: "Bed-sheet Shirt",
    price: 949,
    category: "Clothing",
    material: "Vintage cotton bedsheets",
    story: "Soft, washed-out bedsheets become a relaxed camp-collar shirt.",
    symbol: "👕",
    tradeEnabled: false,
    seed: "rethread-bed-sheet-shirt",
  },
  {
    name: "Sweater Felted Beanie",
    price: 449,
    category: "Clothing",
    material: "Shrunken wool sweaters",
    story:
      "Sweaters shrunk beyond wear are felted and refashioned into a dense beanie.",
    symbol: "👕",
    tradeEnabled: false,
    seed: "rethread-sweater-felted-beanie",
  },
  {
    name: "Banner Tarp Apron",
    price: 699,
    category: "Clothing",
    material: "Event banner offcuts",
    story:
      "Retired event banners are cut and bias-bound into a rugged workshop apron.",
    symbol: "👕",
    tradeEnabled: false,
    seed: "rethread-banner-tarp-apron",
  },
  {
    name: "Patchwork Crop Top",
    price: 549,
    category: "Clothing",
    material: "Cotton shirting scraps",
    story:
      "Tiny shirting scraps are hex-pieced into a playful cropped camisole.",
    symbol: "👕",
    tradeEnabled: true,
    seed: "rethread-patchwork-crop-top",
  },
  {
    name: "Denim A-line Skirt",
    price: 1299,
    category: "Clothing",
    material: "Mixed old jeans",
    story:
      "Three pairs of jeans are cut down and re-stitched into a mid-length A-line skirt.",
    symbol: "👕",
    tradeEnabled: true,
    seed: "rethread-denim-aline-skirt",
  },
  {
    name: "Sherpa Reworked Bomber",
    price: 1699,
    category: "Clothing",
    material: "Vintage fleece + sari lining",
    story:
      "A faded fleece bomber is re-lined with sari silk for a warm, eclectic statement piece.",
    symbol: "👕",
    tradeEnabled: false,
    seed: "rethread-sherpa-reworked-bomber",
  },
  {
    name: "Linen Sample Smock",
    price: 1099,
    category: "Clothing",
    material: "Designer linen sample cuts",
    story:
      "Discontinued designer linen samples are tiered into a breezy smock dress.",
    symbol: "👕",
    tradeEnabled: true,
    seed: "rethread-linen-sample-smock",
  },

  // ── Accessories (12) ─────────────────────────────────────
  {
    name: "Circuit Board Pendant",
    price: 399,
    category: "Accessories",
    material: "Non-working circuit board",
    story:
      "A damaged PCB is safely sealed and reshaped as a geometric pendant.",
    symbol: "◈",
    tradeEnabled: true,
    seed: "rethread-circuit-board-pendant",
  },
  {
    name: "Vinyl Record Cuff",
    price: 549,
    category: "Accessories",
    material: "Heat-moulded vinyl record",
    story:
      "Cracked vinyl records are gently warmed and reshaped into wearable cuffs.",
    symbol: "◈",
    tradeEnabled: true,
    seed: "rethread-vinyl-record-cuff",
  },
  {
    name: "Bottle-cap Studs",
    price: 249,
    category: "Accessories",
    material: "Metal bottle caps + resin",
    story:
      "Collected bottle caps are sealed in eco resin into playful stud earrings.",
    symbol: "◈",
    tradeEnabled: false,
    seed: "rethread-bottle-cap-studs",
  },
  {
    name: "Tire-tube Belt",
    price: 699,
    category: "Accessories",
    material: "Inner-tube rubber",
    story:
      "Punctured bike inner tubes are flattened and stitched into a vegan leather-look belt.",
    symbol: "◈",
    tradeEnabled: true,
    seed: "rethread-tire-tube-belt",
  },
  {
    name: "Spectacle Frame Brooch",
    price: 449,
    category: "Accessories",
    material: "Salvaged spectacle frames",
    story:
      "Broken spectacles are de-lensed and pinned into quirky statement brooches.",
    symbol: "◈",
    tradeEnabled: false,
    seed: "rethread-spectacle-frame-brooch",
  },
  {
    name: "Keyboard Key Choker",
    price: 299,
    category: "Accessories",
    material: "Salvaged keyboard keys",
    story:
      "Keys from decommissioned keyboards are strung into a typographer's choker.",
    symbol: "◈",
    tradeEnabled: true,
    seed: "rethread-keyboard-key-choker",
  },
  {
    name: "Tea-bag Paper Brooch",
    price: 199,
    category: "Accessories",
    material: "Used tea-bag paper",
    story:
      "Steeped tea-bag papers are layered and sealed into delicate floral brooches.",
    symbol: "◈",
    tradeEnabled: false,
    seed: "rethread-tea-bag-paper-brooch",
  },
  {
    name: "Denim Scrap Headband",
    price: 349,
    category: "Accessories",
    material: "Denim offcuts",
    story:
      "Twisted and braided denim scraps are sewn into a soft, stretchy headband.",
    symbol: "◈",
    tradeEnabled: false,
    seed: "rethread-denim-scrap-headband",
  },
  {
    name: "Cassette Tape Wallet",
    price: 599,
    category: "Accessories",
    material: "Vintage cassette tapes",
    story:
      "Broken cassettes are de-cased and re-stitched into a slim two-card wallet.",
    symbol: "◈",
    tradeEnabled: true,
    seed: "rethread-cassette-tape-wallet",
  },
  {
    name: "Banner Pocket Square",
    price: 249,
    category: "Accessories",
    material: "Vinyl event banner offcuts",
    story:
      "Bright banner scraps are cut, hemmed, and folded into bold pocket squares.",
    symbol: "◈",
    tradeEnabled: false,
    seed: "rethread-banner-pocket-square",
  },
  {
    name: "CD Mosaic Hairpins",
    price: 299,
    category: "Accessories",
    material: "Shattered CDs",
    story:
      "Scratched CDs are shattered into mosaic tiles and set into iridescent hairpins.",
    symbol: "◈",
    tradeEnabled: false,
    seed: "rethread-cd-mosaic-hairpins",
  },
  {
    name: "Sailcloth Watch Strap",
    price: 449,
    category: "Accessories",
    material: "Sailcloth offcuts + steel hardware",
    story:
      "Stiff sailcloth scraps become a rugged, water-resistant watch strap.",
    symbol: "◈",
    tradeEnabled: false,
    seed: "rethread-sailcloth-watch-strap",
  },

  // ── Home (12) ─────────────────────────────────────────────
  {
    name: "Newspaper Desk Lamp",
    price: 1299,
    category: "Home",
    material: "Rolled newspaper and reclaimed wood",
    story:
      "Waste newspaper tubes form the shade and an offcut becomes the weighted base.",
    symbol: "🌱",
    tradeEnabled: false,
    seed: "rethread-newspaper-desk-lamp",
  },
  {
    name: "Bottle-cap Coasters",
    price: 349,
    category: "Home",
    material: "Metal bottle caps and cork",
    story:
      "Collected bottle caps sit inside reclaimed cork rings to protect table surfaces.",
    symbol: "🌱",
    tradeEnabled: false,
    seed: "rethread-bottle-cap-coasters",
  },
  {
    name: "Wine-cork Trivet",
    price: 299,
    category: "Home",
    material: "Collected wine corks",
    story:
      "Restaurant wine corks are sliced and glued into a hexagonal heat-proof trivet.",
    symbol: "🌱",
    tradeEnabled: false,
    seed: "rethread-wine-cork-trivet",
  },
  {
    name: "Pallet Wood Stool",
    price: 1799,
    category: "Home",
    material: "Heat-treated pallet wood",
    story:
      "Heat-treated pallet planks are sanded and joined into a sturdy bedside stool.",
    symbol: "🌱",
    tradeEnabled: true,
    seed: "rethread-pallet-wood-stool",
  },
  {
    name: "Mason Jar Pendant Light",
    price: 1499,
    category: "Home",
    material: "Vintage mason jars + brass",
    story:
      "Old canning jars are wired into a cluster pendant with brushed brass fittings.",
    symbol: "🌱",
    tradeEnabled: false,
    seed: "rethread-mason-jar-pendant-light",
  },
  {
    name: "Magnet-board Photo Frame",
    price: 549,
    category: "Home",
    material: "Salvaged steel sheet + barn wood",
    story:
      "A sheet of salvaged steel is mounted on barn offcuts to make a magnetic photo rail.",
    symbol: "🌱",
    tradeEnabled: false,
    seed: "rethread-magnet-board-photo-frame",
  },
  {
    name: "Tin Can Lantern",
    price: 449,
    category: "Home",
    material: "Punched tin cans",
    story:
      "Cleaned food cans are nail-punched into stencilled tealight lanterns.",
    symbol: "🌱",
    tradeEnabled: true,
    seed: "rethread-tin-can-lantern",
  },
  {
    name: "Reclaimed Bookend Pair",
    price: 599,
    category: "Home",
    material: "Salvaged oak joists + brass",
    story:
      "Offcuts from renovation are planed and joined with brass into L-shaped bookends.",
    symbol: "🌱",
    tradeEnabled: false,
    seed: "rethread-reclaimed-bookend-pair",
  },
  {
    name: "Burlap Planter Cover",
    price: 399,
    category: "Home",
    material: "Coffee burlap + cotton lining",
    story:
      "Grain sacks are sized and lined to slip over plain terracotta pots.",
    symbol: "🌱",
    tradeEnabled: false,
    seed: "rethread-burlap-planter-cover",
  },
  {
    name: "Shutter Window Mirror",
    price: 999,
    category: "Home",
    material: "Reclaimed window shutters",
    story:
      "Old louvered shutters are cut down and fitted with a frameless wall mirror.",
    symbol: "🌱",
    tradeEnabled: true,
    seed: "rethread-shutter-window-mirror",
  },
  {
    name: "Cork & Driftwood Coaster Set",
    price: 449,
    category: "Home",
    material: "Wine cork + driftwood",
    story:
      "Cork slices are inlaid into driftwood rounds to make a set of four coasters.",
    symbol: "🌱",
    tradeEnabled: false,
    seed: "rethread-cork-driftwood-coaster-set",
  },
  {
    name: "Banner Tarp Picnic Mat",
    price: 899,
    category: "Home",
    material: "Event banner + cotton scrim",
    story:
      "Retired outdoor banners are backed with cotton and bound into a wipe-clean picnic mat.",
    symbol: "🌱",
    tradeEnabled: true,
    seed: "rethread-banner-tarp-picnic-mat",
  },
];

// ---------- Photographic image fetcher ------------------------
// Downloads real fashion product photos from Pexels (no API key
// required — `images.pexels.com` allows direct hotlinking). Each
// product is deterministically assigned an image from the curated
// catalogue in `prisma/pexels-catalogue.json`, grouped by
// category, so re-runs keep the same image per product.

type Catalogue = Record<
  "Bags" | "Clothing" | "Accessories" | "Home" | "Detail",
  Array<{ id: number; desc: string }>
>;

type PhotoJob = {
  productSeed: string;
  file: string;
  url: string;
};

function pexelsUrl(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1200&fit=crop`;
}

function fetchToFile(url: string, maxRedirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location &&
        maxRedirects > 0
      ) {
        res.resume();
        fetchToFile(res.headers.location, maxRedirects - 1).then(
          resolve,
          reject,
        );
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error("timeout " + url)));
  });
}

function assignPhotos(products: SeedProduct[], cat: Catalogue): PhotoJob[] {
  const buckets: Record<string, number[]> = {
    Bags: cat.Bags.map((p) => p.id),
    Clothing: cat.Clothing.map((p) => p.id),
    Accessories: cat.Accessories.map((p) => p.id),
    Home: cat.Home.map((p) => p.id),
    Detail: cat.Detail.map((p) => p.id),
  };
  const cursors: Record<string, number> = {
    Bags: 0,
    Clothing: 0,
    Accessories: 0,
    Home: 0,
    Detail: 0,
  };

  const jobs: PhotoJob[] = [];
  for (const p of products) {
    let bucket: keyof Catalogue = p.category;
    let ids = buckets[bucket];
    if (!ids.length) {
      bucket = "Detail";
      ids = buckets.Detail;
    }
    const idx = cursors[bucket] % ids.length;
    cursors[bucket] += 1;
    const photoId = ids[idx];
    jobs.push({
      productSeed: p.seed,
      file: `${p.seed}.jpg`,
      url: pexelsUrl(photoId),
    });
  }
  return jobs;
}

async function loadCatalogue(): Promise<Catalogue> {
  const file = path.join(process.cwd(), "prisma", "pexels-catalogue.json");
  try {
    const text = await readFile(file, "utf8");
    return JSON.parse(text) as Catalogue;
  } catch {
    // Fallback if JSON is missing
    return {
      Bags: [{ id: 1488463, desc: "Denim bag" }],
      Clothing: [{ id: 298863, desc: "Denim jacket" }],
      Accessories: [{ id: 1458829, desc: "Accessories" }],
      Home: [{ id: 1099816, desc: "Home decor" }],
      Detail: [{ id: 1488463, desc: "Detail" }],
    };
  }
}

async function fileExists(p: string) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureImages(jobs: PhotoJob[]) {
  const dir = path.join(process.cwd(), "public", "products");
  await mkdir(dir, { recursive: true });
  for (const job of jobs) {
    const file = path.join(dir, job.file);
    if (await fileExists(file)) continue;
    try {
      console.log(`  ↓ downloading ${job.file}`);
      const buf = await fetchToFile(job.url);
      await writeFile(file, buf);
    } catch {
      // Ignore network errors if image cannot be downloaded in offline demo
    }
  }
}

async function main() {
  const catalogue = await loadCatalogue();
  const jobs = assignPhotos(products, catalogue);
  await ensureImages(jobs);

  await prisma.user.upsert({
    where: { email: "demo.maker@example.com" },
    update: { role: "ADMIN" },
    create: {
      name: "Demo Maker",
      email: "demo.maker@example.com",
      passwordHash: await hash("DemoPass123!", 12),
      role: "ADMIN",
      college: "Demo College",
    },
  });

  const studio = await prisma.user.upsert({
    where: { email: "studio@rethread.demo" },
    update: {},
    create: {
      name: "ReThread Studio",
      email: "studio@rethread.demo",
      passwordHash: await hash("StudioDemo123!", 12),
      role: "CREATOR",
    },
  });

  // Replace the catalogue so re-running picks up the new imageUrl field
  // and any tweaks to the seed list.
  await prisma.product.deleteMany({});
  await prisma.product.createMany({
    data: products.map((p) => ({
      name: p.name,
      price: p.price,
      category: p.category,
      material: p.material,
      story: p.story,
      symbol: p.symbol,
      tradeEnabled: p.tradeEnabled,
      imageUrl: `/products/${p.seed}.jpg`,
      sellerId: studio.id,
    })),
  });

  const total = await prisma.product.count();
  console.log(
    `Seed complete: demo buyer + studio seller, ${total} products (${products.length} catalogue entries).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
