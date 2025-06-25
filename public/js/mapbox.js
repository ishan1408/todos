export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiaXNoYW5qYWluYWNvbHl0ZSIsImEiOiJjbWNianNvb2gwZXd1MnVvZ21hODVrZnJtIn0.fHxTzDzr8d3Og_rpVZQ2kw';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 100,
      bottom: 100,
      left: 50,
      right: 50
    }
  });
};
