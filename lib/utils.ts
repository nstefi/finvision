import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to handle API response errors
 * @param response - The fetch Response object
 * @returns A promise that resolves to the JSON data or rejects with a detailed error
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error (${response.status})`;

    try {
      // Try to parse as JSON
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || `Server error: ${response.status}`;
    } catch (parseError) {
      // If not JSON, use the text (truncated if too long)
      const truncatedText = errorText.length > 100
        ? `${errorText.substring(0, 100)}...`
        : errorText;
      errorMessage = `${errorMessage}: ${truncatedText}`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
