export {}

declare global {
  interface Window {
    ksc?: {
      maptool?: {
        importCoordinates: (coordinates: string) => void
        map?: {
          setView: (center: [number, number], zoom: number) => void
          remove: () => void
        }
      }
      $?: unknown
    }
  }

  declare const gInitLat: number
  declare const gInitLon: number
  declare const gInitZoom: number
}
