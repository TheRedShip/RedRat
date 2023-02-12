const socketid = window.location.href.split("/")[5]

function microRed(){
    let circlein = document.getElementById("circlein")
    circlein.style.background = "#E1746B"

    let circleout = document.getElementById("circleout")
    circleout.style.background = "#CF5D6D"
    circleout.style.boxShadow = "0px 0px 320px #F92B00"

    let outlines = document.getElementsByClassName("outline")
    for(let outline of outlines){
        outline.className = "outline outline-off"
    }
}

function microBlue(){
    let circlein = document.getElementById("circlein")
    circlein.style.background = "#6BD6E1"

    let circleout = document.getElementById("circleout")
    circleout.style.background = "#50CDDD"
    circleout.style.boxShadow = "0px 0px 320px #0084F9"

    let outlines = document.getElementsByClassName("outline")
    for(let outline of outlines){
        outline.className = "outline outline-on"
    }
}

let microState = 0

window.addEventListener("load", () => {
    const rangeSlider = document.getElementsByClassName('range-slider__range');
    const rangeValue = document.getElementsByClassName('range-slider__value');

    for(let i = 0;i < rangeSlider.length;i++){
        const slider = rangeSlider[i]
        const value = rangeValue[i]

        slider.addEventListener('input', event => {
            value.textContent = event.target.value;
        });
    }

    microRed()
    
    document.getElementById("circlein").addEventListener("click",()=>{
        microState = !microState
        if(microState==0) microRed()
        else if(microState==1){
            microBlue()
            getAudio()
        }
    })

    let selectMic = document.getElementById("selectMic")

    let url = `http://${document.baseURI.split("/")[2]}/request/getMicrophoneList/${socketid}`
    fetch(url)
    .then(response => response.json())
    .then(data => {
        let micList = data.microphoneList
        for(let mic of micList){
            
            let optionMic = document.createElement("option")
            optionMic.value = micList.indexOf(mic)
            optionMic.textContent = mic
            if(mic.startsWith("!!!")){
                optionMic.innerHTML = "<b>" + optionMic.textContent.substring(3) + "</b>"
                optionMic.selected = true
            }
            selectMic.appendChild(optionMic)
        }
    })

    selectMic.onchange = (ev => {
        let data = {"defaultMic":selectMic.value}
        let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/params`
        fetch(url, {
            method: 'POST', 
            headers: { "Content-Type": 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response)
    })

})



function getAudio(){
    let url = `http://${document.baseURI.split("/")[2]}/clients/${socketid}/remoteMicrophone`
    fetch(url)
    .then(response => response.json())
    .then(data => {
        data = data.path

        if(data == "notloaded"){
            setTimeout(() => {
                if(microState==1) getAudio()
            }, 5000);
        }else{
            let audio = new Audio(`../../../${data}`)

            audio.play()
            audio.addEventListener("ended",function(e){
                setTimeout(() => {
                    if(microState==1) getAudio()
                }, 30);
            })
        }
    })
}


