import camelCase from './case'

const controllerSyntex = (feature: string) => {
    const name =  camelCase(feature)
  const ui = [
    `import ${camelCase(feature)}Model from './${feature}.model'\n//controller\n`,
    `import { Request, Response } from "express"\n`,
    `export const fetch${name} = (req:Request , res:Response) => {`,
    `\tres.send("Hello")`,
    `}`
  ];

  return ui;
};

export default controllerSyntex;
