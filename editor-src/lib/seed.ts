import type { CatalogueItem, Design, EditorData, Loc, Node, Page, Section, SectionStyle, Style } from "./model";

const L = (en: string, id: string): Loc => ({ en, id });
const sty = (s: Style = {}): Style => s;
const base = (id: string, s: Style = {}) => ({ id, visible: true, style: sty(s) });

const h = (id: string, level: 1 | 2 | 3, en: string, idn: string, s: Style = {}): Node => ({ ...base(id, s), type: "heading", level, text: L(en, idn) });
const p = (id: string, en: string, idn: string, s: Style = {}, type: "paragraph" | "richtext" | "eyebrow" = "paragraph"): Node => ({ ...base(id, s), type, text: L(en, idn) });
const eyebrow = (id: string, en: string, idn: string) => p(id, en, idn, {}, "eyebrow");
const lead = (id: string, en: string, idn: string) => p(id, en, idn, { size: 18, maxWidth: 620 });
const btn = (id: string, en: string, idn: string, href: string, variant: "forest" | "gold" | "maize" | "line", size: "sm" | "md" | "lg" = "lg"): Node => ({ ...base(id), type: "button", label: L(en, idn), href, variant, size });
const cont = (id: string, children: Node[], s: Style = {}): Node => ({ ...base(id, { layout: "stack", ...s }), type: "container", children });
const sec = (id: string, kind: Section["kind"], name: string, style: Partial<SectionStyle>, children: Node[]): Section => ({
  id, kind, name, visible: true, children,
  style: { layout: "stack", columns: 1, padTop: 56, padBottom: 56, marginTop: 0, marginBottom: 0, gap: 16, align: "left", ...style },
});
const head = (id: string, bg: string, e: [string, string], t: [string, string], l?: [string, string]) =>
  sec(`${id}-head`, "band", "Page header", { bg, padTop: 40, padBottom: 40, gap: 0 }, [
    eyebrow(`${id}-eb`, ...e), h(`${id}-h1`, 1, ...t), ...(l ? [lead(`${id}-lead`, ...l)] : []),
  ]);
const cta = (id: string, t: [string, string], l: [string, string]) =>
  sec(`${id}-cta`, "cta", "Call to action", { bg: "var(--forest)", padTop: 52, padBottom: 52, layout: "columns", columns: 2, gap: 40, align: "left" }, [
    cont(`${id}-cta-c`, [h(`${id}-cta-h`, 2, ...t, { size: 32 }), p(`${id}-cta-p`, ...l, { color: "rgba(46,32,18,.9)" })]),
    btn(`${id}-cta-b`, "CONTACT US", "HUBUNGI KAMI", "@contact", "maize", "lg"),
  ]);
const ribbon = (id: string, bg: string, tone: "dark" | "light" | undefined, tag: [string, string], t: [string, string], tx: [string, string], href: string) =>
  sec(`${id}`, "band", "Ribbon", { bg, tone, padTop: 28, padBottom: 28, gap: 6 }, [
    eyebrow(`${id}-tag`, ...tag), h(`${id}-t`, 2, ...t, { size: 28 }), p(`${id}-x`, ...tx, { maxWidth: 700 }),
    { ...base(`${id}-go`), type: "link", label: L("Open →", "Buka →"), href } as Node,
  ]);

const IMAGES: Record<string, string> = { cocoa: "cocoa.webp", candlenuts: "candlenuts.webp", "corn-cobs": "corn-cobs.webp", "rubber-seeds": "rubber-seeds.webp", "rubber-seed-oil": "rubber-seed-oil.webp", cnsl: "cnsl.webp", petrochemicals: "petrochemicals.webp" };
export const CATALOGUE: CatalogueItem[] = [
  { id: "m1", slug: "cocoa", cat: "agri", name: L("Cocoa", "Kakao") },
  { id: "m2", slug: "candlenuts", cat: "agri", name: L("Candlenuts", "Kemiri") },
  { id: "m3", slug: "corn-cobs", cat: "agri", name: L("Corn Cobs", "Tongkol Jagung"), detail: true },
  { id: "m4", slug: "rubber-seeds", cat: "agri", name: L("Rubber Seeds", "Biji Karet") },
  { id: "m5", slug: "rubber-seed-oil", cat: "bio", name: L("Rubber Seed Oil", "Minyak Biji Karet") },
  { id: "m6", slug: "palm-based-derivatives", cat: "bio", name: L("Palm-Based Derivatives", "Turunan Kelapa Sawit") },
  { id: "m7", slug: "cnsl", cat: "bio", name: L("CNSL", "CNSL") },
  { id: "m8", slug: "uco", cat: "bio", name: L("UCO", "UCO") },
  { id: "m9", slug: "pome", cat: "bio", name: L("POME", "POME") },
  { id: "m10", slug: "petrochemicals", cat: "industrial", name: L("Petrochemicals", "Petrokimia") },
].map((m) => ({ desc: L("", ""), image: IMAGES[m.slug] ? `/assets/img/${IMAGES[m.slug]}` : "", visible: true, ...m })) as CatalogueItem[];

const industries: [string, string, string][] = [
  ["food", "Food & beverage", "Makanan & minuman"], ["cosmetic", "Cosmetic & personal care", "Kosmetik & perawatan diri"],
  ["energy", "Energy & biofuel", "Energi & biofuel"], ["chemicals", "Chemicals & coatings", "Kimia & pelapis"],
  ["industrial", "Industrial", "Industri"], ["feed", "Animal feed & pet food", "Pakan ternak & makanan hewan"],
  ["agri", "Agriculture & fertilizer", "Pertanian & pupuk"], ["pharma", "Pharmaceutical & health", "Farmasi & kesehatan"],
  ["packaging", "Packaging & paper", "Kemasan & kertas"], ["rubber", "Rubber, plastics & resins", "Karet, plastik & resin"],
  ["construction", "Construction materials", "Bahan bangunan"], ["textile", "Textile & leather", "Tekstil & kulit"],
];

const fact = (id: string, a: [string, string], b: [string, string]) => ({ id, label: L(...a), value: L(...b) });
const same = (s: string): [string, string] => [s, s];
const SITE_NAME = "PT Berkat Muri Sejahtera";

export const PAGES: Page[] = [
  {
    id: "home", name: L("Home", "Beranda"), slug: L("", ""), sections: [
      sec("home-hero", "hero", "Hero", { bg: "var(--paper)", padTop: 52, padBottom: 48, layout: "columns", columns: 2, gap: 32, align: "left" }, [
        cont("home-hero-c", [
          eyebrow("home-eb", `${SITE_NAME} · Jakarta, Indonesia`, `${SITE_NAME} · Jakarta, Indonesia`),
          h("home-h1", 1, "Agricultural commodities, supplied to your business", "Komoditas pertanian, dipasok untuk bisnis Anda"),
          lead("home-lead", "BMS aggregates supply from suppliers across Indonesia and sells it to manufacturers, processors and industrial buyers. Tell us what your business needs and we supply it.", "BMS mengumpulkan pasokan dari pemasok di seluruh Indonesia dan menjualnya kepada produsen, pengolah, dan pembeli industri. Beri tahu kami kebutuhan bisnis Anda, kami yang memasoknya."),
          btn("home-btn", "CONTACT US", "HUBUNGI KAMI", "@contact", "gold"),
        ]),
        { ...base("home-net"), type: "graphic", kind: "net" },
      ]),
      ribbon("home-r1", "var(--maize)", undefined, ["Catalogue", "Katalog"], ["10 materials, one supplier", "10 material, satu pemasok"], ["Agricultural commodities, bio-based materials and industrial resources.", "Komoditas pertanian, bahan berbasis hayati, dan sumber daya industri."], "@catalogue"),
      ribbon("home-r2", "var(--gold)", undefined, ["For suppliers", "Untuk pemasok"], ["Have a harvest or stock to supply?", "Punya hasil panen atau stok untuk dipasok?"], ["Tell us what you have. BMS aggregates it.", "Beri tahu kami apa yang Anda miliki. BMS yang mengumpulkannya."], "@contact?intent=have"),
      ribbon("home-r3", "var(--moss)", undefined, ["For buyers", "Untuk pembeli"], ["Looking for a material?", "Mencari material?"], ["Tell us what you need and BMS supplies it.", "Beri tahu kami kebutuhan Anda, BMS yang memasoknya."], "@contact?intent=need"),
      ribbon("home-r4", "var(--noir)", "light", ["How We Work", "Cara Kerja"], ["Supplier, BMS, business opportunity", "Pemasok, BMS, peluang bisnis"], ["We aggregate supply and sell it on.", "Kami mengumpulkan pasokan dan menjualnya."], "@process"),
      cta("home", ["Need a material, or can you supply one?", "Butuh material, atau bisa memasok?"], ["Buyers order from BMS. Suppliers supply to BMS. Either way, talk to us.", "Pembeli memesan dari BMS. Pemasok memasok ke BMS. Keduanya, hubungi kami."]),
    ],
  },
  {
    id: "catalogue", name: L("Catalogue", "Katalog"), slug: L("catalogue", "katalog"), sections: [
      head("cat", "var(--gold)", ["Catalogue", "Katalog"], ["Materials Catalogue", "Katalog Material"], ["Agricultural commodities and materials we supply. Need a material, or can you supply one? Start here.", "Komoditas dan material pertanian yang kami pasok. Butuh material, atau bisa memasok? Mulai dari sini."]),
      sec("cat-grid", "catalogue", "Catalogue grid", { columns: 3, gap: 16 }, []),
    ],
  },
  {
    id: "products", name: L("Processed Products", "Produk Olahan"), slug: L("products", "produk-olahan"), sections: [
      head("prod", "var(--moss)", ["Processed Products", "Produk Olahan"], ["Processed Products", "Produk Olahan"], ["Industries that may use the materials we trade.", "Industri yang dapat menggunakan material yang kami perdagangkan."]),
      sec("prod-ind", "content", "Industries", { padTop: 56, padBottom: 24, gap: 16 }, [h("prod-ind-h", 2, "Industries", "Industri")]),
      sec("prod-grid", "content", "Industry cards", { layout: "grid", columns: 3, padTop: 0, padBottom: 24, gap: 16 },
        industries.map(([k, en, idn]): Node => ({ ...base(`ind-${k}`), type: "card", variant: "image", title: L(en, idn), text: L("", ""), src: "" }))),
      sec("prod-more", "content", "Catalogue link", { padTop: 0, padBottom: 56 }, [btn("prod-more-b", "See the catalogue →", "Lihat katalog →", "@catalogue", "line", "sm")]),
      cta("prod", ["Looking for a material?", "Mencari material?"], ["Tell us what you need, or what you can supply.", "Beri tahu kami apa yang Anda butuhkan, atau apa yang dapat Anda pasok."]),
    ],
  },
  {
    id: "process", name: L("How We Work", "Cara Kerja"), slug: L("how-we-work", "cara-kerja"), sections: [
      head("proc", "var(--forest)", ["How We Work", "Cara Kerja"], ["We aggregate supply. We sell it on.", "Kami mengumpulkan pasokan. Kami menjualnya."]),
      sec("proc-flow", "content", "Supplier → BMS → Business", {}, [{ ...base("proc-g"), type: "graphic", kind: "flow" }]),
      sec("proc-btn", "content", "Contact button", { padTop: 0, padBottom: 56, align: "center" }, [btn("proc-b", "CONTACT US", "HUBUNGI KAMI", "@contact", "forest", "lg")]),
    ],
  },
  {
    id: "about", name: L("About", "Tentang Kami"), slug: L("about", "tentang"), sections: [
      head("about", "var(--maize)", ["About", "Tentang Kami"], [SITE_NAME, SITE_NAME], ["An Indonesian trading company established in 2025 and based in Jakarta, focused on sourcing, aggregation and distribution.", "Perusahaan perdagangan Indonesia yang didirikan pada 2025 dan berbasis di Jakarta, berfokus pada pengadaan, agregasi, dan distribusi."]),
      sec("about-body", "content", "Company story and facts", { layout: "columns", columns: 2, gap: 40 }, [
        cont("about-l", [
          h("about-h2", 2, "Growing step by step", "Bertumbuh selangkah demi selangkah"),
          p("about-p", "BMS aggregates supply from a growing base of suppliers across Indonesia and sells it to business buyers, developing toward international markets.", "BMS mengumpulkan pasokan dari basis pemasok yang terus bertambah di seluruh Indonesia dan menjualnya kepada pembeli bisnis, bergerak menuju pasar internasional."),
          cont("about-steps", [
            { ...base("st1"), type: "card", variant: "step", title: L("Indonesia", "Indonesia"), text: L("Home market", "Pasar utama"), src: "" },
            { ...base("st3"), type: "card", variant: "step", title: L("International", "Internasional"), text: L("Growth ahead", "Pertumbuhan ke depan"), src: "" },
          ], { layout: "grid", columns: 2, gap: 8 }),
        ]),
        { ...base("about-facts"), type: "facts", rows: [
          fact("f1", ["Company", "Perusahaan"], same(SITE_NAME)), fact("f2", ["Type", "Jenis"], ["Indonesian trading company", "Perusahaan perdagangan Indonesia"]),
          fact("f3", ["Established", "Berdiri"], same("2025")), fact("f4", ["Based in", "Berkedudukan di"], same("Jakarta, Indonesia")),
          fact("f5", ["Focus", "Fokus"], ["Sourcing, aggregation, distribution", "Pengadaan, agregasi, distribusi"]), fact("f6", ["NIB", "NIB"], same("0807240054536")),
        ] },
      ]),
      cta("about", ["Need a material, or can you supply one?", "Butuh material, atau bisa memasok?"], ["Buyers order from BMS. Suppliers supply to BMS. Either way, talk to us.", "Pembeli memesan dari BMS. Pemasok memasok ke BMS. Keduanya, hubungi kami."]),
    ],
  },
  {
    id: "contact", name: L("Contact", "Kontak"), slug: L("contact", "kontak"), sections: [
      head("contact", "var(--maize)", ["Contact", "Kontak"], ["Tell us what you need, or what you can supply.", "Beri tahu kami apa yang Anda butuhkan, atau bisa pasok."], ["One short form. It opens WhatsApp with your details ready to send to our team.", "Satu formulir singkat. Formulir ini membuka WhatsApp dengan detail Anda siap dikirim ke tim kami."]),
      sec("contact-form", "contact", "Contact form", {}, []),
    ],
  },
  {
    id: "corn-cobs", name: L("Corn Cobs (detail)", "Tongkol Jagung (detail)"), slug: L("corn-cobs", "corn-cobs"), sections: [
      sec("cc-head", "band", "Material header", { bg: "var(--maize)", padTop: 40, padBottom: 40, gap: 0 }, [
        eyebrow("cc-eb", "Agricultural commodities", "Komoditas pertanian"), h("cc-h1", 1, "Corn Cobs", "Tongkol Jagung"),
        lead("cc-lead", "An agricultural material BMS can source and supply, processed to your needs.", "Material pertanian yang dapat BMS carikan dan pasok, diolah sesuai kebutuhan Anda."),
        cont("cc-pair", [btn("cc-buy", "BUY", "BELI", "@contact?intent=need&material=corn-cobs", "forest", "md"), btn("cc-sup", "SUPPLY", "PASOK", "@contact?intent=have&material=corn-cobs", "gold", "md")], { layout: "row", gap: 8, width: 40 }),
      ]),
      sec("cc-body", "content", "About corn cobs", { layout: "columns", columns: 2, gap: 40 }, [
        cont("cc-l", [
          h("cc-h2", 2, "About corn cobs", "Tentang tongkol jagung"),
          p("cc-p", "Corn cobs are one of the materials BMS trades. Specifications are discussed according to each buyer's requirements.", "Tongkol jagung adalah salah satu material yang diperdagangkan BMS. Spesifikasi dibahas sesuai kebutuhan masing-masing pembeli."),
          eyebrow("cc-uses", "Potential uses", "Potensi penggunaan"),
          p("cc-u1", "Cosmetics / personal care · Industrial applications", "Kosmetik / perawatan diri · Aplikasi industri"),
          p("cc-note", "Suitability is confirmed through the buyer's own testing.", "Kesesuaian dikonfirmasi melalui pengujian pembeli sendiri.", { size: 15, color: "var(--muted)" }),
        ]),
        { ...base("cc-facts"), type: "facts", rows: [
          fact("c1", ["Sourcing", "Pengadaan"], ["Collectors, plantations and logistics partners", "Pengepul, perkebunan, dan mitra logistik"]),
          fact("c2", ["Processing", "Pengolahan"], ["Processed to needs", "Diolah sesuai kebutuhan"]),
          fact("c3", ["Packing & shipping", "Kemasan & pengiriman"], ["Considered as part of each enquiry", "Dipertimbangkan dalam setiap permintaan"]),
          fact("c4", ["Volumes", "Volume"], ["Information coming soon", "Informasi segera hadir"]),
        ] },
      ]),
      cta("cc", ["Interested in corn cobs?", "Tertarik dengan tongkol jagung?"], ["Need corn cobs, or can you supply them? Talk to BMS.", "Butuh tongkol jagung, atau bisa memasoknya? Hubungi BMS."]),
    ],
  },
];

export const DESIGN: Design = {
  primary: "#90C207", secondary: "#DD9C00", background: "#FBF7E6", font: "default",
  h1: 0, body: 16, buttonStyle: "solid", buttonRadius: 6, sectionSpacing: 100, contentWidth: 1120,
};

export const initialData = (): EditorData => structuredClone({ pages: PAGES, catalogue: CATALOGUE, design: DESIGN });
