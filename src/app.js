const express = require("express");
const session = require("express-session");
const expressHandlebars = require("express-handlebars");
const socket = require("socket.io");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const initializePassport = require("./config/passport.config.js");
const configObject = require("./config/config.js");
const program = require("./utils/commander.js");
const mongoose = require("mongoose");
const { puerto, session_secret, mongo_url } = configObject;
require("./database.js");

// Conexión a MongoDB con Mongoose
mongoose
  .connect(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Conectado a MongoDB");
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err);
  });

// Crear una aplicación Express
const app = express();

// Middleware
app.use(express.static("./src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de express-session con Mongoose
const sessionModel = require("express-session").Store;
app.use(
  session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    store: new sessionModel({
      mongooseConnection: mongoose.connection,
      collection: "sessions", // Nombre de la colección de sesiones en MongoDB
      ttl: 1 * 24 * 60 * 60, // Tiempo de vida de la sesión en segundos (1 día)
    }),
  })
);

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

// Configuración de handlebars
const hbs = expressHandlebars.create({
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
