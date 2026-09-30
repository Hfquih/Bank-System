import React from "react";
import ApiClient from "../globalAPI/apiClient";
import globalErr from "../globalAPI/globalErr";
import "../styling/register.css";
import { useNavigate } from "react-router-dom";

type CustomerType = {
    firstName:string,
    lastName:string,
    email:string,
    phone:string,
    password:string,
    confirmPassword:string
}

type CustomerTypeError = {
    firstName?:string,
    lastName?:string,
    email?:string,
    phone?:string
    password?:string,
    confirmPassword?:string
} 

export default function Register(){
    const [customer , setCustomer] = React.useState<CustomerType>({
        firstName:"",
        lastName:"",
        email:"",
        phone:"",
        password:"",
        confirmPassword:""
    })

    const [alert , sertAlert] = React.useState({msg:"" , success:false , error:false})

    const [errors , setErrors] = React.useState<CustomerTypeError>({})

    const client = ApiClient()

    const navigate=useNavigate()

    function handleInputs(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
        const {name , value} = e.currentTarget

        setCustomer(prev=>{
            return{
                ...prev,
                [name] : value
            }
        })

        setErrors(prev=>{
            return{
                ...prev,
                [name]:""
            }
        })
    }

    async function handleSubmit(e : React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if(!checkInputs()) return
        
        try{
            const {data} = await client.post("/auth/register" , {...customer})

            sertAlert({
                msg:data.msg , success:true , error:false
            })

            setTimeout(()=>{
                sertAlert({
                    msg:"" , success:false , error:true
                })
                navigate("/login")
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
        <div className="register-container">
            <section className="register-intro" aria-labelledby="register-heading">
                <div className="brand-mark" aria-hidden="true">M</div>
                <p className="eyebrow">Minkiy Issuer Bank</p>
                <h1 id="register-heading">A stronger start for your financial future.</h1>
                <p className="intro-copy">
                    Create your secure customer profile and take the first step toward simpler, more confident banking.
                </p>
                <div className="trust-note">
                    <span className="trust-icon" aria-hidden="true">+</span>
                    <div>
                        <strong>Built around your confidence</strong>
                        <span>Your information is handled with care at every step.</span>
                    </div>
                </div>
            </section>

            <section className="register-form-panel" aria-labelledby="form-title">
                <div className="form-heading">
                    <p className="eyebrow">Customer registration</p>
                    <h2 id="form-title">Open your profile</h2>
                    <p>Enter your details below to get started with Minkiy.</p>
                </div>

                {alert.msg && (
                    <div className={`form-alert ${alert.success ? "form-alert-success" : "form-alert-error"}`} role="alert">
                        {alert.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="name-fields">
                        <div className="field-group">
                            <label htmlFor="firstName">First name</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={customer.firstName}
                                onChange={handleInputs}
                                autoComplete="given-name"
                                placeholder="Amelia"
                                aria-invalid={Boolean(errors.firstName)}
                                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                            />
                            {errors.firstName && <span id="firstName-error" className="field-error">{errors.firstName}</span>}
                        </div>

                        <div className="field-group">
                            <label htmlFor="lastName">Last name</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={customer.lastName}
                                onChange={handleInputs}
                                autoComplete="family-name"
                                placeholder="Hart"
                                aria-invalid={Boolean(errors.lastName)}
                                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                            />
                            {errors.lastName && <span id="lastName-error" className="field-error">{errors.lastName}</span>}
                        </div>
                    </div>

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
                        <label htmlFor="phone">Phone number</label>
                        <input
                            id="phone"
                            name="phone"
                            type="string"
                            value={customer.phone}
                            onChange={handleInputs}
                            autoComplete="phone"
                            placeholder="0608987701"
                            aria-invalid={Boolean(errors.phone)}
                            aria-describedby={errors.phone ? "email-error" : undefined}
                        />
                        {errors.phone && <span id="email-error" className="field-error">{errors.phone}</span>}
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={customer.password}
                            onChange={handleInputs}
                            autoComplete="new-password"
                            placeholder="Create a strong password"
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? "password-error" : undefined}
                        />
                        {errors.password && <span id="password-error" className="field-error">{errors.password}</span>}
                    </div>

                    <div className="field-group">
                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={customer.confirmPassword}
                            onChange={handleInputs}
                            autoComplete="new-password"
                            placeholder="Re-enter your password"
                            aria-invalid={Boolean(errors.confirmPassword)}
                            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                        />
                        {errors.confirmPassword && <span id="confirmPassword-error" className="field-error">{errors.confirmPassword}</span>}
                    </div>

                    <button className="register-submit" type="submit">
                        Create customer profile <span aria-hidden="true">-&gt;</span>
                    </button>
                    <p className="form-footnote">By continuing, you agree to our customer terms and privacy standards.</p>
                </form>
            </section>
        </div>
    )
}