import { BrowserRouter , Route , Routes } from "react-router-dom";
import Home from "./component/home.tsx";
import Register from "./component/register.tsx";
import Login from "./component/login.tsx";
import Account from "./component/account.tsx";


export default function App(){
  return(
    <BrowserRouter>
      <Routes>
  
        <Route path='/' element={<Home/>}></Route>
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/account' element={<Account/>}></Route>

      </Routes> 
    </BrowserRouter>
  )
}