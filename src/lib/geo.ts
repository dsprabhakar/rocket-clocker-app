export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function isInGeofence(
  userLat: number,
  userLon: number,
  siteLat: number,
  siteLon: number,
  radiusMeters: number
): boolean {
  return getDistance(userLat, userLon, siteLat, siteLon) <= radiusMeters
}

export async function getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    })
  } catch {
    return null
  }
}
