export default function generateSlug(
  eventName: string,
  eventId: number | string
): string {
  // Handle empty or invalid input
  if (!eventName || typeof eventName !== "string" || eventName.trim() === "") {
    return `event-${eventId}`;
  }

  // Normalize to decompose accented characters (e.g., "é" → "e" + combining mark)
  let sanitized = eventName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Convert to lowercase and trim whitespace
  sanitized = sanitized.toLowerCase().trim();

  // Remove emojis and other non-alphanumeric Unicode characters
  // Keep letters, numbers, spaces, and hyphens
  sanitized = sanitized.replace(/[^\p{L}\p{N}\s-]/gu, "");

  // Replace all whitespace (spaces, tabs, etc.) with hyphens
  sanitized = sanitized.replace(/\s+/g, "-");

  // Replace multiple hyphens with a single hyphen
  sanitized = sanitized.replace(/-+/g, "-");

  // Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-|-$/g, "");

  // If the sanitized string is empty after processing, use a fallback
  if (sanitized === "") {
    return `event-${eventId}`;
  }

  // Append eventId to ensure uniqueness
  return `${sanitized}-${eventId}`;
}
