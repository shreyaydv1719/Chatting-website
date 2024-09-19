const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const socket = require("socket.io");

require("./db/index"); //connect to DB

const Users = require("./schemas/user");
const Conversations = require("./schemas/conversation");
const Messages = require("./schemas/message");
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const io = socket(8000, {
  cors: {
    origin: "http://localhost:3001",
  },
});

let users = [];

io.on("connection", (socket) => {

  socket.on("addUser", (userId) => {
    const isUserExist = users.find((user) => user.userId === userId);
    if (!isUserExist) {
      users.push({ userId, socketId: socket.id });
      io.emit("getUser", users);
      // console.log(users);
    }
  });

  socket.on("addreciever", (userId) => {
    const isUserExist = users.find((user) => user.userId === userId);
    if (!isUserExist) {
      users.push({ userId, socketId: socket.id });
      io.emit("getUser", users);
      console.log(users);
      console.log(users.length)
    }
  });

  socket.on(
    "sendMessage",
    async ({ senderid, conversationid, message, receiverid }) => {
      const receiver = users.find((user) => user.userId === receiverid);
      const sender = users.find((user) => user.userId === senderid);
      const user = await Users.findById(senderid);
      console.log(receiver.socketId,sender.socketId)
      if (receiver) {
        io.to(receiver.socketId)
          .to(sender.socketId)
          .emit("getMessage", {
            senderid,
            conversationid,
            message,
            receiverid,
            user: { id: user._id, fullname: user.fullname, email: user.email },
          });
      }
    }
  );

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUser", users);
  });
});

app.get("/", (req, res) => {
  res.send("welcome");
});

app.post("/api/register", async (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
      res.status(400).send("Please fill in all the details!");
    } else {
      const isAlreadyExist = await Users.findOne({ email });
      if (isAlreadyExist) {
        res.status(400).send("User already exists");
      } else {
        const newuser = new Users({ fullname, email });

        bcryptjs.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            throw err;
          }

          newuser.set("password", hashedPassword);
          newuser.save();
          next();
        });
        return res.status(200).send("user registered successfully!");
      }
    }
  } catch (error) {
    res.status(400).send(error.message);
    console.error(error);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Please fill all information!");
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).send("User email not found!");
    }

    const validateuser = await bcryptjs.compare(password, user.password);
    if (!validateuser) {
      return res.status(400).send("User email or password not found!");
    }

    const payload = {
      userId: user._id,
      email: user.email,
    };
    const jwtsecretkey = "this-is-a-secret-key";
    const token = jwt.sign(payload, jwtsecretkey, { expiresIn: "6h" });

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send("internal server error");
  }
});

app.post("/api/conversation", async (req, res) => {
  try {
    const { senderid, receiverid } = req.body;

    const existingConversation = await Conversations.findOne({
      members: { $all: [senderid, receiverid] },
    });

    if (existingConversation) {
      return res
        .status(400)
        .send("Conversation already exists between these users");
    }

    const [sender, receiver] = await Promise.all([
      Users.findOne({ _id: senderid }),
      Users.findOne({ _id: receiverid }),
    ]);

    if (!sender || !receiver) {
      return res.status(400).send("Invalid sender or receiver ID");
    }

    if (receiverid === senderid) {
      return res
        .status(400)
        .send("Cannot create a conversation with the same account");
    }

    const newconversation = new Conversations({
      members: [senderid, receiverid],
    });

    await newconversation.save();

    res.status(200).send("Conversation created successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/conversation/:userid", async (req, res) => {
  try {
    const userid = req.params.userid;
    // res.send(userid)
    const conversations = await Conversations.find({
      members: {
        $elemMatch: { $eq: userid },
      },
    });
    // res.send(conversations)

    const conversationuserdata = Promise.all(
      conversations.map(async (conversation) => {
        const receiverid = conversation.members.find(
          (member) => member !== userid
        );
        const user = await Users.findById(receiverid);
        return {
          user: {
            receiverid: user._id,
            email: user.email,
            fullname: user.fullname,
          },
          conversationId: conversation._id,
        };
      })
    );

    res.status(200).json(await conversationuserdata);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const { conversationid, senderid, message, receiverid = "" } = req.body;
    if (!senderid || !message)
      return res.status(400).json("please fill all required data");
    if (!conversationid && receiverid) {
      const newconversation = new Conversations({
        members: [senderid, receiverid],
      });
      await newconversation.save();
      const newmessage = new Messages({
        conversationid: newconversation._id,
        senderid,
        message,
      });
      await newmessage.save();
      return res.status(200).json("message sent successfully!");
    } else if (!conversationid && !receiverid) {
      return res.status(400).json("please fill all required data");
    }
    const newmessage = new Messages({ conversationid, senderid, message });
    await newmessage.save();
    res.status(200).send("message sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("error in sending message!");
  }
});

app.get("/api/message/:conversationid", async (req, res) => {
  try {
    const conversationid = req.params.conversationid;
    if (conversationid === "new") return res.status(200).json([]);
    const messages = await Messages.find({ conversationid });
    const messageUserdata = await Promise.all(
      messages.map(async (message) => {
        const user = await Users.findById(message.senderid);
        return {
          user: { id: user._id, email: user.email, fullname: user.fullname },
          message: message.message,
        };
      })
    );
    res.status(200).json(messageUserdata);
  } catch (error) {
    console.error(error);
    res.status(500).send("error in geting message!");
  }
});

app.get("/api/users", async (req, res) => {
  const users = await Users.find();
  const userdata = Promise.all(
    users.map(async (user) => {
      return {
        user: { email: user.email, fullname: user.fullname },
        userId: user._id,
      };
    })
  );
  res.status(200).json(await userdata);
});

app.listen(port, () => {
  console.log("Server is listening on port " + port);
});
