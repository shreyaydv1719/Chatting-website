import Register from "./modules/form/register";
import Login from "./modules/form/login";
import "./App.css";
import { Dashboard } from "./modules/dashboard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <div className="bg-[#d7e3ff] h-screen flex justify-center items-center">
      <Router>
        <Routes>
          {/* <Route path="/user/signup" element={<Form  />} /> */}
          <Route path="/user/register" element={<Register />} />
          <Route path="/user/login" element={<Login />} />
          <Route
            path="/user/dashboard"
            element={
              <Protectedroutes auth={true}>
                <Dashboard />
              </Protectedroutes>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

const Protectedroutes = ({ children, auth }) => {
  const isloggedin = localStorage.getItem("user: token") !== null || true;

  if (!isloggedin && auth) {
    return <Navigate to={"/user/register"} />;
  }

  return children;
};

export default App;
