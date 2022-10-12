const inputLatitude = document.getElementById("latitude");
const inputLongitude = document.getElementById("longitude");
const place = document.getElementById('place');
const btnSearch = document.querySelector(".btn-search");
const btnRefresh = document.querySelector(".btn-refresh");
const btnCurrent = document.querySelector('.btn-current');

const countryDetails = document.querySelector('.country-details');
const countryImg = document.querySelector('.country_img');
const countryName = document.querySelector('.country_name');
const countryRegion = document.querySelector('.country_region');
const population = document.querySelector('.population');
const languages = document.querySelector('.languages');
const currency = document.querySelector('.currency');

//Declaring Variables... 
let marker, coords, map, latitude, longitude, inputLatitudeValue, inputLongitudeValue, placeValue, country, search, locationMsg;


//Map on load...or Initial Consitions;
function pageOnLoad() {
  map = L.map("map").setView([17.3850, 78.4867], 13);
  L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }).addTo(map);
  inputLatitude.value = "";
  inputLongitude.value = "";
  place.value = "";
}

//Displaying required maps...
const displayMap = function (latitude, longitude, locationMsg) {
  let container = L.DomUtil.get("map");
  if (container != null) {
    container._leaflet_id = null;
  }

  coords = [latitude, longitude];
  map = L.map("map").setView(coords, 13);
  L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }).addTo(map);
  marker = L.marker(coords).addTo(map).bindPopup(locationMsg).openPopup();
  map.panTo(coords);
};

//Current Position Function
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;
      locationMsg = 'You are here...';
      displayMap(latitude, longitude, locationMsg);
    }, function () { alert("could not get your location.") });
  }
};

//Rendering Countries
const renderCountry = function (data) {
  countryImg.src = data.flags.png;
  countryName.textContent = data.name.common;
  countryRegion.textContent = data.region;
  population.textContent = `👫 ${(+data.population / 1000000).toFixed(1)} Million`;
  languages.textContent = `🗣 ${Object.keys(data.languages).length === 1 ? Object.values(data.languages)[0] : `${Object.values(data.languages)[0]}, ${Object.values(data.languages)[1]}`}`;
  currency.textContent = `💰 ${data.currencies[Object.keys(data.currencies)[0]].symbol} ${data.currencies[Object.keys(data.currencies)[0]].name}`
  countryDetails.style.opacity = 1;
}

//Getting details of location by Country Name... 
const getCountryData = function (country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then((response) => response.json())
    .then(data => {
      console.log(data[0])
      latitude = data[0].latlng[0];
      longitude = data[0].latlng[1];
      inputLatitude.value = latitude;
      inputLongitude.value = longitude;
      locationMsg = country;
      displayMap(latitude, longitude, locationMsg);
      renderCountry(data[0]);
    })
}

//Getting details of location by Coordinates
const getLatLngData = function (latitude, longitude) {
  fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=ccd5c14109ec4ffd9ce4c3abdf1a403d`)
    .then((response) => response.json())
    .then(data => {
      console.log(data)
      country = data.features[0].properties.country;
      state = data.features[0].properties.state;
      // displayMap(latitude,longitude,country,state);
      // getCountryData(country);
      return country
    }).then((countrydata) => {
      fetch(`https://restcountries.com/v3.1/name/${countrydata}`)
        .then((response) => response.json())
        .then(data => {
          place.value = country;
          locationMsg = `${state}-${country}`;
          displayMap(latitude, longitude, locationMsg);
          renderCountry(data[0])
        })
    })
}
//calling function on page load...
pageOnLoad();

//Search button function...
btnSearch.addEventListener("click", function (e) {
  e.preventDefault();
  inputLatitudeValue = inputLatitude.value;
  inputLongitudeValue = inputLongitude.value;
  placeValue = place.value;
  if (((place.value == "") && (inputLatitude.value == "" && inputLongitude.value == "")) ||
    ((!place.value == "") && (!inputLatitude.value == "" && !inputLongitude.value == ""))) {
    alert('Please search either by country name or coordinates...')
  }
  if (place.value == "") {
    getLatLngData(inputLatitudeValue, inputLongitudeValue);
  }
  if (inputLatitude.value == "" && inputLongitude.value == "") {
    getCountryData(placeValue);
  }
});

btnRefresh.addEventListener('click', pageOnLoad);