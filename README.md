# CheckTheWeather
## Description
A website the fetches and displays information from a weather api. It accounts for inaccurate input from the user, and responds by suggesting possible cities. It then displays the current weather at the suggested location as well as a 5-day forecast. Uses the OpenWeatherMap API, which is partially free, but doesn't provide UV data.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)


## Installation
this is deployed on github pages, and the repo is publicly available.

* [github repo here](https://github.com/jamesyoungGHusername/CheckTheWeather)

* [github pages deployment here]()

## Usage
The city search accounts for inaccurate user input, and suggests options they might have meant. After the user selects a specific city the app saves it to local storage as a recent search, and queries the OPENWEATHERMAP api twice, once for the current weather, and once for the five day forecast. The current weather is displayed directly (omitting the UV index because that data costs 400$ per month), but the five day forecast is returned as 40 3-hour chunks, so that data needs to be processed before it can be displayed.

It's processed by first sorting the responses by date, then by calculating the daily high and low temps (The national weather service uses a simple midnight to midnight for this, so that's what I've used too, even though some other authorities suggest alternate approaches), and it calculates the average wind speed and humidity values for the day.


## Credits
external resources used are listed in comments.

## License
MIT license.