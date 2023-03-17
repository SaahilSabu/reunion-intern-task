const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const app = require("../index");

chai.use(chaiHttp);

describe("Authentication", () => {
  describe("POST /api/authenticate", () => {
    it("should return a 200 response and a token if the email and password are correct", (done) => {
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ email: "testuser@test.com", password: "testpassword" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.accessToken).to.exist;
          done();
        });
    });

    it("should return a 401 response if the email is incorrect", (done) => {
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ email: "incorrectemail@test.com", password: "testpassword" })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should return a 401 response if the password is incorrect", (done) => {
      chai
        .request(app)
        .post("/api/authenticate")
        .send({ email: "testuser@test.com", password: "incorrectpassword" })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});
