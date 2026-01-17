// Avatar definitions for youth profiles
// Expanded collection with unlockable and seasonal avatars

export type AvatarStyle = 'pixel' | 'cute' | 'kpop' | 'nature' | 'space' | 'sports' | 'food' | 'music' | 'gaming' | 'seasonal' | 'achievement';

export interface UnlockRequirement {
  type: 'jobs_completed' | 'five_star_reviews' | 'reliability_score' | 'total_earnings' | 'seasonal' | 'account_age';
  value: number;
  description: string;
}

export interface AvatarDefinition {
  id: string;
  name: string;
  style: AvatarStyle;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  category: string;
  unlockRequirement?: UnlockRequirement;
}

export const avatarCategories = [
  { id: 'pixel', name: 'Pixel Heroes', description: 'Minecraft-inspired blocky style' },
  { id: 'cute', name: 'Kawaii Friends', description: 'Nintendo-inspired cute characters' },
  { id: 'kpop', name: 'K-Pop Stars', description: 'Colorful idol-inspired looks' },
  { id: 'nature', name: 'Nature Spirits', description: 'Plants and animals' },
  { id: 'space', name: 'Space Explorers', description: 'Cosmic adventurers' },
  { id: 'sports', name: 'Sports Stars', description: 'Athletic champions' },
  { id: 'food', name: 'Foodie Friends', description: 'Delicious characters' },
  { id: 'music', name: 'Music Makers', description: 'Creative musicians' },
  { id: 'gaming', name: 'Game Masters', description: 'Gaming legends' },
  { id: 'seasonal', name: 'Seasonal', description: 'Limited edition seasonal avatars' },
  { id: 'achievement', name: 'Achievements', description: 'Unlock by completing goals' },
];

export const avatars: AvatarDefinition[] = [
  // ============================================
  // PIXEL HEROES (Minecraft-inspired)
  // ============================================
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
  {
    id: 'pixel-knight',
    name: 'Pixel Knight',
    style: 'pixel',
    emoji: '🛡️',
    bgGradient: 'from-slate-400 to-zinc-500',
    borderColor: 'border-slate-600',
    category: 'pixel',
  },
  {
    id: 'pixel-ninja',
    name: 'Pixel Ninja',
    style: 'pixel',
    emoji: '🥷',
    bgGradient: 'from-gray-700 to-black',
    borderColor: 'border-gray-800',
    category: 'pixel',
  },

  // ============================================
  // KAWAII FRIENDS (Nintendo-inspired)
  // ============================================
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
  {
    id: 'kawaii-bear',
    name: 'Teddy Bear',
    style: 'cute',
    emoji: '🧸',
    bgGradient: 'from-amber-300 to-orange-400',
    borderColor: 'border-amber-500',
    category: 'cute',
  },
  {
    id: 'kawaii-balloon',
    name: 'Balloon Friend',
    style: 'cute',
    emoji: '🎈',
    bgGradient: 'from-red-400 to-pink-500',
    borderColor: 'border-red-500',
    category: 'cute',
  },

  // ============================================
  // K-POP STARS
  // ============================================
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
  {
    id: 'kpop-mic',
    name: 'Stage Star',
    style: 'kpop',
    emoji: '🎤',
    bgGradient: 'from-fuchsia-400 to-purple-500',
    borderColor: 'border-fuchsia-500',
    category: 'kpop',
  },
  {
    id: 'kpop-heart-eyes',
    name: 'Fan Heart',
    style: 'kpop',
    emoji: '😍',
    bgGradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-500',
    category: 'kpop',
  },

  // ============================================
  // NATURE SPIRITS
  // ============================================
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
  {
    id: 'nature-dog',
    name: 'Loyal Pup',
    style: 'nature',
    emoji: '🐶',
    bgGradient: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-500',
    category: 'nature',
  },
  {
    id: 'nature-owl',
    name: 'Wise Owl',
    style: 'nature',
    emoji: '🦉',
    bgGradient: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-700',
    category: 'nature',
  },
  {
    id: 'nature-panda',
    name: 'Panda Pal',
    style: 'nature',
    emoji: '🐼',
    bgGradient: 'from-gray-200 to-slate-300',
    borderColor: 'border-gray-400',
    category: 'nature',
  },
  {
    id: 'nature-dolphin',
    name: 'Dolphin Dash',
    style: 'nature',
    emoji: '🐬',
    bgGradient: 'from-blue-400 to-cyan-500',
    borderColor: 'border-blue-500',
    category: 'nature',
  },

  // ============================================
  // SPACE EXPLORERS
  // ============================================
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
  {
    id: 'space-star',
    name: 'Shooting Star',
    style: 'space',
    emoji: '🌟',
    bgGradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-500',
    category: 'space',
  },
  {
    id: 'space-ufo',
    name: 'UFO Pilot',
    style: 'space',
    emoji: '🛸',
    bgGradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-500',
    category: 'space',
  },

  // ============================================
  // SPORTS STARS (NEW)
  // ============================================
  {
    id: 'sports-soccer',
    name: 'Soccer Star',
    style: 'sports',
    emoji: '⚽',
    bgGradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-600',
    category: 'sports',
  },
  {
    id: 'sports-basketball',
    name: 'Hoop Hero',
    style: 'sports',
    emoji: '🏀',
    bgGradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-600',
    category: 'sports',
  },
  {
    id: 'sports-tennis',
    name: 'Tennis Ace',
    style: 'sports',
    emoji: '🎾',
    bgGradient: 'from-lime-400 to-green-500',
    borderColor: 'border-lime-500',
    category: 'sports',
  },
  {
    id: 'sports-swimming',
    name: 'Swim Champ',
    style: 'sports',
    emoji: '🏊',
    bgGradient: 'from-cyan-400 to-blue-500',
    borderColor: 'border-cyan-500',
    category: 'sports',
  },
  {
    id: 'sports-skiing',
    name: 'Ski Racer',
    style: 'sports',
    emoji: '⛷️',
    bgGradient: 'from-sky-400 to-blue-500',
    borderColor: 'border-sky-500',
    category: 'sports',
  },
  {
    id: 'sports-skateboard',
    name: 'Skate Pro',
    style: 'sports',
    emoji: '🛹',
    bgGradient: 'from-purple-500 to-fuchsia-600',
    borderColor: 'border-purple-600',
    category: 'sports',
  },
  {
    id: 'sports-cycling',
    name: 'Bike Rider',
    style: 'sports',
    emoji: '🚴',
    bgGradient: 'from-red-500 to-orange-600',
    borderColor: 'border-red-600',
    category: 'sports',
  },
  {
    id: 'sports-medal',
    name: 'Gold Medal',
    style: 'sports',
    emoji: '🥇',
    bgGradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-500',
    category: 'sports',
  },

  // ============================================
  // FOODIE FRIENDS (NEW)
  // ============================================
  {
    id: 'food-pizza',
    name: 'Pizza Pal',
    style: 'food',
    emoji: '🍕',
    bgGradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-500',
    category: 'food',
  },
  {
    id: 'food-taco',
    name: 'Taco Time',
    style: 'food',
    emoji: '🌮',
    bgGradient: 'from-yellow-400 to-orange-500',
    borderColor: 'border-yellow-500',
    category: 'food',
  },
  {
    id: 'food-sushi',
    name: 'Sushi Roll',
    style: 'food',
    emoji: '🍣',
    bgGradient: 'from-rose-400 to-red-500',
    borderColor: 'border-rose-500',
    category: 'food',
  },
  {
    id: 'food-icecream',
    name: 'Ice Cream',
    style: 'food',
    emoji: '🍦',
    bgGradient: 'from-pink-300 to-rose-400',
    borderColor: 'border-pink-400',
    category: 'food',
  },
  {
    id: 'food-donut',
    name: 'Donut Buddy',
    style: 'food',
    emoji: '🍩',
    bgGradient: 'from-pink-400 to-fuchsia-500',
    borderColor: 'border-pink-500',
    category: 'food',
  },
  {
    id: 'food-cupcake',
    name: 'Cupcake',
    style: 'food',
    emoji: '🧁',
    bgGradient: 'from-rose-300 to-pink-400',
    borderColor: 'border-rose-400',
    category: 'food',
  },
  {
    id: 'food-burger',
    name: 'Burger Boss',
    style: 'food',
    emoji: '🍔',
    bgGradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-600',
    category: 'food',
  },
  {
    id: 'food-ramen',
    name: 'Ramen Master',
    style: 'food',
    emoji: '🍜',
    bgGradient: 'from-orange-400 to-amber-500',
    borderColor: 'border-orange-500',
    category: 'food',
  },

  // ============================================
  // MUSIC MAKERS (NEW)
  // ============================================
  {
    id: 'music-guitar',
    name: 'Guitar Hero',
    style: 'music',
    emoji: '🎸',
    bgGradient: 'from-red-500 to-rose-600',
    borderColor: 'border-red-600',
    category: 'music',
  },
  {
    id: 'music-drums',
    name: 'Beat Master',
    style: 'music',
    emoji: '🥁',
    bgGradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-600',
    category: 'music',
  },
  {
    id: 'music-piano',
    name: 'Piano Pro',
    style: 'music',
    emoji: '🎹',
    bgGradient: 'from-gray-700 to-slate-800',
    borderColor: 'border-gray-800',
    category: 'music',
  },
  {
    id: 'music-headphones',
    name: 'DJ Mix',
    style: 'music',
    emoji: '🎧',
    bgGradient: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-600',
    category: 'music',
  },
  {
    id: 'music-notes',
    name: 'Melody Maker',
    style: 'music',
    emoji: '🎵',
    bgGradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-600',
    category: 'music',
  },
  {
    id: 'music-violin',
    name: 'Violin Virtuoso',
    style: 'music',
    emoji: '🎻',
    bgGradient: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-700',
    category: 'music',
  },
  {
    id: 'music-saxophone',
    name: 'Sax Player',
    style: 'music',
    emoji: '🎷',
    bgGradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-600',
    category: 'music',
  },
  {
    id: 'music-singer',
    name: 'Lead Singer',
    style: 'music',
    emoji: '🎤',
    bgGradient: 'from-fuchsia-500 to-pink-600',
    borderColor: 'border-fuchsia-600',
    category: 'music',
  },

  // ============================================
  // GAME MASTERS (NEW)
  // ============================================
  {
    id: 'gaming-controller',
    name: 'Game Pro',
    style: 'gaming',
    emoji: '🎮',
    bgGradient: 'from-indigo-500 to-purple-600',
    borderColor: 'border-indigo-600',
    category: 'gaming',
  },
  {
    id: 'gaming-dice',
    name: 'Dice Roller',
    style: 'gaming',
    emoji: '🎲',
    bgGradient: 'from-red-500 to-rose-600',
    borderColor: 'border-red-600',
    category: 'gaming',
  },
  {
    id: 'gaming-trophy',
    name: 'Trophy Winner',
    style: 'gaming',
    emoji: '🏆',
    bgGradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-500',
    category: 'gaming',
  },
  {
    id: 'gaming-joystick',
    name: 'Arcade King',
    style: 'gaming',
    emoji: '🕹️',
    bgGradient: 'from-red-600 to-orange-700',
    borderColor: 'border-red-700',
    category: 'gaming',
  },
  {
    id: 'gaming-puzzle',
    name: 'Puzzle Master',
    style: 'gaming',
    emoji: '🧩',
    bgGradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-600',
    category: 'gaming',
  },
  {
    id: 'gaming-chess',
    name: 'Chess Champ',
    style: 'gaming',
    emoji: '♟️',
    bgGradient: 'from-gray-600 to-slate-700',
    borderColor: 'border-gray-700',
    category: 'gaming',
  },
  {
    id: 'gaming-target',
    name: 'Sharpshooter',
    style: 'gaming',
    emoji: '🎯',
    bgGradient: 'from-red-500 to-rose-600',
    borderColor: 'border-red-600',
    category: 'gaming',
  },
  {
    id: 'gaming-crystal',
    name: 'Crystal Collector',
    style: 'gaming',
    emoji: '🔷',
    bgGradient: 'from-cyan-400 to-blue-500',
    borderColor: 'border-cyan-500',
    category: 'gaming',
  },

  // ============================================
  // SEASONAL AVATARS
  // ============================================
  // Winter
  {
    id: 'seasonal-snowman',
    name: 'Frosty Friend',
    style: 'seasonal',
    emoji: '⛄',
    bgGradient: 'from-sky-200 to-blue-300',
    borderColor: 'border-sky-400',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 12, // December
      description: 'Available in Winter (Dec-Feb)',
    },
  },
  {
    id: 'seasonal-snowflake',
    name: 'Snowflake',
    style: 'seasonal',
    emoji: '❄️',
    bgGradient: 'from-cyan-200 to-sky-300',
    borderColor: 'border-cyan-400',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 12,
      description: 'Available in Winter (Dec-Feb)',
    },
  },
  {
    id: 'seasonal-christmas',
    name: 'Holiday Spirit',
    style: 'seasonal',
    emoji: '🎄',
    bgGradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-600',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 12,
      description: 'Available in December',
    },
  },
  // Spring
  {
    id: 'seasonal-blossom',
    name: 'Spring Blossom',
    style: 'seasonal',
    emoji: '🌸',
    bgGradient: 'from-pink-300 to-rose-400',
    borderColor: 'border-pink-400',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 3, // March
      description: 'Available in Spring (Mar-May)',
    },
  },
  {
    id: 'seasonal-rainbow',
    name: 'Spring Rainbow',
    style: 'seasonal',
    emoji: '🌈',
    bgGradient: 'from-red-400 via-yellow-400 to-blue-400',
    borderColor: 'border-purple-400',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 3,
      description: 'Available in Spring (Mar-May)',
    },
  },
  {
    id: 'seasonal-chick',
    name: 'Spring Chick',
    style: 'seasonal',
    emoji: '🐥',
    bgGradient: 'from-yellow-300 to-amber-400',
    borderColor: 'border-yellow-500',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 4,
      description: 'Available in Spring (Mar-May)',
    },
  },
  // Summer
  {
    id: 'seasonal-beach',
    name: 'Beach Vibes',
    style: 'seasonal',
    emoji: '🏖️',
    bgGradient: 'from-yellow-400 to-orange-500',
    borderColor: 'border-yellow-500',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 6, // June
      description: 'Available in Summer (Jun-Aug)',
    },
  },
  {
    id: 'seasonal-sun',
    name: 'Summer Sun',
    style: 'seasonal',
    emoji: '☀️',
    bgGradient: 'from-orange-400 to-red-500',
    borderColor: 'border-orange-500',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 6,
      description: 'Available in Summer (Jun-Aug)',
    },
  },
  {
    id: 'seasonal-palm',
    name: 'Palm Paradise',
    style: 'seasonal',
    emoji: '🌴',
    bgGradient: 'from-green-400 to-teal-500',
    borderColor: 'border-green-500',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 7,
      description: 'Available in Summer (Jun-Aug)',
    },
  },
  // Autumn
  {
    id: 'seasonal-maple',
    name: 'Autumn Leaf',
    style: 'seasonal',
    emoji: '🍁',
    bgGradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-600',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 9, // September
      description: 'Available in Autumn (Sep-Nov)',
    },
  },
  {
    id: 'seasonal-pumpkin',
    name: 'Pumpkin Patch',
    style: 'seasonal',
    emoji: '🎃',
    bgGradient: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-600',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 10,
      description: 'Available in October',
    },
  },
  {
    id: 'seasonal-acorn',
    name: 'Acorn Hunter',
    style: 'seasonal',
    emoji: '🌰',
    bgGradient: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-700',
    category: 'seasonal',
    unlockRequirement: {
      type: 'seasonal',
      value: 9,
      description: 'Available in Autumn (Sep-Nov)',
    },
  },

  // ============================================
  // ACHIEVEMENT AVATARS (Unlockable)
  // ============================================
  {
    id: 'achievement-first-job',
    name: 'First Steps',
    style: 'achievement',
    emoji: '🎯',
    bgGradient: 'from-green-400 to-emerald-500',
    borderColor: 'border-green-500',
    category: 'achievement',
    unlockRequirement: {
      type: 'jobs_completed',
      value: 1,
      description: 'Complete your first job',
    },
  },
  {
    id: 'achievement-five-jobs',
    name: 'Rising Star',
    style: 'achievement',
    emoji: '🌟',
    bgGradient: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-500',
    category: 'achievement',
    unlockRequirement: {
      type: 'jobs_completed',
      value: 5,
      description: 'Complete 5 jobs',
    },
  },
  {
    id: 'achievement-ten-jobs',
    name: 'Pro Worker',
    style: 'achievement',
    emoji: '💪',
    bgGradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-600',
    category: 'achievement',
    unlockRequirement: {
      type: 'jobs_completed',
      value: 10,
      description: 'Complete 10 jobs',
    },
  },
  {
    id: 'achievement-twenty-jobs',
    name: 'Super Worker',
    style: 'achievement',
    emoji: '🦸',
    bgGradient: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-600',
    category: 'achievement',
    unlockRequirement: {
      type: 'jobs_completed',
      value: 20,
      description: 'Complete 20 jobs',
    },
  },
  {
    id: 'achievement-fifty-jobs',
    name: 'Legend',
    style: 'achievement',
    emoji: '👑',
    bgGradient: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-500',
    category: 'achievement',
    unlockRequirement: {
      type: 'jobs_completed',
      value: 50,
      description: 'Complete 50 jobs',
    },
  },
  {
    id: 'achievement-first-star',
    name: 'Star Earned',
    style: 'achievement',
    emoji: '⭐',
    bgGradient: 'from-yellow-300 to-amber-400',
    borderColor: 'border-yellow-400',
    category: 'achievement',
    unlockRequirement: {
      type: 'five_star_reviews',
      value: 1,
      description: 'Receive your first 5-star review',
    },
  },
  {
    id: 'achievement-five-stars',
    name: 'Star Collector',
    style: 'achievement',
    emoji: '🌟',
    bgGradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-500',
    category: 'achievement',
    unlockRequirement: {
      type: 'five_star_reviews',
      value: 5,
      description: 'Receive 5 five-star reviews',
    },
  },
  {
    id: 'achievement-ten-stars',
    name: 'Star Master',
    style: 'achievement',
    emoji: '✨',
    bgGradient: 'from-yellow-400 via-amber-400 to-orange-400',
    borderColor: 'border-yellow-500',
    category: 'achievement',
    unlockRequirement: {
      type: 'five_star_reviews',
      value: 10,
      description: 'Receive 10 five-star reviews',
    },
  },
  {
    id: 'achievement-reliable',
    name: 'Reliable Rock',
    style: 'achievement',
    emoji: '🪨',
    bgGradient: 'from-slate-500 to-gray-600',
    borderColor: 'border-slate-600',
    category: 'achievement',
    unlockRequirement: {
      type: 'reliability_score',
      value: 90,
      description: 'Reach 90% reliability score',
    },
  },
  {
    id: 'achievement-perfect-reliability',
    name: 'Perfect Record',
    style: 'achievement',
    emoji: '💯',
    bgGradient: 'from-emerald-500 to-green-600',
    borderColor: 'border-emerald-600',
    category: 'achievement',
    unlockRequirement: {
      type: 'reliability_score',
      value: 100,
      description: 'Achieve 100% reliability',
    },
  },
  {
    id: 'achievement-earnings-100',
    name: 'First Hundred',
    style: 'achievement',
    emoji: '💵',
    bgGradient: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-600',
    category: 'achievement',
    unlockRequirement: {
      type: 'total_earnings',
      value: 100,
      description: 'Earn your first 100 kr',
    },
  },
  {
    id: 'achievement-earnings-500',
    name: 'Money Maker',
    style: 'achievement',
    emoji: '💰',
    bgGradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-600',
    category: 'achievement',
    unlockRequirement: {
      type: 'total_earnings',
      value: 500,
      description: 'Earn 500 kr total',
    },
  },
  {
    id: 'achievement-earnings-1000',
    name: 'Thousandaire',
    style: 'achievement',
    emoji: '🤑',
    bgGradient: 'from-teal-500 to-cyan-600',
    borderColor: 'border-teal-600',
    category: 'achievement',
    unlockRequirement: {
      type: 'total_earnings',
      value: 1000,
      description: 'Earn 1,000 kr total',
    },
  },
  {
    id: 'achievement-veteran',
    name: 'Platform Veteran',
    style: 'achievement',
    emoji: '🎖️',
    bgGradient: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-700',
    category: 'achievement',
    unlockRequirement: {
      type: 'account_age',
      value: 365,
      description: 'Be a member for 1 year',
    },
  },
  {
    id: 'achievement-og',
    name: 'OG Member',
    style: 'achievement',
    emoji: '🏛️',
    bgGradient: 'from-violet-600 to-purple-700',
    borderColor: 'border-violet-700',
    category: 'achievement',
    unlockRequirement: {
      type: 'account_age',
      value: 730,
      description: 'Be a member for 2 years',
    },
  },
];

export const defaultAvatarId = 'kawaii-star';

export function getAvatarById(id: string): AvatarDefinition | undefined {
  return avatars.find(a => a.id === id);
}

export function getAvatarsByCategory(category: string): AvatarDefinition[] {
  return avatars.filter(a => a.category === category);
}

export function getUnlockedAvatars(avatarList: AvatarDefinition[], userStats: {
  jobsCompleted: number;
  fiveStarReviews: number;
  reliabilityScore: number;
  totalEarnings: number;
  accountAgeDays: number;
}): AvatarDefinition[] {
  const currentMonth = new Date().getMonth() + 1; // 1-12

  return avatarList.filter(avatar => {
    if (!avatar.unlockRequirement) return true;

    const req = avatar.unlockRequirement;

    switch (req.type) {
      case 'jobs_completed':
        return userStats.jobsCompleted >= req.value;
      case 'five_star_reviews':
        return userStats.fiveStarReviews >= req.value;
      case 'reliability_score':
        return userStats.reliabilityScore >= req.value;
      case 'total_earnings':
        return userStats.totalEarnings >= req.value;
      case 'account_age':
        return userStats.accountAgeDays >= req.value;
      case 'seasonal':
        // Check if current month matches the season
        const seasonMonths: Record<number, number[]> = {
          12: [12, 1, 2], // Winter: Dec, Jan, Feb
          3: [3, 4, 5],   // Spring: Mar, Apr, May
          6: [6, 7, 8],   // Summer: Jun, Jul, Aug
          9: [9, 10, 11], // Autumn: Sep, Oct, Nov
        };
        const startMonth = req.value;
        const validMonths = seasonMonths[startMonth] || [startMonth];
        return validMonths.includes(currentMonth);
      default:
        return true;
    }
  });
}

export function isAvatarUnlocked(avatar: AvatarDefinition, userStats: {
  jobsCompleted: number;
  fiveStarReviews: number;
  reliabilityScore: number;
  totalEarnings: number;
  accountAgeDays: number;
}): boolean {
  if (!avatar.unlockRequirement) return true;

  const unlockedAvatars = getUnlockedAvatars([avatar], userStats);
  return unlockedAvatars.length > 0;
}
