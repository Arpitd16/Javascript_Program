const  express=require("express");
const bodyparser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");

const app=express();
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB", {useNewUrlParser: true});
const wikiSchema=new mongoose.Schema({
    title:String,
    content:String
});
const articles=mongoose.model("articles",wikiSchema);

app.route("/articles").get(function(req,res){
    articles.find().then(function(FoundItems){
    res.send(FoundItems)
      });
})
.post(function(req,res){
   
    const newarticles=new articles({
        title:req.body.title,
        content:req.body.content
    })
    newarticles.save().then(function(err){
        if(!err){
        res.send("successfully added");
    }else{
        res.send(err);
    }
    });
})
.delete(function(req,res){
    articles.deleteMany().then(function(err){
        if(!err)
        {
            res.send("successfully deleted");}
        else
        {res.send(err);}
    });
    });
app.route("/articles/:articleTitle").get(function(req,res){
    articles.findOne({title:req.params.articleTitle}).then(function(foundarticle){
        if(foundarticle){
            res.send(foundarticle);
        }
        else{
            res.send("no articles are found");
        }
    })
})
.put(function(req,res){
articles.upadate(
    {title:req.params.articleTitle},
    {title:req.body.title,content:req.body.content},
    {overwrite: true})
    .then(function(err){
        if(!err){
            res.send("successfully updated");
        }
    })//you show this upadate function on run error and see documantation
})
.patch(function(req,res){
    articles.update(
        {title:req.params.articleTitle},
        {$set:req.body},
        function(err){
            if(!err){
                res.send("successfully upadated");
            }
            else{
                res.send(err);
            }
        }
    )
})
.delete(function(req,res){
    articles.deleteOne(
        {title:req.params.articleTitle}
    ).then(function(err){
        if(!err){
            res.send("sucessfully dleted");
        }
        else{
            res.send(err);
        }
    })
});



app.listen(3000,function(){
    console.log("the serverx are on port 3000")
})