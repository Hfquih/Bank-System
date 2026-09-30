import React from "react";
import ApiClient from "../../globalAPI/apiClient";
import globalErr from "../../globalAPI/globalErrors";


type MovementForm = {
    transactionId: string;
    reason: string;
};

interface TransactionErrors {
    amount?: string;
    reason?: string;
}

export default function Refund(props:any){
    const [form, setForm] = React.useState<MovementForm>({
        transactionId:"",
        reason:"",
    });

    const [errors , setErrors] = React.useState<TransactionErrors>({})
    
    const [alert , setAlert] = React.useState({msg:"" , success:false , error:false})

    const client = ApiClient()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    
        setErrors((current) => ({...current , [name] : ""}))
    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    
        if(!checkInputs()) return 
    
        try{
    
            const {data} = await client.post('/auth/refund-money' , {...form})
    
            setAlert({
                msg : data.msg , success : true , error : false
            })
    
            setTimeout(()=>{
                setAlert({
                    msg:"" , success:false , error:false
                })
            },3000)
    
        }catch(error){
            console.log(error)
            globalErr(error , setErrors , setAlert)
        }
    };

    type Transaction = typeof form

    function checkInputs(){
        const checkErr : Partial<Record<keyof Transaction, string>> = {}

        Object.entries(form).forEach(([field , value])=>{

            if(!value.trim()){
                checkErr[field as keyof Transaction] = `${capitalize(field)} is required.`
            }
        })

        setErrors(checkErr)
        return Object.keys(checkErr).length === 0;
    }

    const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);

    return(
        <form className="user-movement-form" onSubmit={handleSubmit}>
                <div className="user-movement-form-heading">
                    <h2>{props.action.title}</h2>
                    <p>{props.action.description}</p>
                </div>

                
                <label>
                    Transaction ID
                    <input name="transactionId" type="text" onChange={handleChange} required />
                </label>
    

                <label className="user-movement-description">
                    Reason
                    <textarea name="reason" rows={3} value={form.reason} onChange={handleChange} placeholder="Add a note..." />
                    {errors.reason && <small className="text-errro">{errors.reason}</small>}
                </label>

                {alert.msg && <p className={alert.error ? 'text-error' : alert.success ? 'text-success' : ""}>{alert.msg}</p>}

                <button className="user-movement-submit" type="submit">
                    {props.action.title}
                </button>
            </form>
    )
}