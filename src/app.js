const express=require('express');

const app=express();

app.use("/", (req,res)=>{
    res.send("Hello from server, root")
  })

app.use("/test", (req,res)=>{
  res.send("Hello from server, yes you are conected to me on test directory")
})


app.listen(1122,()=>{
    console.log("Your Server is successfully listening on port 1111");
});