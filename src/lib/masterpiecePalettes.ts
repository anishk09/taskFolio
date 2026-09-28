export type MasterpiecePalette = {
  name: string;
  colors: [string, string, string, string];
  accent: string;
  image: string;
  title: string;
  artist: string;
  era: string;
  funFact: string;
};

export const MASTERPIECE_PALETTES: MasterpiecePalette[] = [
  {
    name: "Monet Nymphéas",
    colors: ["#1B2A4A", "#1F6B5C", "#8B7EC8", "#2A3B6E"],
    accent: "#6C86D6",
    image: "/art/monet-lilies.jpg",
    title: "Water Lilies",
    artist: "Claude Monet",
    era: "Impressionism · c. 1906",
    funFact: "Monet painted roughly 250 canvases of the water-lily pond in his Giverny garden over the last three decades of his life.",
  },
  {
    name: "Turner Sunrise",
    colors: ["#E8C468", "#C97B3D", "#D9B454", "#B5432E"],
    accent: "#E8C468",
    image: "/art/turner-norham-sunrise.jpg",
    title: "Norham Castle, Sunrise",
    artist: "J. M. W. Turner",
    era: "Romanticism · c. 1845",
    funFact: "Turner returned to Norham Castle so often across his career that its owner joked he deserved a share of the artist's profits.",
  },
  {
    name: "Van Gogh Starry Night",
    colors: ["#0B1E3D", "#1E4FA0", "#2A52A8", "#D9B454"],
    accent: "#3E6BD1",
    image: "/art/van-gogh-starry-night.jpg",
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    era: "Post-Impressionism · 1889",
    funFact: "Van Gogh painted it from memory at the Saint-Rémy asylum, depicting the pre-dawn view from his room before sunrise.",
  },
  {
    name: "Klimt Gilded Bloom",
    colors: ["#0A0A0A", "#3D2E1A", "#C9A227", "#E8C468"],
    accent: "#C9A227",
    image: "/art/klimt-the-kiss.jpg",
    title: "The Kiss",
    artist: "Gustav Klimt",
    era: "Vienna Secession · 1907–08",
    funFact: "Klimt applied real gold leaf to the canvas, a technique inspired by Byzantine mosaics he studied in Ravenna.",
  },
  {
    name: "Cézanne Provence",
    colors: ["#A3492E", "#1F6B45", "#6B6B3D", "#D9B454"],
    accent: "#A3492E",
    image: "/art/cezanne-mont-sainte-victoire.jpg",
    title: "Mont Sainte-Victoire",
    artist: "Paul Cézanne",
    era: "Post-Impressionism · c. 1900",
    funFact: "Cézanne painted this mountain near his home in Aix-en-Provence more than thirty times, treating it almost like a study in geometry.",
  },
];

export function pickRandomPaletteIndex(): number {
  return Math.floor(Math.random() * MASTERPIECE_PALETTES.length);
}

export function pickRandomPalette(): MasterpiecePalette {
  return MASTERPIECE_PALETTES[pickRandomPaletteIndex()];
}
