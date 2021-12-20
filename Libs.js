const authOnly = (req, res, next) => {
  if (req.cookies.user != "undefined") {
    next();
  } else {
    res.json({ msg: "Not Authed" });
  }
};

module.exports = {
  authOnly,
};
