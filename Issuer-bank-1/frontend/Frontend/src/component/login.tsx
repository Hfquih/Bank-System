import React from "react";
import ApiClient from "../globalAPI/apiClient";
import globalErr from "../globalAPI/globalErr";
import "../styling/login.css";
import { useNavigate } from "react-router-dom";
import useAuth from "../globalAPI/useAuth";

type CustomerType = {
    email:string,
    password:string,
}

type CustomerTypeError = {
    email?:string,
    password?:string,

} 

export default function Login(){
    const [customer , setCustomer] = React.useState<CustomerType>({
        email:"",
        password:""
    })

    const [alert , sertAlert] = React.useState({msg:"" , success:false , error:false})

    const [errors , setErrors] = React.useState<CustomerTypeError>({})

    const client = ApiClient()

    const navigate = useNavigate()

    const {refreshUser} = useAuth()

    function handleInputs(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
        const {name , value} = e.currentTarget

        setCustomer(prev=>{
            return{
                ...prev,
                [name] : value
            }
        })
    }

    async function handleSubmit(e : React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if(!checkInputs()) return
        
        try{
            const {data} = await client.post("/auth/login" , {...customer})

            sertAlert({
                msg:data.msg , success:true , error:false
            })

            setTimeout(()=>{
                sertAlert({
                    msg:"" , success:false , error:true
                })
                refreshUser()
                navigate('/')
            },3000)
            
        }catch(error){
            console.log(error)
            globalErr(error , setErrors , sertAlert)
        }
    }

    type Auth = typeof customer;

    function checkInputs(){
        const checkErr : Partial<Record<keyof Auth, string>> = {}

        Object.entries(customer).forEach(([field , value])=>{
            if(!value.trim()){
                checkErr[field as keyof Auth] = `${capitalize(field)} is required` 
            }
        })

        setErrors(checkErr)
        return Object.keys(checkErr).length === 0;
    }

    const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);

    return(
        <div className="login-container">
            <section className="login-intro" aria-labelledby="login-heading">
                <div className="brand-mark" aria-hidden="true">M</div>
                <p className="eyebrow">Minkiy Issuer Bank</p>
                <h1 id="login-heading">Welcome back to your financial future.</h1>
                <p className="intro-copy">
                    Access your secure customer profile and keep your banking moving with confidence.
                </p>
                <div className="trust-note">
                    <span className="trust-icon" aria-hidden="true">+</span>
                    <div>
                        <strong>Your security comes first</strong>
                        <span>Every sign-in is protected with care and attention.</span>
                    </div>
                </div>
            </section>

            <section className="login-form-panel" aria-labelledby="form-title">
                <div className="form-heading">
                    <p className="eyebrow">Customer login</p>
                    <h2 id="form-title">Sign in to Minkiy</h2>
                    <p>Enter your credentials to continue to your account.</p>
                </div>

                {alert.msg && (
                    <div className={`form-alert ${alert.success ? "form-alert-success" : "form-alert-error"}`} role="alert">
                        {alert.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    <div className="field-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={customer.email}
                            onChange={handleInputs}
                            autoComplete="email"
                            placeholder="you@example.com"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? "email-error" : undefined}
                        />
                        {errors.email && <span id="email-error" className="field-error">{errors.email}</span>}
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={customer.password}
                            onChange={handleInputs}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? "password-error" : undefined}
                        />
                        {errors.password && <span id="password-error" className="field-error">{errors.password}</span>}
                    </div>

                    <button className="login-submit" type="submit">
                        Sign in to your account <span aria-hidden="true">-&gt;</span>
                    </button>
                    <p className="form-footnote">Your login credentials are handled securely and privately.</p>
                </form>
            </section>
        </div>
    )
}