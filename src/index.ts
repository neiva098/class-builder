
import * as fs from 'fs'
import * as path from 'path'
import { getInterfaceObject, buildClass } from './utils'

const INTERFACE_PATH =
    `H:\\Projetos\\seidor\\efdcontribservice\\src\\interfaces\\NFe\\index.ts`

const INTERFACE_NAME = 'NFe'

const BUILDERS_PATH =
    `H:\\Projetos\\seidor\\efdcontribservice\\src\\tests\\testBuilders`


///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function main() {
    const className = `${INTERFACE_NAME}Builder`
    const objectName = INTERFACE_NAME.toLowerCase()

    const interfaceObject = getInterfaceObject(INTERFACE_PATH, INTERFACE_NAME)

    const classe = buildClass(interfaceObject, objectName, className)

    fs.writeFileSync(path.join(BUILDERS_PATH, `/${className}.ts`), classe)
}

main()