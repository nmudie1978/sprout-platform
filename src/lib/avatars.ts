// Avatar definitions for youth profiles
// Inspired by Minecraft, Nintendo, and K-pop styles

export type AvatarStyle = 'pixel' | 'cute' | 'kpop' | 'nature' | 'space';

export interface AvatarDefinition {
  id: string;
  name: string;
  style: AvatarStyle;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  category: string;
}

export const avatarCategories = [
  { id: 'pixel', name: 'Pixel Heroes', description: 'Minecraft-inspired blocky style' },
  { id: 'cute', name: 'Kawaii Friends', description: 'Nintendo-inspired cute characters' },
  { id: 'kpop', name: 'K-Pop Stars', description: 'Colorful idol-inspired looks' },
  { id: 'nature', name: 'Nature Spirits', description: 'Plants and animals' },
  { id: 'space', name: 'Space Explorers', description: 'Cosmic adventurers' },
];

export const avatars: AvatarDefinition[] = [
  // Pixel Heroes (Minecraft-inspired)
  {
    id: 'pixel-warrior',
    name: 'Pixel Warrior',
    style: 'pixel',
    emoji: '⚔️',
    bgGradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-600',
    category: 'pixel',
  },
  {
    id: 'pixel-mage',
    name: 'Pixel Mage',
    style: 'pixel',
    emoji: '🔮',
    bgGradient: 'from-purple-400 to-indigo-500',
    borderColor: 'border-purple-600',
    category: 'pixel',
  },
  {
    id: 'pixel-builder',
    name: 'Pixel Builder',
    style: 'pixel',
    emoji: '🧱',
    bgGradient: 'from-emerald-400 to-green-500',
    borderColor: 'border-emerald-600',
    category: 'pixel',
  },
  {
    id: 'pixel-explorer',
    name: 'Pixel Explorer',
    style: 'pixel',
    emoji: '🗺️',
    bgGradient: 'from-cyan-400 to-blue-500',
    borderColor: 'border-cyan-600',
    category: 'pixel',
  },
  {
    id: 'pixel-crafter',
    name: 'Pixel Crafter',
    style: 'pixel',
    emoji: '⛏️',
    bgGradient: 'from-gray-400 to-slate-500',
    borderColor: 'border-gray-600',
    category: 'pixel',
  },
  {
    id: 'pixel-archer',
    name: 'Pixel Archer',
    style: 'pixel',
    emoji: '🏹',
    bgGradient: 'from-lime-400 to-green-500',
    borderColor: 'border-lime-600',
    category: 'pixel',
  },

  // Kawaii Friends (Nintendo-inspired)
  {
    id: 'kawaii-star',
    name: 'Star Friend',
    style: 'cute',
    emoji: '⭐',
    bgGradient: 'from-yellow-300 to-amber-400',
    borderColor: 'border-yellow-500',
    category: 'cute',
  },
  {
    id: 'kawaii-cloud',
    name: 'Cloud Buddy',
    style: 'cute',
    emoji: '☁️',
    bgGradient: 'from-sky-200 to-blue-300',
    borderColor: 'border-sky-400',
    category: 'cute',
  },
  {
    id: 'kawaii-mushroom',
    name: 'Mushroom Pal',
    style: 'cute',
    emoji: '🍄',
    bgGradient: 'from-red-400 to-rose-500',
    borderColor: 'border-red-500',
    category: 'cute',
  },
  {
    id: 'kawaii-heart',
    name: 'Heart Hero',
    style: 'cute',
    emoji: '💖',
    bgGradient: 'from-pink-300 to-rose-400',
    borderColor: 'border-pink-500',
    category: 'cute',
  },
  {
    id: 'kawaii-rainbow',
    name: 'Rainbow Kid',
    style: 'cute',
    emoji: '🌈',
    bgGradient: 'from-violet-300 via-pink-300 to-orange-300',
    borderColor: 'border-violet-400',
    category: 'cute',
  },
  {
    id: 'kawaii-cherry',
    name: 'Cherry Charm',
    style: 'cute',
    emoji: '🍒',
    bgGradient: 'from-red-300 to-pink-400',
    borderColor: 'border-red-400',
    category: 'cute',
  },

  // K-Pop Stars
  {
    id: 'kpop-purple',
    name: 'Purple Ocean',
    style: 'kpop',
    emoji: '💜',
    bgGradient: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-400',
    category: 'kpop',
  },
  {
    id: 'kpop-lightstick',
    name: 'Lightstick',
    style: 'kpop',
    emoji: '🔦',
    bgGradient: 'from-pink-500 to-fuchsia-600',
    borderColor: 'border-pink-400',
    category: 'kpop',
  },
  {
    id: 'kpop-crown',
    name: 'Crown Royal',
    style: 'kpop',
    emoji: '👑',
    bgGradient: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-500',
    category: 'kpop',
  },
  {
    id: 'kpop-butterfly',
    name: 'Butterfly',
    style: 'kpop',
    emoji: '🦋',
    bgGradient: 'from-sky-400 to-indigo-500',
    borderColor: 'border-sky-500',
    category: 'kpop',
  },
  {
    id: 'kpop-rose',
    name: 'Rose Gold',
    style: 'kpop',
    emoji: '🌹',
    bgGradient: 'from-rose-400 to-red-500',
    borderColor: 'border-rose-500',
    category: 'kpop',
  },
  {
    id: 'kpop-diamond',
    name: 'Diamond',
    style: 'kpop',
    emoji: '💎',
    bgGradient: 'from-cyan-300 to-blue-400',
    borderColor: 'border-cyan-400',
    category: 'kpop',
  },

  // Nature Spirits
  {
    id: 'nature-leaf',
    name: 'Leaf Spirit',
    style: 'nature',
    emoji: '🌿',
    bgGradient: 'from-green-400 to-emerald-500',
    borderColor: 'border-green-500',
    category: 'nature',
  },
  {
    id: 'nature-flower',
    name: 'Flower Power',
    style: 'nature',
    emoji: '🌸',
    bgGradient: 'from-pink-300 to-rose-400',
    borderColor: 'border-pink-400',
    category: 'nature',
  },
  {
    id: 'nature-sun',
    name: 'Sunshine',
    style: 'nature',
    emoji: '🌻',
    bgGradient: 'from-yellow-400 to-orange-500',
    borderColor: 'border-yellow-500',
    category: 'nature',
  },
  {
    id: 'nature-fox',
    name: 'Fox Friend',
    style: 'nature',
    emoji: '🦊',
    bgGradient: 'from-orange-400 to-amber-500',
    borderColor: 'border-orange-500',
    category: 'nature',
  },
  {
    id: 'nature-bunny',
    name: 'Bunny Hop',
    style: 'nature',
    emoji: '🐰',
    bgGradient: 'from-pink-200 to-rose-300',
    borderColor: 'border-pink-300',
    category: 'nature',
  },
  {
    id: 'nature-cat',
    name: 'Cool Cat',
    style: 'nature',
    emoji: '🐱',
    bgGradient: 'from-amber-300 to-orange-400',
    borderColor: 'border-amber-400',
    category: 'nature',
  },

  // Space Explorers
  {
    id: 'space-rocket',
    name: 'Rocket Rider',
    style: 'space',
    emoji: '🚀',
    bgGradient: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-400',
    category: 'space',
  },
  {
    id: 'space-moon',
    name: 'Moon Walker',
    style: 'space',
    emoji: '🌙',
    bgGradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-500',
    category: 'space',
  },
  {
    id: 'space-alien',
    name: 'Space Buddy',
    style: 'space',
    emoji: '👽',
    bgGradient: 'from-green-400 to-teal-500',
    borderColor: 'border-green-500',
    category: 'space',
  },
  {
    id: 'space-planet',
    name: 'Planet Hopper',
    style: 'space',
    emoji: '🪐',
    bgGradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-600',
    category: 'space',
  },
  {
    id: 'space-comet',
    name: 'Comet Chaser',
    style: 'space',
    emoji: '☄️',
    bgGradient: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-500',
    category: 'space',
  },
  {
    id: 'space-galaxy',
    name: 'Galaxy Guide',
    style: 'space',
    emoji: '🌌',
    bgGradient: 'from-violet-600 to-indigo-700',
    borderColor: 'border-violet-500',
    category: 'space',
  },
];

export const defaultAvatarId = 'kawaii-star';

export function getAvatarById(id: string): AvatarDefinition | undefined {
  return avatars.find(a => a.id === id);
}

export function getAvatarsByCategory(category: string): AvatarDefinition[] {
  return avatars.filter(a => a.category === category);
}
