const express = require('express');
const router = express.Router();
const auth = require('../auth');

router.get("/", (request, response) => {
    response.json({ message: "Hello This Auth Path" });
});

router.post("/register", (request, response) => {
    // hash the password
    bcrypt
        .hash(request.body.password, 10)
        .then((hashedPassword) => {
            // create a new user instance and collect the data
            const user = new User({
                email: request.body.email,
                password: hashedPassword,
            });

            // save the new user
            user.save().then((result) => {
                response.status(201).send({
                    message: "User Created Successfully",
                    result,
                });
            }).catch((error) => {
                response.status(500).send({
                    message: "Error creating user",
                    error,
                });
            });
        }).catch((e) => {
            response.status(500).send({
                message: "Password was not hashed successfully",
                e,
            });
        });
});
router.post("/login", (request, response) => {
    // check if email exists
    User.findOne({ email: request.body.email })

        // if email exists
        .then((user) => {
            // compare the password entered and the hashed password found
            bcrypt
                .compare(request.body.password, user.password)

                // if the passwords match
                .then((passwordCheck) => {

                    // check if password matches
                    if (!passwordCheck) {
                        return response.status(400).send({
                            message: "Passwords does not match",
                            error,
                        });
                    }

                    //   create JWT token
                    const token = jwt.sign(
                        {
                            userId: user._id,
                            userEmail: user.email,
                        },
                        "RANDOM-TOKEN",
                        { expiresIn: "24h" }
                    );

                    //   return success response
                    response.status(200).send({
                        message: "Login Successful",
                        email: user.email,
                        token,
                    });
                })
                // catch error if password do not match
                .catch((error) => {
                    response.status(400).send({
                        message: "Passwords does not match",
                        error,
                    });
                });
        })
        // catch error if email does not exist
        .catch((e) => {
            response.status(404).send({
                message: "Email not found",
                e,
            });
        });
});
router.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
});
router.get("/auth-endpoint", auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
});

module.exports = router;