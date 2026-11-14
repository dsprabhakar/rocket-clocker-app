import Dexie, { type EntityTable } from 'dexie'

interface OfflinePunch {
  id?: number
  tempId: string
  employeeId: string
  siteId: string
  punchType: 'in' | 'out' | 'liveness'
  selfieBlob: Blob | null
  latitude: number | null
  longitude: number | null
  deviceId: string | null
  inGeofence: boolean | null
  punchedAt: string
  synced: boolean
}

interface OfflineTaskPhoto {
  id?: number
  tempId: string
  taskId: string
  employeeId: string
  photoType: 'before' | 'after'
  photoBlob: Blob
  synced: boolean
  createdAt: string
}

class RocketClockerDB extends Dexie {
  punches!: EntityTable<OfflinePunch, 'id'>
  taskPhotos!: EntityTable<OfflineTaskPhoto, 'id'>

  constructor() {
    super('RocketClockerOffline')
    this.version(1).stores({
      punches: '++id, tempId, employeeId, siteId, synced, punchedAt',
      taskPhotos: '++id, tempId, taskId, synced',
    })
  }
}

export const offlineDb = new RocketClockerDB()

export async function queuePunch(punch: Omit<OfflinePunch, 'id'>) {
  return offlineDb.punches.add(punch)
}

export async function getUnsyncedPunches() {
  return offlineDb.punches.where('synced').equals(0).toArray()
}

export async function markPunchSynced(id: number) {
  return offlineDb.punches.update(id, { synced: true })
}

export async function queueTaskPhoto(photo: Omit<OfflineTaskPhoto, 'id'>) {
  return offlineDb.taskPhotos.add(photo)
}

export async function getUnsyncedPhotos() {
  return offlineDb.taskPhotos.where('synced').equals(0).toArray()
}

export async function markPhotoSynced(id: number) {
  return offlineDb.taskPhotos.update(id, { synced: true })
}
