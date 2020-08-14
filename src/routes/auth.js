const router = require('express').Router();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const getAppCookies = require('../utils/get_cookies');

const Credential = require('../models/Credential');
const Token = require('../models/Token');

// use 'utf8' to get string instead of byte array  (512 bit key)
const privateKEY = fs.readFileSync(path.join(__dirname, '../..', 'private.key'), 'utf8');
const publicKEY = fs.readFileSync(path.join(__dirname, '../..', 'public.key'), 'utf8');

router.get('/', async (req, res) => {
    try {
        const response = await Credential.find({});
        res.json({
            data: response
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/register', async (req, res) => {
    const emailExist = await Credential.findOne({ email: req.body.email });
    if (emailExist)
        return res.status(400).json({
            err: "Email already exist"
        });

    const hashPass = await bcrypt.hash(req.body.password, 10);

    try {
        const newCred = new Credential({
            email: req.body.email,
            password: hashPass
        });

        await newCred.save()

        const body = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            city: req.body.city,
            auth_id: newCred._id
        };

        console.log(body);

        const fetchResp = await fetch('http://users:3000/api/users/', {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });

        const response = await fetchResp.json()

        res.status(201).json({
            msg: "User created",
            data: response
        })
    } catch (error) {
        res.status(400).json({
            err: error
        })
    }
});

router.post("/login", async (req, res) => {
    // check if email exist
    const user = await Credential.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).json({
            err: "User not exist"
        });

    // check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
        return res.status(400).json({
            err: "Invalid password"
        });

    // create and assign access_token
    const access_token = generateToken({
        _id: user._id,
        email: user.email
    }, privateKEY, {
        algorithm: 'RS256',
        expiresIn: '1m'
    });

    // create and assign refresh_token
    const refresh_token = generateToken({
        _id: user._id,
        email: user.email
    }, privateKEY, {
        algorithm: 'RS256'
    });

    try {
        const response = Token.create({
            token: refresh_token
        });
        res.setHeader('Set-Cookie', `refresh_token=${refresh_token}; HttpOnly`);

        res.json({
            msg: "User logged in",
            access_token
        });
    } catch (error) {
        res.status(400).json({
            err: error
        })
    }


});

router.post('/token', async (req, res) => {
    const refreshToken = getAppCookies(req).refresh_token;
    if (refreshToken == null) return res.sendStatus(401)

    const token = await Token.findOne({ token: refreshToken });
    if (!token)
        return res.status(403).json({
            err: "Invalid token"
        });

    try {
        const verified = jwt.verify(refreshToken, publicKEY, {
            algorithms: ['RS256']
        });
        const decoded = jwt.decode(refreshToken);
        const access_token = generateToken({
            _id: decoded._id,
            email: decoded.email
        }, privateKEY, {
            algorithm: 'RS256',
            expiresIn: '1m'
        });
        res.json({
            msg: "Access token refreshed",
            access_token
        });
    } catch (err) {
        console.error(err)
        return res.status(401).json({
            err
        });
    }
})

router.delete('/logout', (req, res) => {
    try {
        const refreshToken = getAppCookies(req).refresh_token;
        if (refreshToken == null) return res.sendStatus(401)
        Token.findOneAndDelete({ token: refreshToken })
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        return res.status(401).json({
            err
        });
    }
})

const generateToken = (payload, key, options) => {
    return jwt.sign(
        payload, key, options
    );
}

module.exports = router;