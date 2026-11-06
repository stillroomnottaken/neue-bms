// Company facts copied from the repository's site.json (source of truth).
export const SITE = {
  name: "PT Berkat Muri Sejahtera",
  short: "BMS",
  nib: "0807240054536",
  whatsapp: "6281289090842",
  contacts: [
    { name: "Kris Dwi Atmaja", display: "0812-8909-0842", e164: "6281289090842" },
    { name: "Kristian Febrianta", display: "0817-8819-4848", e164: "6281788194848" },
  ],
};
export const NAV: { id: string; label: { en: string; id: string } }[] = [
  { id: "home", label: { en: "Home", id: "Beranda" } },
  { id: "catalogue", label: { en: "Catalogue", id: "Katalog" } },
  { id: "products", label: { en: "Processed Products", id: "Produk Olahan" } },
  { id: "process", label: { en: "How We Work", id: "Cara Kerja" } },
  { id: "about", label: { en: "About", id: "Tentang Kami" } },
  { id: "contact", label: { en: "Contact", id: "Hubungi Kami" } },
];
