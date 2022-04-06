let fs = require("fs");
let path = require("path");


let data = require("./data.json");

let express = require("express");
let app = express();
app.listen(3000,() => {
    console.log("listening at 3000");
});
app.use(express.static('src'));
app.use(express.json());

app.get("/data",(req,res) => {
    res.json(data);
    res.end();
});

app.post("/edit",(req,res) => {
    for(let i=0;i<data.comments.length;i++){
        if(data.comments[i].id == req.body.id){
            data.comments[i] = req.body;
            break;
        }
        for(let j=0;j<data.comments[i].replies.length;j++){
            if(data.comments[i].replies[j].id == req.body.id){
                data.comments[i].replies[j] = req.body;
                break;
            }
        }
    }
    fs.writeFile(path.join(__dirname,'data.json'),JSON.stringify(data,null,2),(err)=>{
        if(err) console.log(err);
    })
    res.end();
});

app.post("/delete",(req,res)=>{
    for(let i=0;i<data.comments.length;i++){
        if(data.comments[i].id == req.body.id){
            data.comments.splice(i,1);
            break;
        }
        for(let j=0;j<data.comments[i].replies.length;j++){
            if(data.comments[i].replies[j].id == req.body.id){
                data.comments[i].replies.splice(j,1);
                break;
            }
        }
    }
    fs.writeFile(path.join(__dirname,'data.json'),JSON.stringify(data,null,2),(err)=>{
        if(err) console.log(err);
    })
    res.end();
});

app.post("/reply",(req,res)=>{
    for(let i=0;i<data.comments.length;i++){
        if(data.comments[i].user.username == req.body.replyingTo){
            data.comments[i].replies.push(req.body);
        }
        for(let j=0;j<data.comments[i].replies.length;j++){
            if(data.comments[i].replies[j].user.username == req.body.replyingTo){
                data.comments[i].replies.push(req.body);
            }
        }
    }
    fs.writeFile(path.join(__dirname,'data.json'),JSON.stringify(data,null,2),(err)=>{
        if(err) console.log(err);
    })
    res.end();
});

app.post("/send",(req,res)=>{
    data.comments.push(req.body);
    fs.writeFile(path.join(__dirname,'data.json'),JSON.stringify(data,null,2),(err)=>{
        if(err) console.log(err);
    })
    res.end();
});


