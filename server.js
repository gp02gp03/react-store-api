// server.js
const path = require("path");
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();
const fs = require("fs");

const jwt = require("jsonwebtoken");
var token = jwt.sign({ foo: "bar" }, "shhhhh");

server.use(jsonServer.bodyParser);
server.use(middlewares);

const getUsersDb = () => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "users.json"), "UTF-8")
  );
};
const isAuthenticated = ({ email, password }) => {
  return (
    getUsersDb().users.findIndex(
      user => user.email === email && user.password === password
    ) !== -1
  );
};

const isExit = ({ email }) => {
  return getUsersDb().users.findIndex(user => user.email === email) !== -1;
};

const secrets = "affsfggdgdhfuwete";
const expiresIn = "1h";
const createToken = payload => {
  return jwt.sign(payload, secrets, { expiresIn });
};

server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (isAuthenticated({ email, password })) {
    //jwt
    const user = getUsersDb().users.find(
      user => user.email === email && user.password === password
    );
    const { nickname, type } = user;
    console.log("nickname:", nickname);
    const jwtToken = createToken({ nickname, type, email, password });
    return res.status(200).json(jwtToken);
  } else {
    const status = 401;
    const message = "帳號或密碼錯誤 !";
    return res.status(status).json({ status, message });
  }
  //console.log("Login Success");
  //return res.status(200).json("Login Success!");
});

server.post("/auth/register", (req, res) => {
  const { email, password, type, nickname } = req.body;
  if (isExit(email)) {
    const status = 401;
    const message = "信箱及密碼已經存在 !";
    return res.status(status).json({ status, message });
  }
  fs.readFile(path.join(__dirname, "users.json"), (err, _data) => {
    if (err) {
      const status = 401;
      const message = err;
      return res.status(status).json({ status, message });
    }
    const data = JSON.parse(_data.toString());
    const last_item_id = data.users[data.users.length - 1].id;
    data.users.push({ id: last_item_id + 1, email, password, nickname, type });
    fs.writeFile(
      path.join(__dirname, "users.json"),
      JSON.stringify(data),
      (err, result) => {
        if (err) {
          const status = 401;
          const message = err;
          res.status(status).json({ status, message });
          return;
        }
      }
    );
    const jwToken = createToken({ nickname, type, email });
    res.status(200).json(jwToken);
  });
});

server.use("/auth/carts", (req, res, next) => {
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split("	")[0] !== "Bearer"
  ) {
    const status = 401;
    const message = "Error	in	authorization	format";
    res.status(status).json({ status, message });
    return;
  }
  try {
    const verifyTokenResult = verifyToken(
      req.headers.authorization.split("	")[1]
    );
    if (verifyTokenResult instanceof Error) {
      const status = 401;
      const message = "Access	token	not	provided";
      res.status(status).json({ status, message });

      axios.js;
      return;
    }
    next();
  } catch (err) {
    const status = 401;
    const message = "Error	token	is	revoked";
    res.status(status).json({ status, message });
  }
}); //

const verifyToken = token => {
  return jwt.verify(token, SECRET, (err, decode) =>
    decode !== undefined ? decode : err
  );
};

server.use(router);
server.listen(3003, () => {
  console.log("JSON Server is running");
});
