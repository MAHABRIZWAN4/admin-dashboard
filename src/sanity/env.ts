export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-01'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const token = assertValue(
  "sk3dghj2edATPyhygTBG8fSui9jTVAGquplgN42BZRnvmKIvMC5rW5NHg8Q3bVbD04vYJiLMzj6pOsole5JPbStqIpKqYSiqusRkP2ksZyrdjoFYuFvABxloBOhu4FCvkYs8lekOPbNiogA70D53m0fxntVTZpHOTw9HpP9L09gFCe7SApao",
  'Missing environment variable: NEXT_API_TOKEN'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}