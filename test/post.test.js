const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const app = require("../index");
const Post = require("../models/Post");
chai.use(chaiHttp);

describe("Post API", () => {
  let token;
  let postId;

  it("should return acessToken", (done) => {
    chai
      .request(app)
      .post("/api/authenticate")
      .send({ email: "testuser@test.com", password: "testpassword" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.accessToken).to.exist;
        token = res.body.accessToken;
        done();
      });
  });

  describe("POST /api/posts", () => {
    it("should create a new post", (done) => {
      const newPost = {
        title: "Test Post",
        desc: "This is a test post.",
      };

      chai
        .request(app)
        .post("/api/posts")
        .set("token", `Bearer ${token}`)
        .send(newPost)
        .end((err, res) => {
          //   console.log(res);
          expect(res.status).to.equal(200);
          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.desc).to.equal(newPost.desc);
          postId = res.body._id;
          done();
        });
    });
    it("should return an error and not create a new post when title is missing", (done) => {
      // Check in database for the number of posts for the test user
      Post.countDocuments({})
        .then((countBefore) => {
          // Send a POST request with Title field missing
          const newPost = {
            desc: "This is a test post.",
          };

          chai
            .request(app)
            .post("/api/posts")
            .set("token", `Bearer ${token}`)
            .send(newPost)
            .end((err, res) => {
              // Check the response status and fields
              expect(res.status).to.equal(400);
              expect(res.body.message).to.equal("Title is required");

              // Check in database if no new post is created for the user
              Post.countDocuments({})
                .then((countAfter) => {
                  expect(countAfter).to.equal(countBefore);
                  done();
                })
                .catch((err) => done(err));
            });
        })
        .catch((err) => done(err));
    });

    it("should get a post by ID and return its likes and comments", (done) => {
        chai
          .request(app)
          .get(`/api/posts/${postId}`)
          .set("token", `Bearer ${token}`)
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.body.likes).to.be.a("number").and.to.not.be.NaN;
            expect(res.body.comments).to.be.an("array");
      
            // Check if each comment in the array is a string
            res.body.comments.forEach((comment) => {
              expect(comment).to.be.a("string");
            });
      
            done();
          });
      });
      

    it("should like a post", (done) => {
      chai
        .request(app)
        .put(`/api/like/${postId}`)
        .set("token", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.equal("The post has been liked");
          done();
        });
    });
    it("should not be allowed to like again", (done) => {
      chai
        .request(app)
        .put(`/api/like/${postId}`)
        .set("token", `Bearer ${token}`)
        .end((err, res2) => {
          expect(res2).to.have.status(200);
          expect(res2.body).to.equal("The post has been liked already");
          done();
        });
    });

    it("should unlike a post", (done) => {
      chai
        .request(app)
        .put(`/api/unlike/${postId}`)
        .set("token", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.equal("The post has been disliked");
          done();
        });
    });
    it("should not be allowed to unlike a post again", (done) => {
      chai
        .request(app)
        .put(`/api/unlike/${postId}`)
        .set("token", `Bearer ${token}`)
        .end((err, res2) => {
          expect(res2).to.have.status(200);
          expect(res2.body).to.equal("The post has been disliked already");
          done();
        });
    });

    it("should add a comment to the post", (done) => {
      chai
        .request(app)
        .put(`/api/comment/${postId}`)
        .set("token", `Bearer ${token}`)
        .send({ comment: "This is a comment" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("commentID");
          done();
        });
    });

    it("should return an error when invalid post id is provided", (done) => {
      chai
        .request(app)
        .put("/api/comment/123")
        .set("token", `Bearer ${token}`)
        .send({ comment: "This is a comment" })
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    });

    it("should return an error when no comment is provided", (done) => {
      chai
        .request(app)
        .put(`/api/comment/${postId}`)
        .set("token", `Bearer ${token}`)
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Comment is required!");
          done();
        });
    });

    it("should get all posts by user and check total posts in db", (done) => {
      chai
        .request(app)
        .get(`/api/all_posts`)
        .set("token", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(res.body[0]).to.have.property("_id");
          expect(res.body[0]).to.have.property("title");
          expect(res.body[0]).to.have.property("desc");
          expect(res.body[0]).to.have.property("createdAt");
          expect(res.body[0]).to.have.property("likes");
          expect(res.body[0]).to.have.property("comments").to.be.an("array");
          done();
        });
    });

    it("should delete a post by ID", (done) => {
      Post.countDocuments({})
        .then((countBefore) => {
          chai
            .request(app)
            .delete(`/api/posts/${postId}`)
            .set("token", `Bearer ${token}`)
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.equal("the post has been deleted");
              Post.countDocuments({})
                .then((countAfter) => {
                  expect(countAfter + 1).to.equal(countBefore);
                  done();
                })
                .catch((err) => done(err));
            });
        })
        .catch((err) => done(err));
    });
  });
});
