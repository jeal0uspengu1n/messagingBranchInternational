//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _= require("lodash");
const fs = require('fs');

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const rawData = fs.readFileSync('data.json');
const dataArray = JSON.parse(rawData);
// console.log(dataArray[0]);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// creating the map and storing the user messages uniquely along with timestamps
map = new Map();
adminReply = new Map();
map.set(0, []);
map.get(0).push({
  TimestampUTC: "2017-02-01 19:21:58",
  MessageBody: "I need some more information about the services offered by Branch International!"
});
for(var i=0; i<dataArray.length; i++)
{
  if(map.get(dataArray[i].UserID) === undefined)
  {
    map.set(dataArray[i].UserID, []);
  }
  map.get(dataArray[i].UserID).push({
    TimestampUTC: dataArray[i].TimestampUTC, 
    MessageBody: dataArray[i].MessageBody
  });
}
// end of map thing

var objEntry=[];
var objEntry1=[];

map.forEach((values, key) => {
  // console.log(key);
  var MessageBodyArr = [];
  var TimestampUTCArr = [];
  values.forEach((value) => {
    MessageBodyArr.push(value.MessageBody);
    TimestampUTCArr.push(value.TimestampUTC);
  });
  var obj= {
    entryMessage: MessageBodyArr,
    entryUserID: "User" + key,
    entryTimestamp: TimestampUTCArr
  };
  var s= _.truncate(MessageBodyArr[0],{
    length: 69
  });
  var OBJ={
    entryMessage: s,
    entryUserID: "User" + key,
    entryTimestamp: TimestampUTCArr
  };
  objEntry.push(obj);
  objEntry1.push(OBJ);
});

app.get("/",function(req,res){
  res.render("home",{objEntry1: objEntry1});
});


app.get("/contact",function(req,res){
  res.render("contact",{contactCon: contactContent});
});


app.get("/about",function(req,res){
  res.render("about",{aboutCon: aboutContent});
});


app.get("/compose",function(req,res){
  res.render("compose");
});

app.post("/compose",function(req,res){
  res.redirect("/");
});


app.get("/post/:key",function(req,res){
  // console.log("req.qeury.data", req.query.data);
  var data = [];
  if(req.query.data !== undefined) {
    data = JSON.parse(req.query.data);
  }
  var s1= _.lowerCase(req.params.key);
  if(adminReply.get(s1) === undefined)
  {
    adminReply.set(s1,[]);
  }
  var adminReplyArr = data;
  var f=-11;
  objEntry.forEach(function(obj){
    var s2= _.lowerCase(obj.entryUserID);
    if(s1===s2)
    {
      const postRoute = "/post/:User" + s1.substring(5);
      // console.log("postRoute", postRoute);
      res.render("post", {
        UserID: obj.entryUserID, 
        MessageBody: obj.entryMessage, 
        TimestampUTC: obj.entryTimestamp, 
        adminReplyArr: adminReplyArr,
        postRoute: postRoute
      });
      // console.log(obj);
      f=1;
    }
  });
  if(f===-11)
  {
    res.render("failure");
  }
});

app.post("/post/:key", function(req, res) {
  let userId = req.body.UserID.substring(4);
  if(adminReply.get(userId) === undefined) {
    adminReply.set(userId, []);
  }
  const currentTime = new Date();
  let timeStamp = currentTime.toISOString();
  timeStamp = timeStamp.substring(0, 10) + " " + timeStamp.substring(11, 19);
  adminReply.get(userId).push(req.body.newEntry + " (" + timeStamp + ")");
  const data = JSON.stringify(adminReply.get(userId));
  res.redirect(`/post/:${req.body.UserID}?data=${data}`)
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
