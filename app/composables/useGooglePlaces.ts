const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export interface PlacePrediction {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
  latitude: number
  longitude: number
  location_name: string
}

export interface PlaceDetails {
  place_id: string
  formatted_address: string
  name: string
  latitude: number
  longitude: number
  location_name: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  name: string
  lat: string
  lon: string
  address?: {
    country?: string
    state?: string
    city?: string
    town?: string
    village?: string
    road?: string
  }
}

export async function getPlacePredictions(input: string): Promise<PlacePrediction[]> {
  if (!input.trim()) return []
  if (typeof window === 'undefined') return []

  const params = new URLSearchParams({
    q: input.trim(),
    format: 'json',
    addressdetails: '1',
    limit: '5',
  })

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'Accept-Language': 'vi,en',
        'User-Agent': 'Code4AxisApp/1.0',
      },
    })

    if (!response.ok) {
      console.error(`[Nominatim] HTTP error: ${response.status} ${response.statusText}`)
      return []
    }

    const results: NominatimResult[] = await response.json()

    if (!results.length) return []

    return results.map((r) => {
      const parts = r.display_name.split(', ')
      const main_text = parts[0] || r.display_name
      const secondary_text = parts.slice(1).join(', ')

      return {
        place_id: String(r.place_id),
        description: r.display_name,
        main_text,
        secondary_text,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        location_name: r.name || main_text,
      }
    })
  } catch (err) {
    console.error('[Nominatim] getPlacePredictions failed:', err)
    return []
  }
}

export async function getPlaceDetails(prediction: PlacePrediction): Promise<PlaceDetails> {
  return {
    place_id: prediction.place_id,
    formatted_address: prediction.description,
    name: prediction.main_text,
    latitude: prediction.latitude,
    longitude: prediction.longitude,
    location_name: prediction.location_name,
  }
}
