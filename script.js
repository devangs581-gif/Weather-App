const userTab=document.querySelector("[userWeather]");
const searchTab=document.querySelector("[searchWeather]")
const grantLocation=document.querySelector(".grantContainer");
const searchLocation=document.querySelector(".searchLocation");
const loadingContainer=document.querySelector(".loadingContainer");
const weatherInfo=document.querySelector(".weatherInfo");
const Name=document.querySelector(".name");
const grantAccess=document.querySelector("[grantAccess]");
const searchInput=document.querySelector(".searchInput");
const errorContainer=document.querySelector(".errorContainer");

const API_KEY="02082b1753f38d687a944f76e032daab";
let currentTab=userTab;
currentTab.classList.add("currentTab");
getFromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove("currentTab");
        currentTab=clickedTab;
        currentTab.classList.add("currentTab");
    }

    if(currentTab === searchTab){
        weatherInfo.classList.remove("active");
        grantLocation.classList.remove("active");
        searchLocation.classList.add("active");
    }
    else{
        searchLocation.classList.remove("active");
        weatherInfo.classList.remove("active");
        getFromSessionStorage();
    }

}

userTab.addEventListener('click',()=>{
    switchTab(userTab);
});

searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
});

function renderWeatherInfo(data){
    const cityName=document.querySelector("[cityName]");
    const countryFlag=document.querySelector("[countryFlag]");
    const currentTemp=document.querySelector("[currentTemp]");
    const weatherDesc=document.querySelector("[weatherDesc]");
    const weatherImg=document.querySelector("[weatherImg]");
    const windSpeed=document.querySelector("[windSpeed]");
    const humiditySpeed=document.querySelector("[humiditySpeed]");
    const cloudSpeed=document.querySelector("[cloudSpeed]");

    cityName.innerText=data?.name; 
    countryFlag.src=`https://flagcdn.com/144x108/${data?.sys?.country?.toLowerCase()}.png`;
    currentTemp.innerText=`${data?.main?.temp} °C`;
    weatherDesc.innerText=data?.weather?.[0]?.description;
    weatherImg.src=`https://openweathermap.org/img/wn/${data?.weather?.[0]?.icon}@2x.png`;
    windSpeed.innerText=`${data?.wind?.speed} m/s`;
    humiditySpeed.innerText=`${data?.main?.humidity}%`;
    cloudSpeed.innerText=`${data?.clouds?.all}%`;

}

async function fetchUserWeather(coordinate){
    const {lat,lon}=coordinate; 
    
    grantLocation.classList.remove("active");
    loadingContainer.classList.add("active");

   try{
     const response=await fetch( `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
     const data=await response.json();
     loadingContainer.classList.remove("active");
     weatherInfo.classList.add("active");
     renderWeatherInfo(data);
   }catch(e){
      loadingContainer.classList.remove("active");
      console.log("Coordinates are not fetched", e);
   }     
}

function getFromSessionStorage(){
    const coordinate=sessionStorage.getItem("userCoordinate");
    if(!coordinate){
        grantLocation.classList.add("active");
    } else{
        const localCoordinate=JSON.parse(coordinate);
        fetchUserWeather(localCoordinate);
    }
}

function successCall(position){
    let coordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude 
    };
    let stringCoordinate=JSON.stringify(coordinates);
    sessionStorage.setItem('userCoordinate',stringCoordinate);
    fetchUserWeather(coordinates);
}

function errorCall(error){
    console.log("Coordinate access was denied or failed.", error);
}

grantAccess.addEventListener('click',()=>{
      navigator.geolocation.getCurrentPosition(successCall,errorCall);
});

searchLocation.addEventListener('submit',(e)=>{ 
   e.preventDefault();
   let cityVal=searchInput.value; 
   if(cityVal === "") return;
   fetchWeatherCity(cityVal);
});

async function fetchWeatherCity(cityVal) {
    loadingContainer.classList.add("active");
    weatherInfo.classList.remove("active");
    grantLocation.classList.remove("active");
    errorContainer.classList.remove("active"); // Add this line to hide the error on a new search

    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityVal}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('City not found!'); 
        }
        let data = await response.json();
        loadingContainer.classList.remove("active");
        weatherInfo.classList.add("active");
        renderWeatherInfo(data);
    } catch (e) {
        loadingContainer.classList.remove("active");
        weatherInfo.classList.remove("active");
        // Show the error container only if the fetch fails
        errorContainer.classList.add("active"); 
        console.log("City weather fetch failed", e);
    }
}