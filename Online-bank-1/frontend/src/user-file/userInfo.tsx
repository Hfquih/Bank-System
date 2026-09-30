
import React from "react";
import useAuth from "../globalAPI/useAuth";
import '../styles/userInfo.css';
import ApiClient from "../globalAPI/apiClient";
import globalErr from "../globalAPI/globalErrors";

export interface UpdateUser {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string; 
  confirmPassword : string
}

interface UpdateUserErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string
}

export default function UserInfo() {
  const { user } = useAuth();

  const userProfile = user ?? {
    firstName: "Unknown",
    lastName: "User",
    email: "no-email@example.com",
    phone: "Not provided",
    role: "user",
    status: "active",
    createdAt: "",
    updatedAt: "",
  };

  const [userInfo , setUserInfo] = React.useState<UpdateUser>({
    firstName: userProfile?.firstName,
    lastName: userProfile?.lastName,
    phone:userProfile?.phone,
    email:userProfile?.email,
    password:'',
    confirmPassword:''
  })

  const [errors , setErrors] = React.useState<UpdateUserErrors>({})

  const [alert , setAlert] = React.useState({msg:'' , success:false , error:false})

  const client = ApiClient()

  const userData : {
    firstName:string,
    lastName:string,
    phone:string,
    email:string,
    password?:string,
    confirmPassword?:string
  }= {
    firstName:userInfo.firstName,
    lastName:userInfo.lastName,
    phone:userInfo.phone,
    email:userInfo.email  
  }

  if(userInfo.password){
    userData.password = userInfo.password,
    userData.confirmPassword = userInfo.confirmPassword
  }
  
  const isVerified = Boolean((user as { isVerified?: boolean } | null)?.isVerified);

  const formatDate = (value?: string) => {
    if (!value) return "Not available";

    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>){
    const {name , value} = e.currentTarget
    setUserInfo(prev=>{
        return{
            ...prev,
            [name] : value
        }
    })

    setErrors(prev=>{
        return{
            ...prev,
            [name] : ''
        }
    })
  }

  async function handleSubmit(){
    if(!checkInputs()) return

    try{
        const {data} = await client.patch("/auth/update-info" , {...userData})

        setAlert({
            msg:data.msg , error:false , success:true
        })

        setTimeout(()=>{
            setAlert({
                msg:'' , error:false , success:false
            })
        },3000)
    }catch(error){
        globalErr(error , setErrors , setErrors)
    }
  }

  type Update = typeof userInfo
  function checkInputs () {
    const checkErr : Partial<Record<keyof Update, string>> = {}

    Object.entries(userInfo).forEach(([field , value]) => {
        if(field === 'password' || field === 'confirmPassword'){
            return
        }

        if(!value.trim()){
            checkErr[field as keyof Update] = `${capitalize(field)} is required.`
        }
    })

    setErrors(checkErr)
    return Object.keys(checkErr).length === 0;
  }

  const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);

  return (
    <div className="user-page">
      <div className="user-card">
        <aside className="user-sidebar">
          <div className="user-avatar-wrap">
            <div className="user-avatar">
              {userProfile.firstName?.charAt(0)?.toUpperCase() || "U"}
              {userProfile.lastName?.charAt(0)?.toUpperCase() || "S"}
            </div>
          </div>

          <div className="user-identity">
            <p className="user-role-label">Account</p>
            <h2>
              {userProfile.firstName || "Unknown"} {userProfile.lastName || "User"}
            </h2>
            <span className={`status-badge ${userProfile.status || "active"}`}>
              {userProfile.status || "active"}
            </span>
          </div>

          <div className="user-summary">
            <div>
              <span>Verification</span>
              <strong>{isVerified ? "Verified" : "Pending"}</strong>
            </div>
            <div>
              <span>Member since</span>
              <strong>{formatDate(userProfile.createdAt)}</strong>
            </div>
            <div>
              <span>Last update</span>
              <strong>{formatDate(userProfile.updatedAt)}</strong>
            </div>
          </div>
        </aside>

        <main className="user-content">
          <div className="section-header">
            <div>
              <p className="section-kicker">Profile</p>
            </div>
            <button type="button" className="primary-button" onClick={handleSubmit}>
              Save changes
            </button>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="firstName">First name</label>
              <input className={errors.firstName ? 'border-error' : alert.success ? 'border-success' : ''} id="firstName" type="text" value={userInfo.firstName || ""} name="firstName" onChange={handleInput} />
              {errors.firstName && <small className="text-error">{errors.firstName}</small>}
            </div>

            <div className="field-group">
              <label htmlFor="lastName">Last name</label>
              <input className={errors.lastName ? 'border-error' : alert.success ? 'border-success' : ''} id="lastName" type="text" value={userInfo.lastName || ""} name='lastName' onChange={handleInput} />
              {errors.lastName && <small className="text-error">{errors.lastName}</small>}
            </div>

            <div className="field-group full-width">
              <label htmlFor="email">Email address</label>
              <input className={errors.email ? 'border-error' : alert.success ? 'border-success' : ''} id="email" type="email" value={userInfo.email || ""} name='email' onChange={handleInput} />
              {errors.email && <small className="text-error">{errors.email}</small>}
            </div>

            <div className="field-group full-width">
              <label htmlFor="phone">Phone number</label>
              <input className={errors.phone ? 'border-error' : alert.success ? 'border-success' : ''} id="phone" type="tel" value={userInfo.phone || ""} name='phone' onChange={handleInput} />
              {errors.phone && <small className="text-error">{errors.phone}</small>}
            </div>

            <div className="field-group">
              <label htmlFor="role">Role</label>
              <input className={alert.success ? 'border-success' : ''} id="role" type="text" value={userProfile.role || "user"} readOnly />
            </div>

            <div className="field-group">
              <label htmlFor="status">Account status</label>
              <input className={alert.success ? 'border-success' : ''} id="status" type="text" value={userProfile.status || "active"} readOnly />
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input className={errors.password ? 'border-error' : alert.success ? 'border-success' : ''} id="password" type="password" value={userInfo.password} name="password" onChange={handleInput}/>
              {errors.password && <small className="text-error">{errors.password}</small>}
            </div>

            <div className="field-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input className={errors.confirmPassword ? 'border-error' : alert.success ? 'border-success' : ''} id="confirmPassword" type="text" value={userInfo.confirmPassword}  name="confirmPassword" onChange={handleInput}/>
              {errors.confirmPassword && <small className="text-error">{errors.confirmPassword}</small>}
            </div>

          </div>

          {alert.msg && <p className={`alert ${alert.success ? 'text-success' : alert.error ? 'text-error' : ''}`}>{alert.msg}</p>}

        </main>
      </div>
    </div>
  );
}

