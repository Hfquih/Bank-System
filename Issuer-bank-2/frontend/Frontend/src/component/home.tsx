import '../styling/home.css'
import useAuth from "../globalAPI/useAuth";
import { useNavigate } from 'react-router-dom';


export default function Home(){

    const {user} = useAuth()

    const navigate = useNavigate()

    function register(){
        navigate("/register")
    }

    function login(){
        navigate("/login")
    }

    function account(){
        navigate("/account")
    }

    return(
        <div className="home-container">
            <div className="home-header">
                <h1>Minkiy</h1>

                <div className='header-link'>
                    <p>Why Us</p>
                    <p>contact</p>
                    <p>about Us</p>
                </div> 

                <div>
                    {user ?
                        <div className='user-account'>
                            <i className="fa-solid fa-circle-user icon-account" onClick={account}></i>
                        </div>
                    : <div className='header-btn'>
                        <button className='rgt-btn' onClick={register}>Register</button>
                        <button className='lgn-btn' onClick={login}>Login</button>
                    </div>}
                </div>
            </div> 
            

        </div>
    )
}