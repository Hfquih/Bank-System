import {Pool} from 'pg'

const connectDb = async(url:string)=>{
    return new Pool({connectionString:url})
}

export default connectDb