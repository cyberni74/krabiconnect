/**
 * SEO file names → Higgsfield CDN files. Served same-origin via `/bilder/<name>` (src/routes/bilder.$file.ts),
 * which proxies the CDN with long-lived cache headers, so images get descriptive URLs on our own domain.
 * When the files are moved into /public/images, drop the proxy and point IMG at the local paths.
 */
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_37pB8NNBCXw21nrSwh5C0AozDjm/";

export const SEO_IMAGES: Record<string, string> = {
  "koh-poda-krabi-strand-kalksteinfelsen.webp": "hf_20261005_002150_8d7c6492-5f34-4934-b3b4-75f0b9a82121_min.webp",
  "tup-sandbank-krabi-ebbe-drohnenaufnahme.webp": "hf_20261005_002150_dfdc534c-9c4e-4bec-b0a0-7b576b419b45_min.webp",
  "hong-island-krabi-smaragdgruene-lagune.webp": "hf_20261005_002150_9a0e33b6-f442-46a5-9017-2eda9b1de6a4_min.webp",
  "koh-roi-versteckte-lagune-phang-nga.webp": "hf_20261005_002151_280755de-327f-4601-b6bd-311a5ea5251e_min.webp",
  "koh-kudu-hong-hoehle-phang-nga.webp": "hf_20261005_002151_c63538fc-208f-4006-9912-f9011184d205_min.webp",
  "maya-bay-phi-phi-sonnenaufgang.webp": "hf_20261005_002150_68ec7119-d389-408e-8d9d-54589be6ed12_min.webp",
  "schnorcheln-krabi-korallenriff-schildkroete.webp": "hf_20261005_002152_3dee514d-3244-4148-8ed2-cb0bb316fa60_min.webp",
  "paar-schnorcheln-privates-speedboat-krabi.webp": "hf_20261005_002150_98a1e3a6-b5bc-4a7d-9b11-e3555a5db8e8_min.webp",
  "leuchtendes-plankton-krabi-nacht-speedboat.webp": "hf_20261005_002152_f24dca4e-a654-4ac1-8de2-d84cfd0de8f4_min.webp",
  "riff-angeln-krabi-zackenbarsch.webp": "hf_20261005_002151_b7e84fd8-797e-4d99-b423-402e02292489_min.webp",
  "hochsee-angeln-trolling-andamanensee.webp": "hf_20261005_002151_a3ce8116-0f18-4d0e-81d8-0d77bf41ece2_min.webp",
  "tintenfisch-angeln-nacht-krabi.webp": "hf_20261005_002149_a748fc59-1529-499e-ab29-09242a05de21_min.webp",
  "strand-bbq-sonnenuntergang-krabi.webp": "hf_20261005_002200_1514cd4f-b5d3-4b48-8089-4193f0182997_min.webp",
  "candlelight-dinner-speedboat-sonnenuntergang-krabi.webp": "hf_20261005_002200_f4dd418a-7451-4032-ae1f-351ed5c93341_min.webp",
  "familie-sandbank-krabi-kinder-schnorcheln.webp": "hf_20261005_002201_56ca4fae-a945-432b-9bae-69a8023e2e41_min.webp",
  "james-bond-island-phang-nga-bucht.webp": "hf_20261005_002200_9872044f-6330-4365-aceb-57ede1e306a3_min.webp",
  "railay-beach-krabi-goldene-stunde.webp": "hf_20261005_002159_b882635e-039b-43c1-b839-eaf0a7162ce7_min.webp",
  "speedboat-krabi-drohnenaufnahme-inseln.webp": "hf_20261005_002159_663f2830-4e95-483f-8ce4-ca8a82093d7d_min.webp",
  "privates-speedboat-krabi-paar-champagner-1.webp": "hf_20261004_051237_8e5ea54a-568d-4ca4-8bf4-78a0ddb50b78_min.webp",
  "privates-speedboat-krabi-paar-champagner-2.webp": "hf_20261004_051237_1d623517-1da5-4281-a981-3fcbf222bdb2_min.webp",
  "longtail-boot-krabi-ueberfuellt.webp": "hf_20261004_051122_eda16af9-06c0-4627-ba34-f2df5c945e33_min.webp",
  "krabi-secret-islands-logo.png": "hf_20261004_044905_49752f2a-c380-4b9a-a061-294ac851b827.png",
};

export const seoImage = (name: keyof typeof SEO_IMAGES & string) => `/bilder/${name}`;
export const upstreamFor = (name: string): string | null => (SEO_IMAGES[name] ? CDN + SEO_IMAGES[name] : null);
