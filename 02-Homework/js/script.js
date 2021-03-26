// Declaring global variables
let citySearch = [];
let cityName;

// Local storage
initCitySearch();
initWeather();

// Displays user input into DOM
function renderCities() {
    $("#cityList").empty();
    $("#cityinput").val("");

    for (i=0; i<citySearch.length; i++){
        var a = $("<a>");
        a.addClass("list-group-item list-group-item-action list-group-item-primary city");
        a.attr("data-name", citySearch[i]);
        a.text(citySearch[i]);
        $("#cityList").prepend(a);
    }
}

// This function pulls the city list array from local storage
function initCitySearch() {
    let savedCities = JSON.parse(localStorage.getItem("cities"));
    
    if (savedCities !== null) {
        citySearch = savedCities;
    }
    
    renderCities();
}

// Pull city list from local storage
function initWeather() {
    let savedWeather = JSON.parse(localStorage.getItem("currentCity"));

    if (savedWeather !== null) {
        cityName = savedWeather;

        displayWeather();
        displayForecast();
    }
}

// Saves cities to local storage
function saveCities() {
    localStorage.setItem("cities", JSON.stringify(citySearch));
}

function saveCurrentCity() {
    localStorage.setItem("currentCity", JSON.stringify(cityName));
}

//Search button
$("#citySearchButton").on("click", function(event){
    event.preventDefault();

    cityName = $("#cityInput").val().trim();
    if (citySearch.length >= 5){  
        citySearch.shift();
        citySearch.push(cityName);

    }else{
    citySearch.push(cityName);
    }
    saveCurrentCity();
    saveCities();
    renderCities();
    displayWeather();
    displayForecast();
});

$("#cityInput").keypress(function(e){
    if(e.which == 13){
        $("#citySearchButton").click();
    }
})

//Calls weather API
async function displayWeather() {

    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=d3b85d453bf90d469c82e650a0a3da26";

    let response = await $.ajax({
        url: queryURL,
        method: "GET"
    })
        console.log(response);

        let currentWeatherDiv = $("<div class='card-body' id='currentWeather'>");
        let getCurrentCity = response.name;
        let date = new Date();
        let val=(date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
        let getCurrentWeatherIcon = response.weather[0].icon;
        let displayCurrentWeatherIcon = $("<img src = http://openweathermap.org/img/wn/" + getCurrentWeatherIcon + "@2x.png />");
        let currentCityEl = $("<h3 class = 'card-body'>").text(getCurrentCity+" ("+val+")");
        currentCityEl.append(displayCurrentWeatherIcon);
        currentWeatherDiv.append(currentCityEl);
        let getTemp = response.main.temp.toFixed(1);
        let tempEl = $("<p class='card-text'>").text("Temperature: "+getTemp+"° F");
        currentWeatherDiv.append(tempEl);
        let getHumidity = response.main.humidity;
        let humidityEl = $("<p class='card-text'>").text("Humidity: "+getHumidity+"%");
        currentWeatherDiv.append(humidityEl);
        let getWindSpeed = response.wind.speed.toFixed(1);
        let windSpeedEl = $("<p class='card-text'>").text("Wind Speed: "+getWindSpeed+" mph");
        currentWeatherDiv.append(windSpeedEl);
        let getLong = response.coord.lon;
        let getLat = response.coord.lat;
        
        let uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=d3b85d453bf90d469c82e650a0a3da26&lat="+getLat+"&lon="+getLong;
        let uvResponse = await $.ajax({
            url: uvURL,
            method: "GET"
        })

        //UV Index info and setting color 
        let getUVIndex = uvResponse.value;
        let uvNumber = $("<span>");
        if (getUVIndex > 0 && getUVIndex <= 2.99){
            uvNumber.addClass("low");
        }else if(getUVIndex >= 3 && getUVIndex <= 5.99){
            uvNumber.addClass("moderate");
        }else if(getUVIndex >= 6 && getUVIndex <= 7.99){
            uvNumber.addClass("high");
        }else if(getUVIndex >= 8 && getUVIndex <= 10.99){
            uvNumber.addClass("vhigh");
        }else{
            uvNumber.addClass("extreme");
        } 
        uvNumber.text(getUVIndex);
        var uvIndexEl = $("<p class='card-text'>").text("UV Index: ");
        uvNumber.appendTo(uvIndexEl);
        currentWeatherDiv.append(uvIndexEl);
        $("#weatherContain").html(currentWeatherDiv);
};

//5 day forecast and displays them to the DOM
async function displayForecast() {

    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q="+cityName+"&units=imperial&appid=d3b85d453bf90d469c82e650a0a3da26";

    let response = await $.ajax({
        url: queryURL,
        method: "GET"
      })
      let forecastDiv = $("<div  id='fiveDayForecast'>");
      let forecastHeader = $("<h5 class='card-header'>").text("5 Day Forecast:");
      forecastDiv.append(forecastHeader);
      let cardDeck = $("<div  class='card-deck'>");
      forecastDiv.append(cardDeck);
      
      console.log(response);
      for (i=0; i<5;i++){
          let forecastCard = $("<div class='card mb-3 mt-3'>");
          let cardBody = $("<div class='card-body'>");
          let date = new Date();
          let val=(date.getMonth()+1)+"/"+(date.getDate()+i+1)+"/"+date.getFullYear();
          let forecastDate = $("<h5 class='card-title'>").text(val);
          
        cardBody.append(forecastDate);
        let getCurrentWeatherIcon = response.list[i].weather[0].icon;
        console.log(getCurrentWeatherIcon);
        let displayWeatherIcon = $("<img src = http://openweathermap.org/img/wn/" + getCurrentWeatherIcon + ".png />");
        cardBody.append(displayWeatherIcon);
        let getTemp = response.list[i].main.temp;
        let tempEl = $("<p class='card-text'>").text("Temp: "+getTemp+"° F");
        cardBody.append(tempEl);
        let getHumidity = response.list[i].main.humidity;
        let humidityEl = $("<p class='card-text'>").text("Humidity: "+getHumidity+"%");
        cardBody.append(humidityEl);
        forecastCard.append(cardBody);
        cardDeck.append(forecastCard);
      }
      $("#forecastContain").html(forecastDiv);
}

// This function is used to pass the city in the history list to the displayWeather function
function historyDisplayWeather(){
    cityName = $(this).attr("data-name");
    displayWeather();
    displayForecast();
    console.log(cityName);
    
}

$(document).on("click", ".city", historyDisplayWeather);