// Type declarations for onscan.js library
declare module 'onscan.js' {
  export interface OnScanOptions {
    onScan?: (sCode: string, iQty: number) => void
    onKeyDetect?: (iKeyCode: number) => void
    onKeyProcess?: (sChar: string, oEvent: KeyboardEvent) => boolean
    onPaste?: (sPasteString: string, oEvent: ClipboardEvent) => void
    onScanButtonLongPress?: () => void
    keyCodeMapper?: (oEvent: KeyboardEvent) => number
    onScanError?: (oDebugData: any) => void
    scanButtonKeyCode?: number | false
    scanButtonLongPressTime?: number
    timeBeforeScanTest?: number
    avgTimeByChar?: number
    minLength?: number
    suffixKeyCodes?: number[]
    prefixKeyCodes?: number[]
    ignoreIfFocusOn?: boolean | string | string[]
    stopPropagation?: boolean
    preventDefault?: boolean
    captureEvents?: boolean
    reactToKeydown?: boolean
    reactToPaste?: boolean
    singleScanQty?: number
  }

  export interface OnScanAPI {
    options: OnScanOptions
    decodeKeyEvent: (oEvent: KeyboardEvent) => string | null
    isFocusOnIgnoredElement: () => boolean
    attachTo: (element: HTMLElement | Document, options?: OnScanOptions) => void
    detachFrom: (element: HTMLElement | Document) => void
    simulate: (element: HTMLElement | Document, sScanCode: string) => void
    setOptions: (element: HTMLElement | Document, options: OnScanOptions) => void
    getOptions: (element: HTMLElement | Document) => OnScanOptions
  }

  const onScan: OnScanAPI
  export default onScan
}
