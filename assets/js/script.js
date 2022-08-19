var cityInput=document.querySelector("#cityInput");
var fiveDayDisplay=document.querySelector(".fiveDayDisplay");
var cityDisplay=document.querySelector(".cityDisplay");
var suggestionBox=document.querySelector(".didYouMean");
var recentsDOM=document.querySelector(".recents");

var searchCriteria="Willapa";
var suggestions=[];
var recentArr=[];

$( document ).ready(function() {
    loadRecents();
});

//Listens for the user searching for a particular location.
$(".submit").on("click",function(event){
    event.preventDefault();
    searchCriteria=cityInput.value;
    callGeocode(searchCriteria);
});

//API key pls don't steal.
var key="59891e16893aba6e28c892ab4a79de12";


//Calls the api to find locations that might correspond the user's input.
function callGeocode(location){
    suggestions=[];
    console.log("Calling weather api for "+location);
    fetch("http://api.openweathermap.org/geo/1.0/direct?q="+location+"&limit=5&appid="+key)
    .then(function(response){
        console.log("Obtained response");
        return response.json();
    })
        .then(function(response){
            console.log(response);
            
            for(var i=0;i<response.length;i++){
                console.log(response[i])
                suggestions.push(new cityProfile(response[i].name,response[i].state,response[i].lat,response[i].lon,response[i].country));
            }
            console.log(suggestions);
            buildSuggestionBox();
        });
}

//Builds suggestion buttons from the first API response containing possible locations the user might have meant.
function buildSuggestionBox(){
    removeAllChildNodes(suggestionBox);
    var message=$("<h4>",{"class":"suggestionBox"});
    message.text("Did you mean:");
    suggestionBox.appendChild(message.get(0));
    for(var i=0;i<suggestions.length;i++){
        //switching between a jquery object and a native DOM element. the get(0) method pulls the native DOM out of the jquery object wrapper.
        suggestionBox.appendChild(suggestions[i].getElementForSelf().get(0));
    }
}

//Function to remove all child nodes from a given node.
function removeAllChildNodes(from) {
    while (from.firstChild) {
        from.removeChild(from.firstChild);
    }
}

//City profile class for managing the information needed for API calls regarding a particular city.
class cityProfile{
    constructor(name,state,lat,lon,countryCode){
        this.name=name;
        this.state=state;
        this.lat=lat;
        this.lon=lon;
        this.countryCode=countryCode;
    }
    getElementForSelf(){
        console.log("generating suggestion button for "+this.name);
        var button = $("<button>",{"class":"suggestionButton m-1"});
        button.text(this.name+", "+this.state+" "+this.countryCode);
        console.log(button);
        button.bind("click",() => {handleButtonPressFor(this)});
        return button;
    }

}

//Eventhandler function takes cityProfile as a param.
function handleButtonPressFor(city){
    removeAllChildNodes(suggestionBox);
    console.log(city.name+" selected");
    addToRecents(city);
    $(".cityName").text(city.name+", "+city.state+"   ("+new Date().toDateString()+")");
    //makeWeatherCallFor(city);
    makeCurrentUVCallFor(city);
    makeCurrentWeatherCallFor(city);
}

//Makes the actual weather call for the selected city (cityProfile as a param).
function makeWeatherCallFor(suggestion){
    //Specifies the https because of chrome's CORS policy.
    var request = "http://api.openweathermap.org/data/2.5/forecast?lat="+suggestion.lat+"&lon="+suggestion.lon+"&units=imperial&appid="+key;
    fetch(request)
    .then(function(response){
        return response.json();
    }).then(function(response){
        console.log(response);
    });
}

function makeCurrentWeatherCallFor(suggestion){
    var request = "https://api.openweathermap.org/data/2.5/weather?lat="+suggestion.lat+"&lon="+suggestion.lon+"&units=imperial&appid="+key;
    fetch(request)
    .then(function(response){
        return response.json();
    }).then(function(response){
        console.log(response);
        updateCurrentWeatherDisplay(response);
    });
}

function makeCurrentUVCallFor(suggestion){
    var lat = suggestion.lat;
    var lng = suggestion.lng;

 $.ajax({
    type: 'GET',
    dataType: 'json',
    beforeSend: function(request) {
      request.setRequestHeader('x-access-token', 'f7cc28cb11d40381c52e45c934deed2a');
    },
    url: 'https://api.openuv.io/api/v1/uv?lat=' + lat + '&lng=' + lng,
    success: function(response) {
      console.log(response);
      updateCurrentUVDisplay(response);
    },
    error: function(response) {
      console.log("error occoured. "+response);
    }
  });

}

//updates the current weather display for the specified area using a json response from the api
function updateCurrentWeatherDisplay(using){
    $(".currentWeather").text("Weather: "+using.weather[0].description);
    $(".currentTemp").text("temp: "+using.main.temp+"F");
    $(".currentWind").text("wind: "+using.wind.speed+"mph");
    $(".currentHumid").text("humidity: "+using.main.humidity+"%");
}

function updateCurrentUVDisplay(newUV){
    console.log(newUV.uv);
}

//adds the param cityProfile object to the list of recent searches, and pops the last element (FIFO) if more than 5 searches have occoured in the past. Also, checks for duplicate entries.
function addToRecents(city){
    var match=false;
    if(recentArr){
        for(var i=0;i<recentArr.length;i++){
            if(city.name==recentArr[i].name && city.state==recentArr[i].state){
                match=true;

                console.log("matches existing value");
            }
        }
    }
    if(!match){
        if(recentArr.length>=5){
            recentArr.shift();
        }
        recentArr.push(city);
    }
    console.log("Saving "+city.name+" to local");
    localStorage.setItem("recentArr",JSON.stringify(recentArr));
    loadRecents();
}
//Clears existing elements in the relevant section if there are any.
//Loads recent seraches from local storage. Converts them too objects of type cityProfile and stores them in recentArr.
// Should only save 5 at a time. Then builds the display from their contents.
function loadRecents(){
    removeAllChildNodes(recentsDOM);
    var genericArr=JSON.parse(localStorage.getItem("recentArr"));
    console.log("Loaded: "+genericArr.length);
    if(genericArr){
        recentArr=[];
        for(var i=0;i<genericArr.length;i++){
            console.log(genericArr[i]);
            //JS doesn't like casting, so the function reconstructs the cityProfile object from the array saved to local.
            recentArr.push(new cityProfile(genericArr[i].name,genericArr[i].state,genericArr[i].lat,genericArr[i].lon,genericArr[i].countryCode));
            
        }
        for (var i = (recentArr.length-1);i>=0;i--){
            recentsDOM.appendChild(recentArr[i].getElementForSelf().get(0));
        }
    }
    
}
//utility function to clear saved searches.
function clearSavedSearches(){
    localStorage.setItem("recentArr",null);
}

//builds a weather dom element from a given dayForecastObject
function returnWeatherInfoElmtFor(day){
    var col = $("<div>",{"class":"col-2 p-3 border fiveday"});
    var date = $("<h4>",{"class":"date"});
    col.append(date);
    var block = $("<div>",{"class":"twhBlock"});
    var temp=$("<p>",{"class":"temp"}).text("temp: "+day+"F");
    var wind=$("<p>",{"class":"wind"}).text("wind: "+day+"mph");
    var humid=$("<p>",{"class":"humid"}).text("humidity: "+day+"%");
    block.append(temp,wind,humid);
    col.append(block);
    return col;
}

//Contains information regarding a particular 3-hour snapshot
class forecastSnapshot{
    constructor(apiForecastObject){
        this.date=apiForecastObject.list.dt_text;
        this.cityName=apiForecastObject.city.name;
        this.country=apiForecastObject.city.country;
        this.temperature=apiForecastObject.list.main.temp;
        this.weather=apiForecastObject.list.weather.id;
        this.weatherDescrip=apiForecastObject.list.weather.description;
    }
}

class dayForecast{
    constructor(date,snapshots){
        this.date=date;
        this.snapshots=snapshots;
        //National Weather Service uses local midnight-to-midnight for both daily high and low temps.
        this.dailyHigh=0;
        this.dailyLow=0;
    }
}