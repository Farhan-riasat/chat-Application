var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
user = [];
connections = [];

server.listen(process.env.PORT || 3000, function(){
    console.log('Server is running ...');
});

app.get('/', function(req,res){
    res.sendFile(__dirname +'/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('connected: %s sockets connected', connections.length);


    //Disconnect
    socket.on('disconnect', function(data){
        if(!socket.username) return;
        user.splice(user.indexOf(socket.username),1)
        updateUsername();
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s sockets connected',connections.length)
    })

    //send messages
    socket.on('send message', function(data){
        io.sockets.emit('new message',{msg:data, user:socket.username})
    })

    //new users
    socket.on('new user',function(data, callback){
        callback(true);
        socket.username = data;
        user.push(socket.username);
        updateUsername();
    })

    function updateUsername(){
        io.sockets.emit('get users', user)
    }

    //typing
    socket.on('typing', function(data){
        socket.broadcast.emit('typing',{user:socket.username});
    })
})

