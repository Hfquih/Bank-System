import useAuth from "../globalAPI/useAuth";
import { useNavigate } from "react-router-dom";
import Admin from "../account/admin";
import User from "../account/user";


export default function Account(){
    
    const {user} = useAuth()

    const navigate = useNavigate()

    function account(){
        navigate('/account')
    }

    return (
        <div>
            <header className="home-header">
                <h1>Minkiy</h1>

                <div className="home-header-link">
                    <p>About Us</p>
                    <p>Contact Us</p>
                    <p>Why Us</p>
                </div>

                <div className="home-header-auth-icon">
                    <i className="fa-solid fa-circle-user icon-home" onClick={account}></i>
                </div>
            </header>

            {user?.role==='admin' && <Admin/>}
            {user?.role==='user' && <User/>}
        </div>
    )
}