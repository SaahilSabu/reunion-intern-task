const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const app = require("../index");

chai.use(chaiHttp);

describe("Authentication", () => {
  describe("POST /api/authenticate", () => {
    context("when the email and password are correct", () => {
      it("should return a 200 response and a token", (done) => {
        chai
          .request(app)
          .post("/api/authenticate")
          .send({ email: "testuser@test.com", password: "testpassword" })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body.accessToken).to.be.a("string").and.not.be.empty;
            done();
          });
      });
    });

    context("when the email is incorrect", () => {
      it("should return a 401 response", (done) => {
        chai
          .request(app)
          .post("/api/authenticate")
          .send({ email: "incorrectemail@test.com", password: "testpassword" })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(401);
            done();
          });
      });
    });

    context("when the password is incorrect", () => {
      it("should return a 401 response", (done) => {
        chai
          .request(app)
          .post("/api/authenticate")
          .send({ email: "testuser@test.com", password: "incorrectpassword" })
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(401);
            done();
          });
      });
    });
  });
});

