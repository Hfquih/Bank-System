import useAuth from "../globalAPI/useAuth.tsx";
import '../styles/home.css'
import { useNavigate } from "react-router-dom";

export default function Home() {

    const {user} = useAuth()

    const navigate = useNavigate()

    function register () {
        navigate('/register')
    }

    function login () {
        navigate('/login')
    }

    function account(){
        navigate('/account')
    }

    console.log(user)

    return(
        <div>
            <header className="home-header">
                <h1>Minkiy</h1>

                <div className="home-header-link">
                    <p>About Us</p>
                    <p>Contact Us</p>
                    <p>Why Us</p>
                </div>

                {user ? <div className="home-header-auth-icon">
                    <i className="fa-solid fa-circle-user icon-home" onClick={account}></i>
                </div> : <div className="home-header-auth">
                    <button className="rgt-btn" onClick={register}>Register</button>
                    <button className="lgn-btn" onClick={login}>Login</button>
                </div>}
            </header>
        </div>
    )
}