class clientThread{
    constructor(name,ip,socket,id){
        this.name = name
        this.ip = ip
        this.socket = socket
        this.id = id

        console.log("connected : " + this.ip + " id : " + this.id)
    }
    send(way,data=undefined) {
        this.socket.emit(way,data)
    }
    disconnected(clientList){
        console.log("disconnected : " + this.ip + " id : " + this.id)
        clientList.splice(this.id,1)
    }
}

module.exports = { clientThread }