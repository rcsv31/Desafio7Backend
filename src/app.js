const express = require("express");
const session = require("express-session");
const expresshandlebars = require("express-handlebars");
const socket = require("socket.io");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const initializePassport = require("./config/passport.config.js");
const configObject = require("./config/config.js");
const MongoStore = require("connect-mongo");
const program = require("./utils/commander.js");

const { puerto, session_secret, mongo_url } = configObject;
require("./database.js");

// Crear una aplicación Express
const app = express();

// Middleware
app.use(express.static("./src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongo_url,
      ttl: 1 * 24 * 60 * 60,
    }),
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

// Configuración de handlebars
const hbs = expresshandlebars.create({
  defaultLayout: "main",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Rutas
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");
const sessionRouter = require("./routes/session.router.js");
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/", viewsRouter);

// Iniciar el servidor y escuchar en el puerto
const server = app.listen(puerto, () => {
  console.log(`Esta aplicación funciona en el puerto ${puerto}`);
});

// Configurar socket.io
const io = socket(server);

// Manejo de eventos de chat
io.on("connection", (socket) => {
  console.log("Nuevo usuario conectado");

  socket.on("message", async (data) => {
    await MessageModel.create(data);
    const messages = await MessageModel.find();
    io.sockets.emit("message", messages);
  });
});

// Manejo de eventos de productos, carrito y otros eventos
//require("./sockets/products.socket.js")(io);
//require("./sockets/cart.socket.js")(io);
