var express = require("express");
var app = express();
var bodyParser = require("body-parser");
  
  
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
  
  var config = require("./config.js");
var adminUrl = config.adminUrl;
var pollNumber;
console.log(adminUrl);
//Use body parser to get paramaters from html pages?
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get("/", function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});

//Login page
app.get("/login", function(req,res){
    currentUser ='';
    res.sendFile(__dirname + '/public/login.html');
});

/////////////
//Login Post
/////////////
var countPost = 0;
app.post("/login", function (req, res) {
   var user=req.body.user;
   var pass=req.body.password;
   countPost++;
   console.log("Post#" + countPost + " User name = "+user+", password is " + pass);
   
   app.on('event:user_login', callback);
   function callback(){
       console.log("listened to the event");
       res.redirect("/createPoll");
   }
   
   if(user!=undefined){
       MongoClient.connect(adminUrl, function(err, db) {
           if(err){console.log(err);}
          //assert.equal(null, err);
          var collection = db.collection('users');
          collection.findOne({name:user,password:pass}, function(err,doc){
              if(err){console.log(err)}
              
              if(doc!=null){
                  db.close();
                  console.log("Login comfirmed");
                  var data = 0;
                  currentUser = user;
                  app.emit('event:user_login', data);
              }else{
                  db.close();
                  console.error("can't connect to mongodb server");
                  res.send("wrong password or username");
              }
          });
       });
    }//if end
    
});//Post /login end

////////////
//Post SignUp
/////////////
app.post("/signUp", function (req, res){
    if(req.body.newPass === req.body.newPass2){
    MongoClient.connect(adminUrl, function(err, db) {
        if(err){
              console.error("can't connect to mongodb server");
          }
          var collection = db.collection('users');
        // Get the documents collection
        collection.findOne({name:req.body.newUser},{name:1,_id:0}, function(err, doc){
            if(err){console.log("smth wrong with the collection");}
          //  console.log(doc.name);
            if(doc===null){
                collection.insertOne({name: req.body.newUser, password:req.body.newPass});
                console.log("Inserted new user");
               // res.send("Inserted new user");
               db.close();
               currentUser = req.body.newUser;
               res.redirect("/createPoll");
            }else{
            console.log("User already exists");
            db.close();
            res.send("User already exists");
            }
        }) ;
          
       });//Mongo connect end
    }
});//post end
    
//////////////////
//Create poll get
//////////////////
var currentUser = "";
app.get("/createPoll", function(req,res){
    if(currentUser!=""){
        res.sendFile(__dirname + '/public/createPoll.html');
    }else{
        res.send("You must login to create a poll");
    }
});
//////////////////
//Create poll post
//////////////////
app.post("/createPoll", function(req,res){
    currentUser = "test12345"; //remove this before release!
    console.log("got a post request"); 
   
   app.on('event:redirectToPollPage', function(data){
        console.log('inside event:redirectToPollPage');
        res.redirect("/poll?id=" + data.toString() );
    });
   
    MongoClient.connect(adminUrl, function(err, db) {
        if(err){
            console.error("can't connect to mongodb server");
        }
        var collection = db.collection('polls');
        collection.findOne({isPoll:1},{pollNumber:1,_id:0}, function(err, doc){
            if(err){console.log(err);}
            pollNumber = doc.pollNumber;
            pollNumber++;
            collection.update({"isPoll": 1}, {$set:{isPoll:1, pollNumber:pollNumber}});
            req.body.user = currentUser;
            req.body.pollNumber = pollNumber;
            console.log(req.body);
            collection.insertOne(req.body, function(){
                db.close();
               // app.emit('event:redirectToPollPage',pollNumber);
               res.end();
              // res.send({ redirect: '/poll?id='+pollNumber });
            });
           
        });//collection end
       
     });//MongoClient end
    
});

///////////////////
//sending poll page
///////////////////
app.get("/poll", function(req, res) {
    //example: /poll?id=123
    pollNumber = parseInt(req.query.id );
    console.log("inside /poll?id=" + pollNumber  );
    res.sendFile(__dirname + '/public/poll.html');
    console.log('poll.html file sent');
});

app.get("/pollData", function(req, res) {
    // var pollNumber = parseInt(122);//debug
    // var currentUser = "test12345";//debug
    console.log("Starting /pollData request/ pollNumber:" + pollNumber);
    MongoClient.connect(adminUrl, function(err, db) {
        if(err){
            console.error("can't connect to mongodb server");
        }
        var collection = db.collection('polls');
        collection.findOne({ user: { $exists: true},"pollNumber":pollNumber},
        {"user":1,"pollTitle":1,"polls":1,_id:0,"pollNumber":1}, function(err, doc){
            console.log(doc);
            db.close();
            res.json(doc);
            console.log("json doc sent\n");
        })//collection end
     });//MongoClient end
});


app.get("/pollNumber", function(req, res) {
    console.log("sending poll number:" + pollNumber);
    res.json(pollNumber);
});

app.post("/vote",function(req, res) {
   console.log("voting poll#:" + req.body.btnId);
   
   MongoClient.connect(adminUrl, function(err, db) {
        if(err){
            console.error("can't connect to mongodb server");
        }
    var buttonId = parseInt(req.body.btnId);
    var pollNumber =parseInt( req.body.pollNumber );
    var user = req.body.user.toString();
    console.log("buttnonId:" + buttonId +" user:" + user +" pollNumber:" + pollNumber );
    var collection = db.collection('polls');
   
    
    var query = {};
    var name = "polls."+buttonId.toString() +".votes";
    query[name] = 1;
    collection.update({user: { $exists: true},"pollNumber":pollNumber}, {$inc:query/*{"polls.0.votes":1}*/},function(){
      console.log("vote successful");
      
      collection.findOne({user: { $exists: true},"pollNumber":pollNumber},
        {"user":1,"pollTitle":1,"polls":1,_id:0,"pollNumber":1}, function(err, doc){
            if(err){
                console.log(err);
            }
            console.log("buttnonId:" + buttonId +" user:" + user +" pollNumber:" + pollNumber );
            console.log(doc);
            db.close();
            res.end();
            console.log("search ended\n");
        });//collection end
      
    });
   });
   
   
});


//////////////////////////
//Loading JavaScript Files
//////////////////////////
app.get("/public/poll.js", function(req, res) {
    //example: /poll?id=123
    res.sendFile(__dirname + '/public/poll.js');
});

app.get("/public/createPoll.js", function(req, res) {
    //example: /poll?id=123
    res.sendFile(__dirname + '/public/createPoll.js');
});

////////////////////
//Listenning to Port
////////////////////
var port = process.env.PORT | 8080;
app.listen(port, function(){
    console.log('Listenning to port:' + port);
});






