"use strict"

const btnLocation = document.querySelector('.btn-location')
const btnRandom = document.querySelector('.btn-random')
const main = document.querySelector('main')
const countryWrapper = document.querySelector('.country-wrapper')

let latitude;
let longitude;
const apiKey = '121821921230023e15872933x57060'
function success(position) {
    ({ latitude, longitude } = position.coords)
    fetchLocation(latitude, longitude)
}


function getCountry() { navigator.geolocation.getCurrentPosition(success) }
const renderCountry = function (data) {
    const html = `<div class="country-wrapper">
        <div class="flag-name">
          <img src=${data.flag} alt="" />
          <p>${data.name}</p>
        </div>
        <div class="info-neighbours">
          <div class="info-container">
            <div class="info">
              <h3>Capital</h3>
              <p>${data.capital}</p>
            </div>
            <div class="info">
              <h3>Currency</h3>
              <p>${data.currencies[0].code}/${data.currencies[0].name}/${data.currencies[0].symbol}</p>
            </div>
            <div class="info">
              <h3>Language</h3>
              <p>${data.languages[0].name}</p>
            </div>
            <div class="info">
              <h3>Population</h3>
              <p>${(data.population / 1000000).toFixed(2)} Mil.</p>
            </div>
            <div class="info">
              <h3>Region</h3>
              <p>${data.region}</p>
            </div>
            <div class="info">
              <h3>Timezone</h3>
              <p>${data.timezones[0]}</p>
            </div>
          </div>
          <h2>Neighbours</h2>
          <div class="neigbours">
          </div>
        </div>
      </div>`
    main.insertAdjacentHTML("afterbegin", html)
}
const renderNeighbours = function (neighbours, ...countries) {
    if (!countries) neighbours.insertAdjacentHTML("afterbegin", `
        <div class="neighbour">
            <p>The country has no neighbours</p>
        </div>`)
    countries.forEach(country => neighbours.insertAdjacentHTML("afterbegin", `
            <div class="neighbour">
              <img src=${country.flag} alt="" />
              <p>${country.name}</p>
            </div>`))
}
const renderError = function (neighbours, message) {
    neighbours.insertAdjacentHTML("afterbegin",
        `
          <p class="no-neighbour">${message}</p>
       `)
}
const fetchLocation = function (latitude, longitude) {
    fetch(`https://geocode.xyz/${latitude},${longitude}?geoit=json&auth=${apiKey}`)
        .then(response => {
            if (!response.ok) throw new Error(`Problem with geocoding, Try again! ${response.status}`)
            return response.json()
        })
        .then(data => {
            const myCountry = data.country.toLowerCase()
            return fetch(`https://restcountries.com/v2/name/${myCountry}`)
        })
        .then(response => {
            if (!response.ok) throw new Error(`Problem with restcountries api, Try again! ${response.status}`)
            return response.json()
        })
        .then(data => {
            renderCountry(data[0]);
            return fetch(`https://restcountries.com/v2/alpha?codes=${data[0].borders.join(',')}`)
        })
        .then(response => {
            if (!response.ok) throw new Error(`Problem with restcountries api, Try again! ${response.status}`)
            return response.json()
        })
        .then(data => {
            const neighbours = document.querySelector('.neigbours');
            renderNeighbours(neighbours, ...data)
        })
        .catch(err => {
            const neighbours = document.querySelector('.neigbours');
            renderError(neighbours, err.message);
            console.error(err.message)
        })

}

const fetchRandomCountry = function () {
    fetch(`https://restcountries.com/v2/all`).then(response => response.json()).then(data => {
        let randomNumber = Math.floor(Math.random() * 249);
        const arr = data.map(country => country.name)
        return fetch(`https://restcountries.com/v2/name/${arr[randomNumber]}?fullText=true`)
    })
        .then(response => {
            if (!response.ok) throw new Error(`Problem with restcountries api, Try again! ${response.status}`);
            return response.json()
        })
        .then(data => {
            renderCountry(data[0]);
            if (!data[0].borders) throw new Error('The country has no neighbours')
            return fetch(`https://restcountries.com/v2/alpha?codes=${data[0].borders.join(',')}`)
        })
        .then(response => {
            if (!response.ok) throw new Error(`Problem with restcountries api, Try again! ${response.status}`);
            return response.json()
        })
        .then(data => {
            const neighbours = document.querySelector('.neigbours');
            renderNeighbours(neighbours, ...data)
        })
        .catch(err => {
            const neighbours = document.querySelector('.neigbours');
            renderError(neighbours, err.message)
            console.error(err.message)
        })
}

btnLocation.addEventListener('click', getCountry)
btnRandom.addEventListener('click', fetchRandomCountry)