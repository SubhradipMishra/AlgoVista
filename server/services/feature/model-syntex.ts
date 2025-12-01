import camelCase from "./case";


const modelSyntex  = (feature:string) =>{
   
     const name = camelCase(feature)
    return  [ 
        `import {model,Schema} from "mongoose" \n`,
        `const  schema = new Schema({`,
        `\t`,
        `},{timestamps:true})\n`, 
        `const ${name}Model = model('${name}',schema)\n`,
        `export default ${name}Model`
    ]
}

export default modelSyntex ; 