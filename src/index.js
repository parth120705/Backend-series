//require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import dbconnect from './db/index.js';
import { app } from './app.js';
import express from 'express'; // ← add this back
   


dotenv.config({
    path:'./env'
})

dbconnect()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Process is running at port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGO db connect failed ",error);
})


/*
import express from 'express';
const app=express();

;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        app.on("error",(error)=>{
            console.log(error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`Process is running at ${process.env.}`)
        })
    }catch(error){
        console.log(error)
        throw error
    }
})()

*/