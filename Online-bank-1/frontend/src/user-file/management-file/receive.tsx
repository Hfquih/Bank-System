import React from "react";
import ApiClient from "../../globalAPI/apiClient";
import globalErr from "../../globalAPI/globalErrors";


type MovementForm = {
    amount: string;
    description: string;
    accountNumber: string;
};

interface TransactionErrors {
    amount?: string;
    description?: string;
    accountNumber?: string;
}

export default function Receive(props:any){
    const [form, setForm] = React.useState<MovementForm>({
        amount:"",
        description:"",
        accountNumber:""
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
    
            const {data} = await client.post('/auth/request-money' , {...form})
    
            setAlert({
                msg : data.msg , success : true , error : false
            })

            setForm({
                amount:"",
                description:"",
                accountNumber:""
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
            if(field === 'description'){
                return
            }

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
                    Amount
                    <input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
                    {errors.amount && <small className="text-errro">{errors.amount}</small>}
                </label>
                
                
                <label>
                    {props.selectedAction === "transfer" ? "Recipient account number" : "Sender account number"}
                    <input name="accountNumber" type="text" value={form.accountNumber} onChange={handleChange} required />
                    {errors.accountNumber && <small className="text-errro">{errors.accountNumber}</small>}
                </label>
    

                <label className="user-movement-description">
                    Description
                    <textarea name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Add a note (optional)" />
                    {errors.description && <small className="text-errro">{errors.description}</small>}
                </label>

                {alert.msg && <p className={alert.error ? 'text-error' : alert.success ? 'text-success' : ""}>{alert.msg}</p>}

                <button className="user-movement-submit" type="submit">
                    {props.action.title}
                </button>
            </form>
    )
}