import camelCase from './case'
import { readFileSync, writeFileSync } from "fs"
import path from "path"

const endpointSetup = (feature: string)=>{
    const name = camelCase(feature)
    const root = process.cwd()
    const serverFile = path.join(root, "src", "index.ts")
    const contents = readFileSync(serverFile, "utf-8")
    const arr = contents.split("\n")
  

       arr.push(`\nimport ${name}Router from './${feature}/${feature}.routes'`)

    arr.push(`app.use('/${feature}', ${name}Router)`)
    writeFileSync(serverFile,arr.join("\n").toString())
    return true
}

export default endpointSetup