const express=require('express');

const app=express();

//This will only handle get call
app.get("/user",(req,res)=>{
    res.send({firstName:"Aahan", lastname:"Pulastya"});
});

app.post("/user",(req,res)=>{
    res.send("Save data to database")
})
app.delete("/user",(req,res)=>{
    res.send("Deleted Successfully")
})

//This wil match all the http method API
app.use("/test", (req,res)=>{
  res.send("Hello from server, yes you are conected to me on test directory");
});

app.listen(1122,()=>{
    console.log("Your Server is successfully listening on port 1122");
});