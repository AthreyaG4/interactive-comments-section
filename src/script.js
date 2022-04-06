async function getData(){
    let response = await fetch("/data");
    let data = await response.json();
    gotData(data);
}

let globalComments = [];
let currentid = 1;

function gotData({comments,currentUser}){

    const main = document.querySelector("main");
    for(comment of comments){
        makeComment("original",currentUser,comment,main,"beforeend");
        currentid++;
        for(reply of comment.replies){
            makeComment("reply",currentUser,reply,main,"beforeend");
            currentid++;
        }
    }

    makeBox("comment-box",currentUser,main,"beforeend");
    const sendButton = document.querySelector(".send");
    sendButton.addEventListener("click", (e) => {
        if(e.target.parentElement.querySelector("textarea").value.trim()){
            fetch("/send",{
                method: "POST",
                body:JSON.stringify({
                    id:currentid,
                    content:`${e.target.parentElement.querySelector("textarea").value.trim()}`,
                    createdAt:"Now",
                    score:0,
                    user:currentUser,
                    replies:[]
                }),
                headers:{
                    "content-type":"application/json"
                }
            });
            makeComment("original",currentUser,{
                id:currentid,
                content:e.target.parentElement.querySelector("textarea").value.trim(),
                createdAt:"Now",
                score:0,
                user:currentUser,
                replies:[]
            },e.target.parentElement.previousSibling,"afterend");
            e.target.parentElement.querySelector("textarea").value = "";
            currentid++;
        }
    });
}

// Function to dynamically make a comment
function makeComment(type,currentUser,commentObj,parent,insertWhere){
    const comment = document.createElement("div");
    type=="original" ? comment.classList.add("original") : comment.classList.add("reply");
    comment.classList.add("comment");
    comment.id = currentid;

    const imageContainer = document.createElement("div");
    imageContainer.classList.add("img-container");
    const image = document.createElement("img");
    image.src = commentObj.user.image.png;
    image.alt = "avatar";
    imageContainer.appendChild(image);
    comment.appendChild(imageContainer);

    const name = document.createElement("div");
    name.classList.add("name");
    name.innerText = commentObj.user.username;
    comment.appendChild(name);

    const time = document.createElement("div");
    time.classList.add("time");
    time.innerText = commentObj.createdAt;
    comment.appendChild(time);

    const content = document.createElement("div");
    content.classList.add("content");
    let replyingTo = commentObj.replyingTo ? `@${commentObj.replyingTo},` : "";
    content.innerText = `${replyingTo} ${commentObj.content}`;
    comment.appendChild(content);

    const votes = document.createElement("div");
    votes.classList.add("votes");

    const iconPlus = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    iconPlus.setAttribute("width",11);
    iconPlus.setAttribute("height",11);
    iconPlus.setAttribute("xmlns","http://www.w3.org/2000/svg");
    iconPlus.classList.add("icon-plus");
    const iconPlusPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    iconPlusPath.setAttribute("d","M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z");
    iconPlusPath.setAttribute("fill","#C5C6EF");
    iconPlus.appendChild(iconPlusPath);
    iconPlus.addEventListener("click",(e) => {
        e.currentTarget.nextSibling.innerText = `${parseInt(e.currentTarget.nextSibling.innerText) + 1}`;
        for(globalComment of globalComments){
            if(globalComment.id == comment.id){
                globalComment.score++;
                fetch("/edit",{
                    method: "POST",
                    body:JSON.stringify(globalComment),
                    headers:{
                        "content-type":"application/json"
                    }
                });
                break;
            }
            for(reply of globalComment.replies){
                if(reply.id == comment.id){
                    reply.score++;
                    fetch("/edit",{
                        method: "POST",
                        body:JSON.stringify(globalComment),
                        headers:{
                            "content-type":"application/json"
                        }
                    });
                    break;
                }
            }
        }
    });
    votes.appendChild(iconPlus);

    const upvotes = document.createElement("p");
    upvotes.classList.add("upvotes");
    upvotes.innerText = commentObj.score;
    votes.appendChild(upvotes);

    const iconMinus = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    iconMinus.setAttribute("width",11);
    iconMinus.setAttribute("height",3);
    iconMinus.setAttribute("xmlns","http://www.w3.org/2000/svg");
    iconMinus.classList.add("icon-minus");
    const iconMinusPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    iconMinusPath.setAttribute("d","M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z");
    iconMinusPath.setAttribute("fill","#C5C6EF");
    iconMinus.appendChild(iconMinusPath);

    iconMinus.addEventListener("click",(e) => {
        e.currentTarget.previousSibling.innerText = `${parseInt(e.currentTarget.previousSibling.innerText) - 1}`;
        for(globalComment of globalComments){
            if(globalComment.id == comment.id){
                globalComment.score--;
                fetch("/edit",{
                    method: "POST",
                    body:JSON.stringify(globalComment),
                    headers:{
                        "content-type":"application/json"
                    }
                });
                break;
            }
            for(reply of globalComment.replies){
                if(reply.id == comment.id){
                    reply.score--;
                    fetch("/edit",{
                        method: "POST",
                        body:JSON.stringify(globalComment),
                        headers:{
                            "content-type":"application/json"
                        }
                    });
                    break;
                }
            }
        }
    });

    votes.appendChild(iconMinus);

    comment.appendChild(votes);

    if(currentUser.username == commentObj.user.username){
        makeBtn("edit",comment,currentUser);
        makeBtn("delete",comment,currentUser);
    }
    else{
        makeBtn("reply",comment,currentUser);
    }

    if(type == "reply"){
        for(globalComment of globalComments){
            if(globalComment.id == parent.id){
                globalComment.replies.push(commentObj);
                break;
            }
        }
    }
    else{
        globalComments.push(commentObj);
    }
    parent.insertAdjacentElement(insertWhere,comment);
}

function makeBox(type,commentObj,parent,insertWhere,currentContent){
    const boxContainer = document.createElement("div");
    type == "reply-box" ? boxContainer.classList.add("reply-box") : boxContainer.classList.add("comment-box");
    boxContainer.classList.add("box-container");

    const image = document.createElement("img");
    image.src = commentObj.image.png;
    image.alt = "avatar";
    boxContainer.appendChild(image);

    const textarea = document.createElement("textarea");
    textarea.cols = 30;
    textarea.rows = 4;
    textarea.placeholder = "Add a comment...";
    currentContent ? textarea.value = currentContent : "";
    boxContainer.appendChild(textarea);

    const sendbutton = document.createElement("button");
    sendbutton.classList.add("submit-btn");
    sendbutton.innerText = type=="reply-box"?"reply":"send";
    type == "reply-box" ? sendbutton.classList.add("replySendBtn") : sendbutton.classList.add("send");
    boxContainer.appendChild(sendbutton);

    if(type=="reply-box"){
        const cancelButton = document.createElement("button");
        cancelButton.classList.add("submit-btn", "cancel-btn");
        cancelButton.innerText = "cancel";

        cancelButton.addEventListener("click", (e) => {
            if(e.currentTarget.parentElement.querySelector(".edit-button")){
                e.currentTarget.parentElement.remove();
            }
            else{
                e.currentTarget.parentElement.previousSibling.style.display = "grid";
                e.currentTarget.parentElement.remove();
            }
        });
        boxContainer.appendChild(cancelButton);
    }
    
    if(parent.classList.contains("reply")){
        boxContainer.style.width = "90%";
    }

    parent.insertAdjacentElement(insertWhere,boxContainer);
    return boxContainer;
}

function makeBtn(type,comment,currentUser){
    const Btn = document.createElement("div");
    type=="delete" ? Btn.classList.add("delete-button","icon-btn"): type=="reply" ? Btn.classList.add("reply-button","icon-btn"):Btn.classList.add("edit-button","icon-btn");

    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon-container");

    const icon = document.createElement("img");
    icon.src = `assets/icon-${type}.svg`;
    icon.alt = `${type}-button`;
    iconContainer.appendChild(icon);

    Btn.appendChild(iconContainer);

    const text = document.createElement("p");
    text.innerText = type;

    Btn.appendChild(text);

    if(type=="edit"){
        Btn.addEventListener("click",(e) => {
            let content = e.currentTarget.parentElement.querySelector(".content").innerText;
            e.currentTarget.parentElement.style.display = "none";
            const boxContainer = makeBox("reply-box",currentUser,e.currentTarget.parentElement,"afterend",content);
            const replySendBtn = boxContainer.querySelector(".replySendBtn");
            replySendBtn.innerText = "update";
            replySendBtn.addEventListener("click",(e1) => {
                let content = e1.currentTarget.parentElement.querySelector("textarea").value.trim();
                e1.currentTarget.parentElement.previousSibling.querySelector(".content").innerText = content;
                e1.currentTarget.parentElement.previousSibling.style.display = "grid";
                e1.currentTarget.parentElement.remove();

                for(globalComment of globalComments){
                    if(globalComment.id == comment.id){
                        globalComment.content = content;
                        fetch("/edit",{
                            method: "POST",
                            body:JSON.stringify(globalComment),
                            headers:{
                                "content-type":"application/json"
                            }
                        });
                        break;
                    }
                    for(reply of globalComment.replies){
                        if(reply.id == comment.id){
                            reply.content = content;
                            fetch("/edit",{
                                method: "POST",
                                body:JSON.stringify(globalComment),
                                headers:{
                                    "content-type":"application/json"
                                }
                            });
                            break;
                        }
                    }
                }
            });
        });
    }
    else if(type=="reply"){
        Btn.addEventListener("click",(e) => {
            if(!e.currentTarget.parentElement.nextSibling.classList.contains("reply-box")){
                const boxContainer = makeBox("reply-box",currentUser,e.currentTarget.parentElement,"afterend");
                const replySendBtn = boxContainer.querySelector(".replySendBtn");
                replySendBtn.addEventListener("click",(e1) => {
                    if(e1.currentTarget.parentElement.querySelector("textarea").value.trim()){
                        fetch("/reply",{
                            method: "POST",
                            body:JSON.stringify({
                                id:currentid,
                                content:`${e1.target.parentElement.querySelector("textarea").value.trim()}`,
                                createdAt:"Now",
                                score:0,
                                user:currentUser,
                                replyingTo:comment.querySelector(".name").innerText,
                            }),
                            headers:{
                                "content-type":"application/json"
                            }
                        });
                        makeComment("reply",currentUser,{
                            id:currentid,
                            content:`${e1.target.parentElement.querySelector("textarea").value.trim()}`,
                            createdAt:"Now",
                            score:0,
                            user:currentUser,
                            replyingTo:comment.querySelector(".name").innerText,
                        },e1.target.parentElement.previousSibling,"afterend");
                        e1.target.parentElement.querySelector("textarea").value = "";
                        e1.target.parentElement.remove();
                        currentid++;
                    }
                });
            }
        });
    }
    else{
        Btn.addEventListener("click",(e) => {
            const modal = document.querySelector(".modal");
            const overlay = document.querySelector(".overlay");
            modal.classList.remove("invisible");
            overlay.classList.remove("invisible");

            const modalBtnYes = modal.querySelector(".yes");
            const modalBtnNo = modal.querySelector(".no");

            const parent = e.currentTarget.parentElement;
            
            overlay.addEventListener("click",(e1) => {
                modal.classList.add("invisible");
                overlay.classList.add("invisible");
            });

            modalBtnNo.addEventListener("click",(e1) => {
                modal.classList.add("invisible");
                overlay.classList.add("invisible");
            });

            modalBtnYes.addEventListener("click",(e1) => {
                parent.remove();
                modal.classList.add("invisible");
                overlay.classList.add("invisible");

                for(let i = 0 ; i< globalComments.length ; i++){
                    if(globalComments[i].id == comment.id){
                        fetch("/delete",{
                            method: "POST",
                            body:JSON.stringify({id:globalComments[i].id}),
                            headers:{
                                "content-type":"application/json"
                            }
                        });
                        globalComments.splice(i,1);
                        break;
                    }
                    for(let j = 0; j < globalComments[i].replies.length; j++){
                        if(globalComments[i].replies[j].id == comment.id){
                            fetch("/delete",{
                                method: "POST",
                                body:JSON.stringify({id:globalComments[i].replies[j].id}),
                                headers:{
                                    "content-type":"application/json"
                                }
                            });
                            globalComments[i].replies.splice(j,1);
                            break;
                        }
                    }
                }
            });
        });
    }
    comment.appendChild(Btn);
}

getData();





