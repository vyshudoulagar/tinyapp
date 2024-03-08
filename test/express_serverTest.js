const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require('../express_server');
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
    it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
        const agent = chai.request.agent("http://localhost:8080");
        // Step 1: Login with valid credentials
        return agent
            .post("/login")
            .send({ email: "user2@example.com", password: "dishwasher-funk" })
            .then((loginRes) => {
                expect(loginRes).to.have.status(200);
                //Step 2: Make a GET request to a protected resource
                return agent.get("/urls/b2xVn2").then((accessRes) => {
                    // Step 3: Expect the status code to be 403(forbidden)
                    expect(accessRes).to.have.status(403);
                });
            });
    });

    it('should redirect to "/login" for access to "http://localhost:8080/urls" without logging in', () => {
        return chai.request("http://localhost:8080")
        //make a GET request to /urls
        .get("/urls")
        .then((accessRes) => {
            //expect to redirect to login page
            expect(accessRes.redirects).to.include('http://localhost:8080/login');
        });
    });

    it('should redirect to "/login" for access to "http://localhost:8080/urls/new" without logging in', () => {
        return chai.request("http://localhost:8080")
        //make a GET request to /urls/new
        .get("/urls/new")
        .then((accessRes) => {
            //expect to redirect to login page
            expect(accessRes.redirects).to.include('http://localhost:8080/login');
        });
     });

    it('should return 404 status code for access to "http://localhost:8080/urls/NOTEXITS"(invalid url)', () => {
        const agent = chai.request.agent("http://localhost:8080");
        //make a GET request to /urls/NOTEXISTS
        return agent.get("/urls/NOTEXISTS").then((accessRes) => {
            //Expect the status code to be 404
            expect(accessRes).to.have.status(404);
        });
    });

    it('should return 401 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
        const agent = chai.request.agent("http://localhost:8080");
        //make a GET request to /urls/b2xVn2
        return agent.get("/urls/b2xVn2").then((accessRes) => {
            //Expect the status code to be 401(unauthorised)
            expect(accessRes).to.have.status(401);
        });
    });
});