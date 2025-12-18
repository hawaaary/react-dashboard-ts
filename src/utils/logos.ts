// Array of diverse logo emojis for different purposes
const LOGO_EMOJIS = [
  "👤", "👥", "📊", "📈", "💼", "🏢", "📋", "📝", "✅", "⚙️",
  "🔧", "🛠️", "💳", "💰", "💸", "📱", "💻", "🖥️", "⌚", "🎯",
  "🎓", "📚", "📖", "✏️", "🖊️", "🗂️", "📂", "📁", "🔐", "🔒",
  "🔑", "🎁", "📦", "📮", "📬", "📪", "🗣️", "💬", "📞", "☎️",
  "📠", "📡", "🌐", "🌍", "🗺️", "🧭", "⏰", "⏱️", "⏲️", "🕐",
  "📅", "📆", "🗓️", "⭐", "🌟", "✨", "🎪", "🎨", "🖼️", "🎭",
  "🎬", "🎤", "🎧", "🎵", "🎶", "🎸", "🎹", "🥁", "🎺", "🎻"
];

export function getRandomLogo(): string {
  return LOGO_EMOJIS[Math.floor(Math.random() * LOGO_EMOJIS.length)];
}

export function getConsistentLogo(id: number): string {
  return LOGO_EMOJIS[id % LOGO_EMOJIS.length];
}

export function getLogoForSource(source: string): string {
  // Generate consistent logo based on source string
  const hash = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return LOGO_EMOJIS[hash % LOGO_EMOJIS.length];
}
