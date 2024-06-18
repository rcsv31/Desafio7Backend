const passport = require("passport");
const UserDTO = require("../dtos/user.dto");
const userRepository = require("../repositories/user.repository");

exports.register = (req, res, next) => {
  passport.authenticate("register", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/register");
    }
    res.redirect("/login");
  })(req, res, next);
};

exports.login = (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    res.redirect("/products");
  })(req, res, next);
};

exports.githubCallback = (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    res.redirect("/products");
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
};

exports.getCurrentUser = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autorizado" });
  }
  const userDTO = new UserDTO(req.user);
  res.json(userDTO);
};
