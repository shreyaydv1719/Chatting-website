import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Login() {
  // const [fullname, setfullname] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-white w-[550px] h-[650px] shadow-lg rounded-lg flex flex-col justify-center items-center">
        <div className="text-3xl font-bold">
          {"Welcome!"}
        </div>
        <div className="text-xl font-light mb-7">
          {"Log in to get started"}
        </div>
        <form
          className="flex flex-col items-center w-full"
        >

          {/* <div className={`w-2/3`}>
            <label
              for="name"
              className="block mb-2 text-sm font-medium text-gray-800">
              {"Full name"}
            </label>
            <input id={"name"} type="text" className={`bg-gray-50 border border-gray-300 text-gray-900
              text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 mb-6 w-full`}
              placeholder="Enter your name" required={true} value={fullname} onChange={(e) => {
                setfullname(e.target.value)
              }}>
            </input>
          </div> */}

          <div className={`w-2/3`}>
            <label
              for="email"
              className="block mb-2 text-sm font-medium text-gray-800">
              {"Email"}
            </label>
            <input id={"email"} type="text" className={`bg-gray-50 border border-gray-300 text-gray-900
              text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 mb-6 w-full`}
              placeholder="Enter your email" required={true} value={email} onChange={(e) => {
                setemail(e.target.value)
              }}>
            </input>
          </div>

          <div className={`w-2/3`}>
            <label
              for="password"
              className="block mb-2 text-sm font-medium text-gray-800">
              {"Password"}
            </label>
            <input id={"password"} type="password" className={`bg-gray-50 border border-gray-300 text-gray-900
              text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 mb-6 w-full`}
              placeholder="Enter your password" required={true} value={password} onChange={(e) => {
                setpassword(e.target.value)
              }}>
            </input>
          </div>

          <button
            type="button"
            className="text-white cursor-pointer bg-blue-600 mr-2 hover:bg-blue-800 focus:ring-4 
             focus:outline-none focus:ring-blue-300 text-base rounded-lg font-semibold 
             px-5 py-2.5 text-center mt-3 w-[200px] mb-4"
            onClick={async () => {
              try {
                const res = await axios.post('http://localhost:3000/api/login', {

                  email: email,
                  password: password
                });
                const data = res.data;
                console.log("data:", data);
                window.alert("user logged in successfully")
                if (data.token) {
                  localStorage.setItem("user:token", data.token)
                  localStorage.setItem("user:details",JSON.stringify(data.user))
                  navigate('/user/dashboard');
                }
                
              } catch (error) {
                console.error("Axios error:", error);
                window.alert("error logging in")

              }
            }}
          >
            Sign up
          </button>

        </form>
        <div>
          {"Don't have an account? "}
          <span
            className="cursor-pointer text-sky-500 font-[500] hover:underline"
            onClick={() => {
              navigate(`/user/register`);
            }}
          >
            Create one
          </span>
        </div>
      </div>
    </>
  );
};

export default Login;
