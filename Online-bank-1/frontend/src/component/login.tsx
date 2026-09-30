import React from "react";
import ApiClient from "../globalAPI/apiClient";

import "../styles/auth.css";
import globalErr from "../globalAPI/globalErrors";
import useAuth from "../globalAPI/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = React.useState<{[k: string]: string}>({});

  const [alert , setAlert] = React.useState({msg:'' , success:false , error:false})

  const [showPassword , setShowPassword] = React.useState(false)

  const client = ApiClient()

  const {refreshUser} = useAuth()

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
      const {data} = await client.post('/auth/login' , form)

      setAlert({
        msg:data.msg , success:true , error:false
      })

      setTimeout(()=>{
        setAlert({
          msg:'' , success:false , error:false
        })
        navigate('/')
      },3000)

      await refreshUser()

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

  console.log(alert)

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

          <div className="field">
            <label>Email</label>
            <input type="email" name='email' value={form.email} placeholder="you@domain.com" onChange={handleInput}/>
            {errors.email && <div className="error">{errors.email}</div>}
          </div>

            <div className="field">
              <label>Password</label>
              <div className="password-input">
                <input type={showPassword ? 'text' : 'password'} name='password' value={form.password} placeholder="Create a strong password" onChange={handleInput}/>
                <button type="button" className="show-btn" onClick={() => setShowPassword(s => !s)} aria-label="Toggle password visibility">{showPassword ? 'Hide' : 'Show'}</button>
              </div>
              {errors.password && <div className="error">{errors.password}</div>}
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