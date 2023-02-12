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

        infoOutput("ClipBoard System Init")
    }, 2800);
})

const socketid = window.location.href.split("/")[5]

let addedOutput = []

setInterval(() => {
    fetch(`http://${document.baseURI.split("/")[2]}/request/getClipBoard/${socketid}`)
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
    .catch(err=>console.log(err))

}, 3000);

