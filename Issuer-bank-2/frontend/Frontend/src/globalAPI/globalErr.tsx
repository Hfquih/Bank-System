

export default function globalErr(error , setErrors , setAlert){

    const errors = error.response?.data

    if(errors && errors.errors){
        let checkErr = {}

        errors.errors.forEach(({msg , field})=>{
            checkErr[field] = msg
        }) 
        setErrors(checkErr)
    }else{
        setAlert({ msg: errors?.msg || errors?.[0].msg || "Something went wrong", field:true , error:true , success:false });
    }

    setTimeout(()=>{
        setAlert({msg:"" , field:false , success:false , error:false})
    },3000)
}