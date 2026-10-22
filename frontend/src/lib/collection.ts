import hero from '@/assets/saree-hero.jpg';
import rose from '@/assets/rose-saree.jpg';
import ivory from '@/assets/ivory-saree.jpg';
import wine from '@/assets/wine-saree.jpg';
import sapphire from '@/assets/sapphire-saree.jpg';
import maroon from '@/assets/maroon-saree.jpg';
import tissue from '@/assets/tissue-saree.jpg';
import lavender from '@/assets/lavender-saree.jpg';

export const collection = [
  {
    id: 'emerald',
    name: 'The Emerald Edit',
    category: 'Festive',
    price: 14500,
    formattedPrice: '₹14,500',
    image: hero,
    detail: 'Deep emerald tones, a graceful drape and an ornate golden border. A celebration of timeless saree style.',
    fabric: 'Pure Mulberry Silk with Rich Gold Zari',
    color: 'Emerald Green',
    position: 'emerald-image',
  },
  {
    id: 'sapphire',
    name: 'Royal Sapphire Silk',
    category: 'Silk',
    price: 17500,
    formattedPrice: '₹17,500',
    image: sapphire,
    detail: 'A luminous royal sapphire blue silk saree woven with timeless antique gold zari borders and regal peacock motifs.',
    fabric: 'Kanchipuram Brocade Silk',
    color: 'Royal Sapphire Blue',
    position: '',
  },
  {
    id: 'maroon-bridal',
    name: 'Noor Banarasi Bridal',
    category: 'Bridal',
    price: 24500,
    formattedPrice: '₹24,500',
    image: maroon,
    detail: 'Opulent crimson maroon Banarasi bridal saree adorned with intricate golden jaal work and rich royal pallu.',
    fabric: 'Pure Katan Silk Banarasi',
    color: 'Deep Crimson Maroon',
    position: '',
  },
  {
    id: 'tissue',
    name: 'Gilded Tissue Elegance',
    category: 'Festive',
    price: 15200,
    formattedPrice: '₹15,200',
    image: tissue,
    detail: 'Effortlessly luminous champagne gold tissue silk saree designed with understated lotus motifs and fluid drape.',
    fabric: 'Champagne Tissue Metallic Silk',
    color: 'Shimmering Champagne Gold',
    position: '',
  },
  {
    id: 'rose',
    name: 'Rose Reverie',
    category: 'Silk',
    price: 12800,
    formattedPrice: '₹12,800',
    image: rose,
    detail: 'Soft rose hues meet intricate golden motifs in a refined, romantic silhouette.',
    fabric: 'Handloom Kora Silk',
    color: 'Dusty Rose Pink',
    position: '',
  },
  {
    id: 'lavender',
    name: 'Lavender Whisper Organza',
    category: 'Silk',
    price: 13400,
    formattedPrice: '₹13,400',
    image: lavender,
    detail: 'Ethereal pastel lilac organza saree embellished with delicate silver gota patti work and scalloped borders.',
    fabric: 'Pure Organza Silk',
    color: 'Pastel Lilac Lavender',
    position: '',
  },
  {
    id: 'ivory',
    name: 'Ivory Grace',
    category: 'Everyday',
    price: 9500,
    formattedPrice: '₹9,500',
    image: ivory,
    detail: 'A luminous ivory palette with delicate golden accents. Quiet elegance for meaningful moments.',
    fabric: 'Chanderi Tussar Silk Blend',
    color: 'Warm Ivory & Cream',
    position: '',
  },
  {
    id: 'wine',
    name: 'The Heritage Drape',
    category: 'Festive',
    price: 16900,
    formattedPrice: '₹16,900',
    image: wine,
    detail: 'A rich wine palette and heritage-inspired golden detailing, brought together in an expressive drape.',
    fabric: 'Pure Banarasi Brocade Silk',
    color: 'Deep Wine Burgundy',
    position: '',
  },
];

export type CollectionPiece = typeof collection[number];
