window.addEventListener('load', function () {
    const buttons = document.getElementsByClassName("navButton");

    for(let but of buttons){
        but.addEventListener("click", () => {
            const page = but.id.replace("but","")
            window.location.href = `/${page}`;
        });
    }



    let subMenu = document.getElementById("sub-menu")
    if(subMenu){
        const socketid = window.location.href.split("/")[5]
        let url = `http://${document.baseURI.split("/")[2]}/request/getName/${socketid}`
        fetch(url)
        .then(response => response.json())
        .then(data => {
            subMenu.textContent = data.name
        })
    }
})
