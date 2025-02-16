export default async function preload(filePaths: string[]): Promise<void> {
  const cache = await window.caches.open("sokoban");
  cache.addAll(filePaths);
}
