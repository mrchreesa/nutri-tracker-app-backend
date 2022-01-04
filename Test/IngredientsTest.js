let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server.js");

//Assertion Style
chai.should();

chai.use(chaiHttp);

describe("Ingredients API", () => {
  //Test All Ingredient from DB - GET Route
  describe("GET /api/ingredients", () => {
    it("It should get all ingredient from DB", (done) => {
      chai
        .request(server)
        .get("/api/ingredients")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("array");
          done();
        });
    });
  });
  //Test Single Ingredient get by ID - GET Route
  describe("GET /api/ingredients/:foodId", () => {
    it("It should get a single ingredient from Spoonacular API", (done) => {
      const foodId = 10414003;
      chai
        .request(server)
        .get(`/api/ingredients/${foodId}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("id");
          response.body.should.have.property("name");
          response.body.should.have.property("image");
          response.body.should.have.property("id").eq(foodId);

          done();
        });
    });
  });

  //Test Ingredient add to DB - POST Route
  describe("POST /api/ingredients/:foodId", () => {
    it("It should add a single ingredient to DB", (done) => {
      const foodId = 10414003;
      chai
        .request(server)
        .post(`/api/ingredients/${foodId}`)
        .end((err, response) => {
          response.should.have.status(201);
          response.body.should.be.a("object");
          response.body.should.have.property("foodId");
          response.body.should.have.property("_id");
          response.body.should.have.property("imageName");
          response.body.should.have.property("name");
          response.body.should.have.property("calories");
          response.body.should.have.property("protein");
          response.body.should.have.property("date");
          response.body.should.have.property("foodId").eq(foodId);

          done();
        });
    });
  });
  describe("GET /api/ingredients/:foodId", () => {
    it("It should NOT add a single ingredient to DB", (done) => {
      chai
        .request(server)
        .post(`/api/ingredients/`)
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });
  //Test Delete Ingredient by ID - Delete Route
  describe("DELETE /api/ingredients/:_id", () => {
    it("It should DELETE a single ingredient from DB", (done) => {
      const _id = "61ba4d7a643a6ac1a1c37cec";
      chai
        .request(server)
        .delete(`/api/ingredients/${_id}`)
        .end((err, response) => {
          response.should.have.status(200);

          done();
        });
    });
  });
});
