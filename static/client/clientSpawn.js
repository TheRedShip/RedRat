
function iconManagement(td,key){
    if(key == "loc"){
        let country = td.textContent.split(" ")[1]
        let url = `https://countryflagsapi.com/png/${country}` 

        let img = document.createElement("img")
        img.src = url
        img.width = "20"
        img.className = "img-label"
        td.outerHTML = `<td class="firstAppear">${img.outerHTML}${td.textContent}</td>`
    }
    else if(key == "ping"){
        let img = document.createElement("img")
        img.src = "./static/icons/latency.png"
        img.width = "20"
        img.className = "img-label"
        td.outerHTML = `<td>${img.outerHTML}${td.textContent}ms</td>`
    }else{
        let emojisDic = {"ip":"📡","os":"🖥️","idleTime":"🧭","upTime":"⌛","activeWindow":"📌"}
        if(key in emojisDic) td.innerHTML = `${emojisDic[key]} ${td.textContent}`
        
    }
}

setInterval(() => {
    fetch(`http://${document.baseURI.split("/")[2]}/request/fetchClients`)
    .then(response => response.json())
    .then(data => {
        for(const [socketID,client] of Object.entries(data)){
            let currentTr = document.getElementById(socketID)
            if(!currentTr){
                let tr = document.createElement("tr")
                tr.id = socketID
                tr.className = "tr-items"
                for(const [key,value] of Object.entries(client)){
                    let td = document.createElement("td")
                    td.className = "firstAppear"
                    td.textContent = value
                    tr.appendChild(td)

                    iconManagement(td,key)
                }
                
                document.getElementById("clientTable").appendChild(tr)
            }else{
                for(let i=0;i<currentTr.childNodes.length;i++){
                    let currNode = currentTr.childNodes[i]
                    let currKey = Object.keys(client)[i]
                    let currData = Object.values(client)[i]
                    if(currNode.textContent != currData){
                        currNode.textContent = currData

                        iconManagement(currNode,currKey)
                    }
                }
            }
        }
    })
    .catch(err=>console.log(err))

}, 2000);