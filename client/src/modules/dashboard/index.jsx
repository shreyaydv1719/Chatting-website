import { useEffect, useState } from "react";
import { Avatar, Avatar2, Link, Phone, Send, Video } from "../../assets/avatar";
import { Input } from "../../components/inputs";
import axios from "axios";
import { io } from "socket.io-client"

export const Dashboard = () => {

  const [user, setuser] = useState({});
  const [conversation, setconversation] = useState([])
  const [message, setmessage] = useState([])
  const [conversationid, setconversationid] = useState("")
  const [text, settext] = useState("")
  const [users, setusers] = useState([])
  const [state, setstate] = useState(false)
  const [socket, setsocket] = useState(null)
  const [User, setUser] = useState([])

  useEffect(() => {
    setsocket(io('http://localhost:8000'));
  }, [])

  useEffect(() => {
    socket?.on('getMessage', data => {
      // console.log("data:", data);
      setmessage(prev => ({
        ...prev,
        message: [...prev.message, { user: data.user, message: data.message }]
      }));
    });
    console.log("socket change >>", message)
  }, [socket]);

  useEffect(() => {
    socket?.emit('addUser', user.id);

    socket?.on('getUser', activeusers => {
      console.log("active users:", activeusers);
      setUser(activeusers);
    });
  }, [socket, user.id]);


  useEffect(() => {
    async function fetchusers() {
      const res = await axios.get(`http://localhost:3000/api/users`)
      const resData = res.data
      setusers(resData)
    }
    fetchusers()
  }, [])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const isLoggedUser = JSON.parse(localStorage.getItem("user:details"));
        setuser(isLoggedUser)
        const res = await axios.get(`http://localhost:3000/api/conversation/${isLoggedUser.id}`);
        const resData = res.data;
        // console.log(resData)
        setconversation(resData);
        // console.log(conversation)
      } catch (error) {
        console.error("Axios error: ", error);
      }
    };
    fetchConversations();
  }, [state]);

  const createconvo = async (userId, user) => {
    try {
      setstate(true)
      const isLoggedUser = JSON.parse(localStorage.getItem("user:details"));
      const ids = {
        senderid: isLoggedUser.id,
        receiverid: userId
      };
      const res = await axios.post(`http://localhost:3000/api/conversation`, ids);
      console.log(res.data);
      setstate(false)
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const fetchmessages = async (conversationId, user) => {
    const res = await axios.get(`http://localhost:3000/api/message/${conversationId}`);
    // console.log(conversationId, user);
    setconversationid(conversationId)
    socket?.emit('addreciever', user.receiverid);
    // console.log(res.data);
    setmessage({ message: res.data, receiver: user, conversationId });
    // console.log(message)
  };

  const sendmessage = async () => {
    socket.emit('sendMessage', {
      senderid: user.id,
      conversationid: conversationid,
      message: text,
      receiverid: message?.receiver?.receiverid
    })
    const res = await axios.post(`http://localhost:3000/api/message`, {
      senderid: user.id,
      conversationid: conversationid,
      message: text,
      receiverid: message?.receiver?.receiverid
    })
    console.log(res.data);
    settext('')

  }

  return (
    <div className="w-screen flex">
      <div className="w-[25%] h-screen bg-slate-200 ">
        <div className="flex justify-center my-6 items-center">
          <Avatar />
          <div className="ml-4">
            <h3 className="text-2xl">{user.fullname}</h3>
            <p className="text-lg font-light">{user.email}</p>
          </div>
        </div>
        <hr />
        <div className="mx-10">
          <div className="flex justify-center pl-10 font-semibold text-sky-500 text-xl">
            Messages
          </div>
          <div>
            {conversation.length > 0 ?
              conversation.map(({ conversationId, user }) => {
                return (
                  <div className="flex w-[300px] mt-7 pt-2 pl-7 border  rounded-full shadow-xl border-zinc-100 pb-[12px] cursor-pointer items-center" onClick={() => { fetchmessages(conversationId, user) }}>
                    <div className="border p-1 border-black rounded-full">
                      {<Avatar2 />}
                    </div>
                    <div className="ml-2">
                      <h3 className="text-lg">{user?.fullname}</h3>
                      <p className="text-sm font-light text-gray-600">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                );
              }) : <div className="text-center text-lg font-semibold mt-24"> No conversation</div>
            }
          </div>
        </div>
      </div>

      <div className="w-[50%] h-screen bg-white flex flex-col items-center">
        <div className="bg-slate-200 w-[75%] h-[120px] shadow-sm rounded-full my-4 flex items-center px-4">
          <div className="flex items-center justify-between w-full">

            {message.receiver?.fullname !== undefined ? (
              <div className="flex justify-center cursor-pointer">
                <Avatar />
                <div className="ml-3">
                  <h3 className="text-lg">{message.receiver?.fullname}</h3>
                  <p className="text-sm font-light mt-[-7px] text-gray-600">{message.receiver?.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center cursor-pointer">
                <Avatar />
                <div className="ml-3">
                  <h3 className="text-lg">Contact</h3>
                  <p className="text-sm font-light mt-[-7px] text-gray-600">E-mail</p>
                </div>
              </div>
            )}
            <div className="mr-6 flex cursor-pointer space-x-4">
              <Phone />
              <Video />
            </div>
          </div>
        </div>
        <div className="w-full max-h-[90%] border border-b overflow-auto ">
          <div className="p-12 h-[1000px]">
            {message?.message?.length > 0 ? (
              message.message.map(({ message, user: { id } = {} }) => {
                if (id === user?.id) {
                  return (
                    <div className="p-4 min-w-[50px ] text-white max-w-[45%] bg-sky-500 mb-4 rounded-b-2xl rounded-tl-2xl mt-4 ml-auto">
                      {message}
                    </div>
                  );
                } else {
                  return (
                    <div className="p-4 max-w-[45%] bg-slate-200 mb-4 rounded-b-2xl rounded-tr-2xl">
                      {message}
                    </div>
                  );
                }
              })
            ) : (
              <div className="text-center text-lg font-semibold mt-24">No messages</div>
            )}
          </div>
        </div>


        <div className="p-4 w-[80%] flex items-center justify-between ">
          <Input
            placeholder="Type a message.."
            inputClassname="w-full border rounded-full outline-none  shadow-lg"
            className="w-full"
            value={text}
            onChange={(e) => {
              settext(e.target.value)
            }}
          />
          <div className="p-2 ml-4 mb-4 w-12 rounded-3xl bg-sky-400 mt-6 cursor-pointer border">
            <Link />
          </div>
          <div className={`p-2 mb-4 ml-2 w-12 rounded-3xl bg-sky-400 mt-6 cursor-pointer ${!text && 'pointer-events-none'} border`} onClick={sendmessage}>
            <Send />
          </div>

        </div>
      </div>

      <div className="w-[25%] h-screen">
        <div className="flex justify-center pl-10 mt-8  font-semibold text-sky-700  pb-4 border-b text-xl">
          Peoples
        </div>
        {users.length > 0 ?
          users.map(({ userId, user }) => {
            return (
              <div className="flex mt-7 pt-2 pl-7 border  rounded-full shadow-xl border-zinc-100 pb-[12px] cursor-pointer items-center" onClick={() => { createconvo(userId, user) }}>
                <div className="border p-1 border-black rounded-full">
                  {<Avatar2 />}
                </div>
                <div className="ml-2">
                  <h3 className="text-lg">{user?.fullname}</h3>
                  <p className="text-sm font-light text-gray-600">
                    {user?.email}
                  </p>
                </div>
              </div>
            );
          }) : <div className="text-center text-lg font-semibold mt-24"> No users</div>
        }
      </div>
    </div>
  );
};
