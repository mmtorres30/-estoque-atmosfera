'use client'
import { useEffect, useRef, useState } from 'react'

interface ScannerProps {
  onScan: (code: string) => void
  label?: string
}

export default function Scanner({ onScan, label = 'CAM' }: ScannerProps) {
  const [open, setOpen] = useState(false)
  const [erro, setErro] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<any>(null)
  const G = '#C9A84C'

  useEffect(() => {
    if (!open) return
    let stopped = false

    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        readerRef.current = reader

        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (devices.length === 0) {
          setErro('Nenhuma camera encontrada')
          return
        }

        const back = devices.find((d: any) =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('traseira') ||
          d.label.toLowerCase().includes('environment')
        )
        const deviceId = back ? back.deviceId : devices[devices.length - 1].deviceId

        if (videoRef.current) {
          await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result: any) => {
            if (stopped) return
            if (result) {
              onScan(result.getText())
              setOpen(false)
            }
          })
        }
      } catch (e: any) {
        setErro('Erro ao acessar camera: ' + (e?.message || String(e)))
      }
    }

    startScanner()

    return () => {
      stopped = true
      try { readerRef.current?.reset() } catch {}
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => { setErro(''); setOpen(true) }}
        title="Escanear codigo de barras ou QR Code"
        style={{
          background: 'transparent',
          border: '1px solid ' + G,
          borderRadius: 6,
          color: G,
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        [CAM]
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, gap: 16,
        }}>
          <p style={{ color: G, fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
            APONTE A CAMERA PARA O CODIGO
          </p>
          {erro ? (
            <p style={{ color: '#fca5a5', fontSize: 13 }}>{erro}</p>
          ) : (
            <video
              ref={videoRef}
              style={{
                width: '90vw', maxWidth: 420, borderRadius: 10,
                border: '2px solid ' + G,
              }}
              autoPlay
              muted
              playsInline
            />
          )}
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent', border: '1px solid ' + G,
              color: G, padding: '8px 24px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13, marginTop: 8,
            }}
          >
            X Fechar
          </button>
        </div>
      )}
    </>
  )
}
