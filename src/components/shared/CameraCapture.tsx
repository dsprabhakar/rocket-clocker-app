import { useRef, useState, useCallback } from 'react'
import { Camera, RotateCcw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  title?: string
  quality?: number
}

export function CameraCapture({ onCapture, onCancel, title = 'Take Photo', quality = 0.8 }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraReady(true)
      }
    } catch {
      setError('Camera access denied. Please enable camera permissions.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const size = Math.min(video.videoWidth, video.videoHeight)
    canvas.width = 640
    canvas.height = 640
    const ctx = canvas.getContext('2d')!
    const sx = (video.videoWidth - size) / 2
    const sy = (video.videoHeight - size) / 2
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 640, 640)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        setPhoto(canvas.toDataURL('image/jpeg', quality))
        setPhotoBlob(blob)
        stopCamera()
      },
      'image/jpeg',
      quality
    )
  }, [quality, stopCamera])

  const retake = useCallback(() => {
    setPhoto(null)
    setPhotoBlob(null)
    startCamera()
  }, [startCamera])

  const confirm = useCallback(() => {
    if (photoBlob) onCapture(photoBlob)
  }, [photoBlob, onCapture])

  // Check luminance for quality gate
  function checkQuality(canvas: HTMLCanvasElement): 'ok' | 'dark' | 'blurry' {
    const ctx = canvas.getContext('2d')!
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let totalLum = 0
    for (let i = 0; i < data.length; i += 16) {
      totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    const avgLum = totalLum / (data.length / 16)
    if (avgLum < 40) return 'dark'
    return 'ok'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <h3 className="text-white font-medium">{title}</h3>
        <button onClick={() => { stopCamera(); onCancel() }} className="text-white/70 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {!photo ? (
          <>
            <video
              ref={videoRef}
              className="w-full max-w-sm aspect-square object-cover rounded-2xl"
              playsInline
              muted
              autoPlay
              onLoadedMetadata={() => setCameraReady(true)}
            />
            {!cameraReady && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Camera className="text-white/50" size={48} />
                <Button onClick={startCamera} variant="secondary">Start Camera</Button>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
                <p className="text-red-400 text-center">{error}</p>
                <Button onClick={startCamera} variant="secondary">Retry</Button>
              </div>
            )}
          </>
        ) : (
          <img src={photo} alt="Captured" className="w-full max-w-sm aspect-square object-cover rounded-2xl" />
        )}
      </div>

      <div className="flex items-center justify-center gap-6 p-6 bg-black/80">
        {!photo ? (
          <button
            onClick={takePhoto}
            disabled={!cameraReady}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-30"
          >
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>
        ) : (
          <>
            <button onClick={retake} className="flex flex-col items-center gap-1 text-white/70 hover:text-white">
              <RotateCcw size={24} />
              <span className="text-xs">Retake</span>
            </button>
            <button onClick={confirm} className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300">
              <Check size={32} />
              <span className="text-xs">Use Photo</span>
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
