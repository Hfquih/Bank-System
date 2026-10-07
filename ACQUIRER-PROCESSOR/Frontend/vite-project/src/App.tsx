import { BrowserRouter , Route , Routes } from "react-router-dom";
import Sessions from "./component/session";


export default function App(){
  return(
    <BrowserRouter>
      <Routes>
  
        <Route path='/:sessionId' element={<Sessions/>}></Route>

      </Routes> 
    </BrowserRouter>
  )
}