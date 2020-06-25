
import * as fs from 'fs'
import * as path from 'path'
import { getInterfaceObject, buildClass } from './utils'

const interfacePath =
    `H:\\Projetos\\seidor\\efdcontribservice\\src\\utils\\registryUtils\\block0\\0000\\interface.ts`

const interfaceName = 'ContribuicoesRetidas'

const myBuildersPath =
    `H:\\Projetos\\seidor\\efdcontribservice\\src\\tests\\testBuilders`


///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const className = `${interfaceName}Builder`
const objectName = interfaceName.toLowerCase()


function main() {
    const interfaceObject = getInterfaceObject(interfacePath, interfaceName)

    const classe = buildClass(interfaceObject, objectName, className)

    fs.writeFileSync(path.join(myBuildersPath, `/${className}.ts`), classe)
}

main()