export const GOOGLE_MAPS_LIBRARIES: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [
  'places',
  'geometry',
]

export const defaultMapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#161d2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#161d2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8899aa' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#f0f4ff' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#4d6070' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e2a3a' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4d6070' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2d3d' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111827' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8899aa' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2b3f54' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#111827' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f0f4ff' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e2a3a' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#8899aa' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0d14' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3b82f6' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#111827' }] },
  ],
}
