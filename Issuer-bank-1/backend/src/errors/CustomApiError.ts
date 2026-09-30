class CustomApiError extends Error{
    statusCode : number
    constructor(message : string , statusCodes : number){
        super(message)
        this.statusCode = statusCodes
    }
}

export default CustomApiError