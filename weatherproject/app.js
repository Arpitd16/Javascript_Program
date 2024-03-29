
const express = require("express");
const bodyparse=require("body-parser");

const https = require("https");

const app = express();
app.use(bodyparse.urlencoded({extended:true}));

app.get("/", function (req, res) {
    res.sendFile(__dirname+ "/index.html");
    /*res.send("the server is up and running.");*/
});
app.post("/",function(req,res){
   
    const city = req.body.cityname;
    const apikey = "66dadf837d02545bebea638b7f5f24f8";
    const unit = "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apikey + "&units=" + unit;

    https.get(url, function (response/*beacua=se we use in bfore res name so*/) {
        console.log(response.statusCode);//it return the status of the website

        response.on("data", function (data) {

            const weatherdata = JSON.parse(data);
            const temprature = weatherdata.main.temp;
            const T = weatherdata.weather[0].description;

            // console.log(T);//it's return description
            // console.log(temprature);//it's return temprature of wether

            // console.log(weatherdata);//it's return data

            // const object = {
            //     name: "ad",
            //     favouritecolor: "red"
            // }
            const icon = weatherdata.weather[0].icon;
            const imageurl = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
            //console.log(icon);


           // console.log(JSON.stringify(object));//it's enter data into string

            res.write("<p>the weather description of "+city+" is " + T + "</p>");
            res.write("<h1>the teampratur in the "+city+ " is " + temprature + " degree celiuse</h1>");
            res.write("<img src=" + imageurl + ">");
            res.send();
        });
    });

});
    

app.listen(3000, function () {
    console.log("the server 3000 is running.");
    
});