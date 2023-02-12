const socketid = window.location.href.split("/")[5]

function getImage(){
    let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/remoteDesktop`
    fetch(url)
    .then(response => response.json())
    .then(data => {
        let img = document.getElementById("remotedesktop")
        let imgData = data.img

        img.src = `data:image/jpg;base64,${imgData}`; 

        setTimeout(() => {
            getImage()
        }, 16);
    })
}

getImage()

let paramData = {}


window.addEventListener("load", () => {
    const rangeSlider = document.getElementsByClassName('range-slider__range');
    const rangeValue = document.getElementsByClassName('range-slider__value');

    for(let i = 0;i < rangeSlider.length;i++){
        const slider = rangeSlider[i]
        const value = rangeValue[i]

        slider.addEventListener('input', event => {
            value.textContent = event.target.value;
        });
        slider.addEventListener("change", event => {
            let data = {"remoteDesktopQuality":event.target.value}
            let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/params`
            fetch(url, {
                method: 'POST', 
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response)
        })
    }
    
    for(let paramSwitch of document.getElementsByClassName("switchInput")){
        paramSwitch.addEventListener("input",(event)=>{
            let paramName = event.target.name
            paramData[paramName] = event.target.checked
        })
    }


    document.addEventListener("contextmenu", function(e){
        e.preventDefault();
    }, false);

    let remoteDesktop = document.getElementById("remotedesktop")
    let clicked = false
    let isDragging = false

    remoteDesktop.addEventListener("click",(event)=>{
	console.log(isDragging,clicked)
        if(clicked || isDragging) return
        let data = {"clickX":event.offsetX,"clickY":event.offsetY,"maxX":event.target.clientWidth,"maxY":event.target.clientHeight}
        
        let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/click`
        fetch(url, {
            method: 'POST', 
            headers: { "Content-Type": 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => clicked=false)

        clicked = true
    })
    
    remoteDesktop.addEventListener("mousedown", (event) => {
        event.preventDefault()
        if (event.which === 3 || event.button === 2){ // rightclick
            if(clicked) return
            let data = {"clickX":event.offsetX,"clickY":event.offsetY,"maxX":event.target.clientWidth,"maxY":event.target.clientHeight}
            let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/Rclick`
            fetch(url, {
                method: 'POST', 
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => clicked=false)

            clicked = true
        }
        
        else if(event.which === 1 || event.button === 0){ //click drag
            if(isDragging || !paramData["forceDrag"]) return

            isDragging = true

            let data = {"clickX":event.offsetX,"clickY":event.offsetY,"maxX":event.target.clientWidth,"maxY":event.target.clientHeight, "action":"mouseDown"}
            let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/mouseAction`
            fetch(url, {
                method: 'POST', 
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response)

	    setTimeout(() => {
                isDragging = false
            }, 7000);

            
        } 
    })

    remoteDesktop.addEventListener("mouseup", (event) => {
        event.preventDefault()
        if(event.which === 1 || event.button === 0){ //click drag
            if(clicked || !paramData["forceDrag"]) return
            let data = {"clickX":event.offsetX,"clickY":event.offsetY,"maxX":event.target.clientWidth,"maxY":event.target.clientHeight, "action":"mouseUp"}
            let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/mouseAction`
            fetch(url, {
                method: 'POST', 
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => isDragging=false)
        } 
        
    })

    let move = false
    remoteDesktop.addEventListener("mousemove",(event)=>{
        if(paramData["forceMouse"]){
            if(move) return
            let data = {"posX":event.offsetX,"posY":event.offsetY,"maxX":event.target.clientWidth,"maxY":event.target.clientHeight}
            let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/moveMouse`
            fetch(url, {
                method: 'POST', 
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => move=false)

            move = true
        }
    })

    
})
