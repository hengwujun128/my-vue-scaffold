export {}

declare global {
  interface Window {
    TMap: any
    qq: any
    wx: any
    eventBus: any
    onMapCallback: () => void
  }

  interface Position {
    province: string
    city: string
    district: string
    addr: string
    lat: float
    lng: float
  }

  interface SelectedPos {
    latlng: {
      lat: float
      lng: float
    }
  }
}
