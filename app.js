var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongoConf = require("./db.json")

var app = express();

mongoose.connect(mongoConf.uri,{ 
  useNewUrlParser: true ,
  useUnifiedTopology: true
  }).then(()=>{
      console.log("DB connected");
  }).catch(err=>{
      console.log(err);
  })
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.get("/",function(req,res,next){
  // res.sendFile(__dirname+"/index.html")
  res.sendFile(path.join(__dirname, "/public/index.html"));
})
var http= require("http");
const { error } = require('console');
var server = http.createServer(app)
var io = require("socket.io")(server)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


io.on("connection", function(socket) {
  console.log ("A new connection is made..");
  socket.broadcast.emit("msg",{"pseudo":"","content":"a new user is connected"})
  socket.on("msg",(data)=>{
    io.emit("msg",data)
 })


 socket.on('disconnect', () => {
  io.emit("disconnect1",'user disconnected');
});


socket.on('msg', msg => {
//   const {pseudo,content} = msg
//  const message = new messageModel({
//     pseudo:pseudo,
//     content:content,
//     likes:0
//  })
//  message.save()
      io.emit('message', msg)
  
})
socket.on('typing', data => {
  socket.broadcast.emit('typing', data);
});
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// module.exports = app;
server.listen(3000, ()=> console.log("server is running, port=3000"));
