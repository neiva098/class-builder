import * as fs from 'fs'
import { Entrie } from './interfaces'

export const getInterfaceObject = (path: string, name: string) => {
    const file: string = fs.readFileSync(path, 'ascii')

    const interfaceStr = getInterfaceIntoFile(file, name)

    return JSON.parse(interfaceToJson(interfaceStr).str)
}

export const getInterfaceIntoFile = (file: string, name: string) => {
    const regex = new RegExp(`interface ${name} \\{[^]+`)

    const matchedStr = file.match(regex)![0]

    const { beginIndex, endIndex } = getBeginEndOfObject(matchedStr)

    return matchedStr.slice(beginIndex, endIndex)
}

export const getBeginEndOfObject = (objStr: string) => {
    let cont = 1
    let beginIndex: number = undefined!
    let endIndex = 0

    for (let i = 0; i < objStr.length; i++) {
        if (objStr[i] === '{') {
            if (beginIndex === undefined) beginIndex = i

            cont--
        } else if (objStr[i] === '}') cont++

        if (cont === 1 && beginIndex !== undefined) {
            endIndex = i + 1
            break
        }
    }

    return {
        beginIndex,
        endIndex,
    }
}

export const getStrValue = (interfaceStr: string, begin: number, end: number) => {
    return interfaceStr
        .slice(begin, end)
        .replace(new RegExp(/\r|[?]|\n|[{]|[ ]|[,]/, 'gm'), '')
}

export const getStrKey = (interfaceStr: string, begin: number, end: number) => {
    return interfaceStr
        .slice(begin, end)
        .replace(new RegExp(/\r|[?]|\n|[ ]|[,]/, 'gm'), '')
}

export const handleNewValue = (value: Entrie, key: Entrie, interfaceStr: string, index: number) => {
    value.str = getStrValue(interfaceStr, value.indexBegin, index)

    key.indexBegin = index + 1

    return {
        key,
        value,
    }
}

export const handleNewPrimitiveKey = (value: Entrie, key: Entrie, interfaceStr: string, index: number) => {
    key.str = getStrKey(interfaceStr, key.indexBegin, index)

    const entrie = [value.str, key.str]

    value.indexBegin = index + 1
    value.str = ''

    return entrie
}

export const handleNewComplexKey = (value: Entrie, key: Entrie, interfaceStr: string, actualIndex: number) => {
    const { str, index: newIndex } = <any>interfaceToJson(interfaceStr, actualIndex, true)

    key.str = str

    const entrie = [value.str, key.str]

    value.indexBegin = newIndex + 1
    value.str = ''

    return {
        entrie,
        newIndex
    }
}

export const interfaceToJson = (interfaceStr: string, actualIndex: number = 0, isComplex: boolean = false) => {
    let key = {
        indexBegin: actualIndex,
        str: ''
    }

    let value = {
        indexBegin: actualIndex,
        str: ''
    }

    const entries = []

    for (let i = actualIndex; i < interfaceStr.length - 1; i++) {
        const currentChar = interfaceStr[i]

        if (currentChar === ':') {
            handleNewValue(value, key, interfaceStr, i)
            continue
        }

        if (currentChar === '{' && value.str !== '') {
            const { entrie, newIndex } = handleNewComplexKey(value, key, interfaceStr, i)

            i = newIndex
            entries.push(entrie)

            continue
        }

        if (currentChar === '}' || currentChar.match(new RegExp(/\n|,/))) {
            if (value.str !== '') {
                const entrie = handleNewPrimitiveKey(value, key, interfaceStr, i)

                entries.push(entrie)
            } else {
                if (entries.length > 0 && isComplex) {
                    return {
                        str: JSON.stringify(Object.fromEntries(entries)),
                        index: i,
                    }
                }
            }
        }
    }

    return {
        str: JSON.stringify(Object.fromEntries(entries)),
        index: interfaceStr.length
    }
}

export const getMethods = (objectInterface: any, objectName: string, className: string) => {
    const methods = Object.entries(objectInterface).map((entrie: any) => {
        entrie[1] = entrie[1]
            .replace(new RegExp(/["]|[\\"]/, 'gm'), '')
            .replace(new RegExp(/[.:]/, 'gm'), ': ')
            .replace(new RegExp(/[.{]/, 'gm'), '{ ')
            .replace(new RegExp(/[.}]/, 'gm'), ' }')

        return `    public with${entrie[0][0].toUpperCase()}${entrie[0].slice(1)}(${entrie[0]}: ${[entrie[1]]}): ${className} {
        this._${objectName}.${entrie[0]} = ${entrie[0]}
        return this
    }`
    })

    return methods
}

export const buildClass = (objectInterface: any, objectName: string, className: string) => {
    const methods = getMethods(objectInterface, objectName, className)

    return `export class ${className} {

    private _${objectName}: any

    constructor() {
        this._${objectName} = {}
    }

${methods.join('\n\n')}

    public build() {
        return this._${objectName}
    }

}
`
}