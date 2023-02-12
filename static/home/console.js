function output(print) {
    $("#outputs").append(print)  
    $(".console").scrollTop($('.console-inner').height());
}

function infoOutput(print,date=new Date()){
    const d = new Date(date);
    
    print = `<h7 id="con-info">[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}][*]</h7> ${print}`
    output(print)
    output("<br>")
}

function successOutput(print,date=new Date()){
    const d = new Date(date);
    
    print = `<h7 id="con-success">[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}][+]</h7> ${print}`
    output(print)
    output("<br>")
}

function failOutput(print,date=new Date()){
    const d = new Date(date);
    
    print = `<h7 id="con-fail">[${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}][-]</h7> ${print}`
    output(print)
    output("<br>")
}

let menuFlag = [[':::::::..',"&nbsp;&nbsp;.,::::::", ":::::::-."],
                  [';;;;``;;;;',"&nbsp;;;;;''''","&nbsp;;;, &nbsp;&nbsp;`';,"],
                  ["&nbsp;[[[,/[[['","&nbsp;&nbsp;[[cccc","&nbsp;&nbsp;`[[ &nbsp;&nbsp;&nbsp;&nbsp;[["],
                  ["&nbsp;$$$$$$c",'&nbsp;&nbsp;&nbsp;&nbsp;$$""""',"&nbsp;&nbsp;&nbsp;$$, &nbsp;&nbsp;&nbsp;$$"],
                  ['&nbsp;888b "88bo,','888oo,__',"&nbsp;888_,o8P'"],
                  ['&nbsp;MMMM &nbsp;&nbsp;"W"','&nbsp;""""YUMMM','MMMMP"`']]


function outputProcessMenu(row){
    if(menuFlag.length==row) return;
    for(let string of menuFlag[row]){
        output(`<h7 id="con-menuFlag">${string}</h7>`)
        output("&nbsp;")
        output("&nbsp;")
        output("&nbsp;")
    }
    output("</br>")
    setTimeout(() => outputProcessMenu(row+1), 500/3);
}

window.addEventListener("load", () => {
    setTimeout(() => outputProcessMenu(0),1000)
    
    setTimeout(() => {
        output('</br>')
        output('<h7 id="con-remote"><b>Remote</b> </h7>')
        output('<h7 id="con-engineering"><b>Engineering</b> </h7>')
        output('<h7 id="con-daemon"><b>Daemon</b> </h7>')
        output("</br>")
        output("</br>")

        infoOutput("Console Init")
    }, 2800);
})

let addedOutput = []

setInterval(() => {
    fetch(`http://${document.baseURI.split("/")[2]}/request/fetchConsole`)
    .then(response => response.json())
    .then(data => {
        if(data["output"]){
            let outputList = data["output"]
            for(let output of outputList){
                if(!addedOutput.includes(output[1])){
                    
                    if(output[2] == 0) infoOutput(output[0],output[1])
                    else if(output[2] == 1) successOutput(output[0],output[1])
                    else if(output[2] == 2) failOutput(output[0],output[1])
    
                    addedOutput.push(output[1])
                }
                
            }
        }
        if(data["clients"]){
            
            document.getElementById("numInfected").textContent = data["clients"][0]
            document.getElementById("numOnline").textContent = data["clients"][1]
            document.getElementById("numOffline").textContent = data["clients"][2]
        } 

    })
    .catch(err=>console.log(err))

}, 3000);

