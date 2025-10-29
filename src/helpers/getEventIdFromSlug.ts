export default function getEventIdFromSlug(slug: string): string | null {
  // Match the last part after the final hyphen as the eventId
  const match = slug.match(/-(\d+)$/);
  if (match) {
    return match[1]; // Return the captured eventId
  }
  return null; // Return null if no valid eventId is found
}
