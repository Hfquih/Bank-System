import React from "react";
import useAuth from "../globalAPI/useAuth";
import "../styling/profil.css";
import ApiClient from "../globalAPI/apiClient";
import globalErr from "../globalAPI/globalErr";


type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string,
  confirmPassword:string
};

type FormError = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string,
  confirmPassword?:string
};

export default function Profil(){
    const {user} = useAuth()

    const [form, setForm] = React.useState<Form>({
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        password: "",
        confirmPassword:""
    })

    const [isEditing, setIsEditing] = React.useState(false)
    const [password , setPassword] = React.useState(false)
    const [alert, setAlert] = React.useState({msg:"" , success:false , error:false})
    const [errors , setErrors] = React.useState<FormError>({})

    const client = ApiClient()


    const dataForm : {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        password?: string,
        confirmPassword?:string
    } = {
        firstName : form.firstName,
        lastName : form.lastName,
        email : form.email,
        phone : form.phone
    }

    if(form.password && form.confirmPassword){
        dataForm.password = form.password,
        dataForm.confirmPassword = form.confirmPassword
    }

    React.useEffect(() => {
        if (user) {
            setForm({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                password:"",
                confirmPassword:""
            })
        }
    }, [user])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name , value} = event.currentTarget

        setForm(prev=>{
            return{
                ...prev,
                [name] : value
            }
        })

        setErrors(prev=>{
            return{
                ...prev,
                [name] : ""
            }
        })
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if(!checkInput()) return 

        try{
            const {data} = await client.patch("/auth/update-info" , {...dataForm})

            setIsEditing(false) 

            setAlert({
                msg:data.msg , success:true , error:false
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
        
    }

    type Update = typeof form;

    function checkInput(){
        const checkErr : Partial<Record<keyof Update, string>> = {}

        Object.entries(form).forEach(([field , value])=>{
            if(field==="password" || field==="confirmPassword"){
                return
            }

            if(!value.trim()){
                checkErr[field as keyof Update] = `${capitalize(field)} is required`
            }
        })

        setErrors(checkErr)
        return Object.keys(checkErr).length === 0;
    }

    const capitalize = (str:string) => str[0].toUpperCase() + str.slice(1);

    const handleCancel = () => {
        if (user) {
            setForm({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                password:"",
                confirmPassword:""
            })
        }
        setIsEditing(false)
        setPassword(false)
    }

    const handlePassowrd = () => {
        setPassword(true)
        setIsEditing(true)
    }

    const cancelChange = () => {
        setPassword(false)
        setIsEditing(false)
    }

    if (!user) {
        return <main className="profile-management-container"><div className="profile-empty-state">Your profile information is unavailable.</div></main>
    }

    return(
        <main className="profile-management-container">
            <header className="profile-page-header">
                <div>
                    <p className="profile-eyebrow">ACCOUNT SERVICES / PROFILE</p>
                    <h1>Personal information</h1>
                    <p className="profile-intro">Review and manage the information connected to your bank account.</p>
                </div>
                <div className="profile-header-avatar">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div>
            </header>

            <section className="profile-summary-card">
                <div className="profile-summary-avatar">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</div>
                <div className="profile-summary-copy"><h2>{user.firstName} {user.lastName}</h2><p>{user.email}</p></div>
                <div className="profile-account-status"><span className="profile-status-dot" /> <span><b>Active account</b><small>Member since {new Date(user.createdAt).toLocaleDateString("en-US", {month: "short", year: "numeric"})}</small></span></div>
            </section>

            <div className="profile-content-grid">
                <section className="profile-panel profile-details-panel">
                    <div className="profile-panel-heading"><div><p className="profile-eyebrow">YOUR DETAILS</p><h2>Basic information</h2></div>{!isEditing && <button className="profile-edit-button" type="button" onClick={() => setIsEditing(true)}>✎ Edit details</button>}</div>
                    <form onSubmit={handleSubmit}>
                        <div className="profile-fields-grid">
                            <label>First name
                                <input name="firstName" type="text" value={form.firstName} onChange={handleChange} disabled={!isEditing} />
                                {errors.firstName && <p className="text-error">{errors.firstName}</p>}
                            </label>
                            <label>Last name
                                <input name="lastName" type="text" value={form.lastName} onChange={handleChange} disabled={!isEditing} />
                                {errors.lastName && <p className="text-error">{errors.lastName}</p>}
                            </label>
                            <label>Email address
                                <input name="email" type="email" value={form.email} onChange={handleChange} disabled={!isEditing} />
                                {errors.email && <p className="text-error">{errors.email}</p>}
                            </label>
                            <label>Phone number
                                <input name="phone" type="tel" value={form.phone} onChange={handleChange} disabled={!isEditing} />
                                {errors.phone && <p className="text-error">{errors.phone}</p>}
                            </label>
                        </div>
                        
                        {password && <div className="profile-fields-grid">
                            <label>Password
                                <input name="password" type="password"  onChange={handleChange} disabled={!isEditing} />
                                {errors.password && <p className="text-error">{errors.password}</p>}
                            </label>
                            <label>Confirm password
                                <input name="confirmPassword" type="password" onChange={handleChange} disabled={!isEditing} />
                                {errors.confirmPassword && <p className="text-error">{errors.confirmPassword}</p>}
                            </label>
                        </div>}

                        {isEditing && <div className="profile-form-actions"><button className="profile-cancel-button" type="button" onClick={handleCancel}>Cancel</button><button className="profile-save-button" type="submit">Save changes <span>→</span></button></div>}

                        {alert.msg && <p className={`alert ${alert.success ? "text-success" : alert.error ? "text-error" : ""}`} role="status">{alert.msg}</p>}
                    </form>
                </section>

                <aside className="profile-side-column">
                    <section className="profile-panel profile-security-panel">
                        <div className="profile-panel-icon">⌁</div>
                        <p className="profile-eyebrow">ACCOUNT SECURITY</p>
                        <h2>Password & security</h2>
                        <p>Your password is protected and never shown here.</p>
                        {password ? <button type="button" className="profile-outline-button" onClick={cancelChange}>Cancel change<span>→</span></button> :
                        <button type="button" className="profile-outline-button" onClick={handlePassowrd}>Change password <span>→</span></button>}
                    </section>
                    <section className="profile-panel profile-meta-panel">
                        <p className="profile-eyebrow">ACCOUNT INFORMATION</p>
                        <div className="profile-meta-row">
                            <span>Account ID</span>
                            <b>#{String(user.id).padStart(5, "0")}</b>
                        </div>
                        <div className="profile-meta-row">
                            <span>Account type</span>
                            <b>Personal</b>
                        </div>
                        <div className="profile-meta-row">
                            <span>Role</span>
                            <b className="profile-role">{user.role}</b>
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    )
}