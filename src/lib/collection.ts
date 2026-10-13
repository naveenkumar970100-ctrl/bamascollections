import hero from '@/assets/saree-hero.jpg';
import rose from '@/assets/rose-saree.jpg';
import ivory from '@/assets/ivory-saree.jpg';
import wine from '@/assets/wine-saree.jpg';
export const collection = [
  { id: 'emerald', name: 'The Emerald Edit', category: 'Festive', image: hero, detail: 'Deep emerald tones, a graceful drape and an ornate golden border. A celebration of timeless saree style.', position: 'emerald-image' },
  { id: 'rose', name: 'Rose Reverie', category: 'Silk', image: rose, detail: 'Soft rose hues meet intricate golden motifs in a refined, romantic silhouette.', position: '' },
  { id: 'ivory', name: 'Ivory Grace', category: 'Everyday', image: ivory, detail: 'A luminous ivory palette with delicate golden accents. Quiet elegance for meaningful moments.', position: '' },
  { id: 'wine', name: 'The Heritage Drape', category: 'Festive', image: wine, detail: 'A rich wine palette and heritage-inspired golden detailing, brought together in an expressive drape.', position: '' },
];
export type CollectionPiece = typeof collection[number];
