import imageCompression from 'browser-image-compression'

export interface CompressedImage {
  file: File
  originalSize: number
  compressedSize: number
  width: number
  height: number
}

/**
 * Kompresuje zdjęcie do WebP ~150 KB, max 800 px.
 * Używa Web Workera – nie blokuje UI.
 */
export async function compressItemPhoto(input: File): Promise<CompressedImage> {
  const options = {
    maxSizeMB: 0.15,           // ~150 KB target
    maxWidthOrHeight: 800,     // wystarczy do thumbnaila i lekkiego lightboxa
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,       // start, biblioteka obniży jeśli trzeba
  }

  const compressed = await imageCompression(input, options)

  // Pomiar wymiarów z blob URL
  const {width, height} = await getDimensions(compressed)

  const file = new File(
    [compressed],
    `photo-${Date.now()}.webp`,
    {type: 'image/webp'},
  )

  return {
    file,
    originalSize: input.size,
    compressedSize: compressed.size,
    width,
    height,
  }
}

function getDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      resolve({width: img.naturalWidth, height: img.naturalHeight})
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Nie udało się odczytać wymiarów zdjęcia'))
    }
    img.src = url
  })
}