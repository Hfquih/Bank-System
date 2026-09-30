import React from "react";
import ApiClient from "../globalAPI/apiClient";

import "../styles/auth.css";
import globalErr from "../globalAPI/globalErrors";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = React.useState<{[k: string]: string}>({});

  const [alert , setAlert] = React.useState({msg:'' , success:false , error:false})

  const [showPassword , setShowPassword] = React.useState(false)

  const client = ApiClient()

  const navigate = useNavigate()

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
    const {name , value} = e.currentTarget

    setForm(prev => {
      return{
        ...prev,
        [name] : value
      }
    })

    setErrors(prev => {
      return{
        ...prev,
        [name] : ''
      }
    })
  }

  async function handleSubmit(e : React.FormEvent<HTMLFormElement>){
    e.preventDefault()

    if(!checkInputs()) return 
    
    try{
      const {data} = await client.post('/auth/register' , form)

      setAlert({
        msg:data.msg , success:true , error:false
      })

      setTimeout(()=>{
        setAlert({
          msg:'' , success:false , error:false
        })
  
        navigate('/login')
  
      },3000)

    }catch(error){
      console.log(error)
      globalErr(error , setErrors , setAlert)
    }
  }

  type Auth = typeof form;

  function checkInputs(){
    const checkErr : Partial<Record<keyof Auth, string>> = {}

    Object.entries(form).forEach(([field , value])=>{
      if(!value.trim()){
        checkErr[field as keyof Auth] = `${capitalize(field)} is required`
      }
    })

    setErrors(checkErr)
    return Object.keys(checkErr).length === 0;
  }

  const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo">OB</div>
          <div>
            <h1>Online Bank</h1>
            <p>Create a secure account to manage your finances.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="field">
              <label>First name</label>
              <input type="text" name='firstName' value={form.firstName} placeholder="Jane" onChange={handleInput}/>
              {errors.firstName && <div className="error">{errors.firstName}</div>}
            </div>

            <div className="field">
              <label>Last name</label>
              <input type="text" name='lastName' value={form.lastName} placeholder="Doe" onChange={handleInput}/>
              {errors.lastName && <div className="error">{errors.lastName}</div>}
            </div>
          </div>

          <div className="field">
            <label>Phone</label>
            <input type="tel" name='phone' value={form.phone} placeholder="+1 (555) 555-5555" onChange={handleInput}/>
            {errors.phone && <div className="error">{errors.phone}</div>}
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" name='email' value={form.email} placeholder="you@domain.com" onChange={handleInput}/>
            {errors.email && <div className="error">{errors.email}</div>}
          </div>

          <div className="row">
            <div className="field">
              <label>Password</label>
              <div className="password-input">
                <input type={showPassword ? 'text' : 'password'} name='password' value={form.password} placeholder="Create a strong password" onChange={handleInput}/>
                <button type="button" className="show-btn" onClick={() => setShowPassword(s => !s)} aria-label="Toggle password visibility">{showPassword ? 'Hide' : 'Show'}</button>
              </div>
              {errors.password && <div className="error">{errors.password}</div>}
            </div>

            <div className="field">
              <label>Confirm password</label>
              <input type={showPassword ? 'text' : 'password'} name='confirmPassword' value={form.confirmPassword} placeholder="Repeat your password" onChange={handleInput}/>
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
            </div>
          </div>

          <button className="primary" type="submit">Register</button>

          {alert.msg && <div className={`alert ${alert.success ? 'text-success' : ''} ${alert.error ? 'text-error' : ''}`}>{alert.msg}</div>}

          <div className="auth-foot">
            <small>Already have an account? <a href="/login">Sign in</a></small>
          </div>
        </form>
      </div>
    </div>
  );
}