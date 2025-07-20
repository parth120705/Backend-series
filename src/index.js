//require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import dbconnect from './db/index.js';


dotenv.config({
    path:'./env'
})

dbconnect();


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