export class OurstoryError extends Error{
    readonly code: number
    readonly codeText: string
    readonly msg?:string
    constructor(code: number, codeText: string, msg?: string){
        super(msg)
        this.msg = msg
        this.code = code
        this.codeText = codeText
        this.name = 'OurstoryError'
    }
    
}

export const isOurstoryError = (stringified: string): boolean=>{
        const e = JSON.parse(stringified)
        return e.name === 'OurstoryError'
    }
export const parseErrorString = (stringified: string): OurstoryError | undefined =>{
    const e = JSON.parse(stringified)
    if(e.name === 'OurstoryError') return new OurstoryError(e.code, e.codeText, e.msg)
    return undefined
}
export const parseErrorObject = (e: any): OurstoryError | undefined =>{
    if(e.name === 'OurstoryError') return new OurstoryError(e.code, e.codeText, e.msg)
    return undefined
}


const OurstoryErrorConstructor = {
    _403: (msg?: string) =>new OurstoryError(403, 'ResourceAccessDenied' , msg? msg : 'Access Denied'),
    _400: (msg?: string)=> new OurstoryError(400, 'InvalidRequest', msg ? msg : 'Missing parameters'),
    _404: (msg?: string)=> new OurstoryError(400, 'ResourceNotFound', msg ? msg : 'Resource Not Found'),
    _502:(msg?: string)=> new OurstoryError(502, 'InternalServerError', msg || 'Internal Server Error')
}
export default OurstoryErrorConstructor


