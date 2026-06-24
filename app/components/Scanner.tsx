'use client'
import { useEffect, useRef, useState } from 'react'

interface ScannerProps {
  onScan: (code: string) => void
}

export default function Scanner({ onScan }: ScannerProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('Iniciando camera...')
  const [erro, setErro] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream|null>(null)
  const rafRef = useRef<number>(0)
  const G = '#C9A84C'

  const stopAll = () => {
    cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: any) => t.stop())
      streamRef.current = null
    }
  }

  useEffect(() => {
    if (!open) { stopAll(); return }

    async function start() {
      try {
        setErro('')
        setStatus('Iniciando camera...')

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        })
        streamRef.current = stream

        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStatus('Aponte para o codigo...')

        // Tenta BarcodeDetector nativo primeiro (Chrome Android - rapido)
        const BD = (window as any).BarcodeDetector
        if (BD) {
          const detector = new BD({ formats: ['ean_13','ean_8','code_128','code_39','qr_code','upc_a','upc_e','itf','data_matrix'] })
          const scan = async () => {
            if (!videoRef.current || !open) return
            try {
              const codes = await detector.detect(videoRef.current)
              if (codes.length > 0) {
                onScan(codes[0].rawValue)
                setOpen(false)
                return
              }
            } catch {}
            rafRef.current = requestAnimationFrame(scan)
          }
          rafRef.current = requestAnimationFrame(scan)
          return
        }

        // Fallback: zxing
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const { NotFoundException } = await import('@zxing/library')
        const hints = new Map()
        const { BarcodeFormat } = await import('@zxing/library')
        hints.set(2, [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
          BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
          BarcodeFormat.QR_CODE, BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E, BarcodeFormat.ITF,
        ])
        const reader = new BrowserMultiFormatReader(hints)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const scanFrame = () => {
          if (!videoRef.current || !open) return
          const v = videoRef.current
          if (v.readyState === v.HAVE_ENOUGH_DATA) {
            canvas.width = v.videoWidth
            canvas.height = v.videoHeight
            ctx?.drawImage(v, 0, 0)
            try {
              const result = reader.decodeFromCanvas(canvas)
              if (result) {
                onScan(result.getText())
                setOpen(false)
                return
              }
            } catch (e: any) {
              if (!(e instanceof NotFoundException)) console.warn(e)
            }
          }
          rafRef.current = requestAnimationFrame(scanFrame)
        }
        rafRef.current = requestAnimationFrame(scanFrame)

      } catch (e: any) {
        setErro('Erro: ' + (e?.message || String(e)))
        setStatus('')
      }
    }

    start()
    return () => stopAll()
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
          whiteSpace: 'nowrap',
        }}
      >
        [CAM]
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, gap: 12,
        }}>
          <p style={{ color: G, fontWeight: 700, fontSize: 13, letterSpacing: 1, margin: 0 }}>
            LEITOR DE CODIGO
          </p>

          {erro ? (
            <p style={{ color: '#fca5a5', fontSize: 13, padding: '0 20px', textAlign: 'center' }}>{erro}</p>
          ) : (
            <div style={{ position: 'relative', width: '90vw', maxWidth: 400 }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%', borderRadius: 10,
                  border: '2px solid ' + G,
                  display: 'block',
                }}
                muted
                playsInline
              />
              {/* Linha de mira animada */}
              <div style={{
                position: 'absolute', left: '10%', right: '10%',
                top: '50%', height: 2,
                background: G,
                opacity: 0.8,
                boxShadow: '0 0 8px ' + G,
                animation: 'scan-line 1.5s ease-in-out infinite alternate',
              }}/>
              <style>{`
                @keyframes scan-line {
                  from { top: 30%; }
                  to { top: 70%; }
                }
              `}</style>
            </div>
          )}

          <p style={{ color: '#888', fontSize: 12, margin: 0 }}>{status}</p>

          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'transparent', border: '1px solid ' + G,
              color: G, padding: '8px 28px', borderRadius: 6,
              cursor: 'pointer', fontSize: 13,
            }}
          >
            X Fechar
          </button>
        </div>
      )}
    </>
  )
}
