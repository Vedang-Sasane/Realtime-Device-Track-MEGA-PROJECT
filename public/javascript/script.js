const socket = io();

// Add this in script.js
// socket.on("connect", () => {
//   console.log("Connected with socket ID:", socket.id);
// });

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Add a small random offset to avoid overlapping markers
      //   const offsetLat = latitude + (Math.random() - 0.5) * 0.0011;
      //   const offsetLng = longitude + (Math.random() - 0.5) * 0.0011;

      //   socket.emit("send-location", {
      //     latitude: offsetLat,
      //     longitude: offsetLng,
      //   });

      // Emit the actual location without any random offsets
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    }
  );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  console.log(
    "Received location data from socket ID:",
    id,
    latitude,
    longitude
  );

  // Create a unique but small offset based on the socket ID
  const offsetMultiplier = (parseInt(id, 36) % 10) * 0.0001;
  const adjustedLat = latitude + offsetMultiplier;
  const adjustedLng = longitude + offsetMultiplier;

  map.setView([adjustedLat, adjustedLng], 16);

  if (markers[id]) {
    markers[id].setLatLng([adjustedLat, adjustedLng]);
  } else {
    markers[id] = L.marker([adjustedLat, adjustedLng]).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
