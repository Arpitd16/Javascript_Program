const express=require("express");

const app=express();

app.get("/",function(request,respond){
    respond.send("hello");
});

app.get("/contact",function(req,res){
    res.send("contact me:abc@gmail.com");
});

app.get("/hobbies",function(req,res){
    res.send("<ul><li>music</li><li>code</li><li>driving</li></ul>")
});

app.get("/about",function(req,res){
    res.send("my name is arpit .")
});


app.listen(3000,function(){
    console.log("the server are 3000");
});