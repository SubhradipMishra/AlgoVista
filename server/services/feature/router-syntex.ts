import camelCase from "./case";

const routerSyntex = (feature:string) =>{
const name =  camelCase(feature)
  const ui = [
    `import express from 'express'`,
    `const ${name}Router =  express.Router()`, 
    `import { fetch${name}} from './${feature}.controller' \n`,
    `${name}Router.get('/',fetch${name})\n`,
    `export default ${name}Router`
    



  ];

  return ui;
}


export default routerSyntex ; 


