
// let currentClient;

window.addEventListener("load", () => {
    let contextMenu = document.getElementById("contextMenu")

    document.getElementById("clientTable").addEventListener("DOMNodeInserted", (change)=>{
        if (change.target.className == "tr-items"){
            change.target.addEventListener("click", function(event){
                contextMenu.style.display = "block"
                contextMenu.style.left = event.pageX + "px"
                contextMenu.style.top = event.pageY + "px"
                
                for(let menuitem of contextMenu.getElementsByTagName("menuitem")){
                    let childs = menuitem.childNodes
                    if(childs.length == 1){
                        let a = childs[0]

                        let categoryParent = a.parentNode.parentNode.parentNode.childNodes[1].textContent
                        categoryParent = categoryParent.replace(/[^a-z0-9]/gi,'');
                        categoryParent = categoryParent.replace(" ","")

                        let commandPath = a.textContent.replace(/[^a-z0-9]/gi,'');
                        commandPath = commandPath.replace(" ","")
                        
                        a.href = `/clients/${categoryParent}/${change.target.id}/${commandPath}`
                        a.target = "_blank"
                    }
                }
            })
        }
    })
    document.getElementById("topBar").addEventListener("click", () => {
        contextMenu.style.top = "-500px";
    })
    
})

    
