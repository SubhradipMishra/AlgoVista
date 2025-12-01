
import multer from "multer";
import path from "path";
import fs from "fs" ; 


const storage = multer.diskStorage({
   

    destination:(req , file , next)=>{
         const dest = path.join(__dirname ,"utils","success-stories" );
         console.log(dest) ;
         next(null ,dest );

    },

    filename:(req , file , next)=>{
       next(null , "demo.png")  ; 
    }
})


const upload = multer({
    storage:storage,

})


export default upload ; 