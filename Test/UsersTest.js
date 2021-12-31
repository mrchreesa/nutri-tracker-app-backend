let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server.js");
const Chance = require("chance");

const chance = new Chance();

let username = chance.name();
let email = chance.email();
let password = chance.string({ length: 8 });
let notUsername = chance.falsy();
let notEmail = chance.falsy();
let notPassword = 0;
// Assertion Style
chai.should();

chai.use(chaiHttp);

describe("Users API", () => {
  // Test Register User to DB - POST Route
  //   describe("POST /api/users", () => {
  //     it("It should create a user to DB", (done) => {
  //       const userCredentials = {
  //         username,
  //         email,
  //         password,
  //       };
  //       chai
  //         .request(server)
  //         .post("/api/users/")
  //         .send(userCredentials)
  //         .end((err, response) => {
  //           response.should.have.status(200);
  //           response.body.should.be.a("object");
  //           response.body.should.have.property("username");
  //           response.body.should.have.property("email");

  //           done();
  //         });
  //     });
  //   });
  describe("POST /api/users", () => {
    it("It should NOT create a user to DB", (done) => {
      const falsyUserCredentials = {
        username: notUsername,
        email: notEmail,
        password: notPassword,
      };
      chai
        .request(server)
        .post("/api/users/")
        .send(falsyUserCredentials)
        .end((err, response) => {
          if (err) {
            console.log(err);
          } else {
            response.should.have.status(500);

            response.text.should.be.eq("Invalid Credentials");
          }

          done();
        });
    });
  });
  // Test Create Session/Log in - POST Route
  describe("POST /api/users/session", () => {
    it("It should create a session/log in user", (done) => {
      const userCredentials = {
        email: "kris123@mail.com",
        password: "123123",
      };
      chai
        .request(server)
        .post("/api/users/session")
        .send(userCredentials)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("username");
          response.body.should.have.property("email");

          done();
        });
    });
  });
  describe("POST /api/users/session", () => {
    it("It should NOT create a session/log in user", (done) => {
      const userCredentials = {
        notEmail,
        notPassword,
      };
      chai
        .request(server)
        .post("/api/users/session")
        .send(userCredentials)
        .end((err, response) => {
          response.should.have.status(401);

          response.text.should.be.eq("Invalid User");

          done();
        });
    });
  });

  // Test Create Session/Log in - POST Route
  describe("DELETE /api/users/session", () => {
    it("It should DELETE a session/log in user", (done) => {
      const userCredentials = {
        email: "kris123@mail.com",
        password: "123123",
      };
      chai
        .request(server)
        .delete("/api/users/session")
        .send(userCredentials)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("message");

          done();
        });
    });
  });
  // Test Add Ingredient To User Profile - POST Route
  describe("POST /api/users/:userId/ingredients/:ingredientId", () => {
    it("It should ADD ingredient to user profile", (done) => {
      const userId = "61c072a4ec338f3ed4edf154";
      const ingredientId = 11990;
      chai
        .request(server)
        .post(`/api/users/${userId}/ingredients/${ingredientId}`)
        .end((err, response) => {
          if (err) {
            console.error(err);
          } else {
            response.should.have.status(201);
            response.body.should.be.an("object");
            response.text.should.be.eq("User updated successfully");
          }
          done();
        });
    });
  });
  // Test Get User from DB - GET Route
  describe("GET /api/users/:userId", () => {
    it("It should GET a user from DB", (done) => {
      const userId = "61c072a4ec338f3ed4edf154";
      chai
        .request(server)
        .get(`/api/users/${userId}`)

        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
  });
});
