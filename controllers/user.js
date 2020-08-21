const env = process.env.NODE_ENV || 'development'

const jwt = require('jsonwebtoken')
const config = require('../config/config')[env]
const bcrypt = require('bcrypt')
const User = require('../models/user')

const generateToken = data => {
    const token = jwt.sign(data, config.privateKey)

    return token
}

const saveUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const rePassword = req.body.rePassword;

    if(password.length < 3 ) return {error: 'Password is too short.'};
    if(username.length < 3) return {error: 'Username is too short'};

    if(!username.match(/^[A-Za-z0-9]+$/)) return { error: 'Username can be only consisted of letters or digits'};
    if(!password.match(/^[A-Za-z0-9]+$/)) return { error: 'Password can be only consisted of letters or digits'};

    if(password !== rePassword) {
        return {
            error: 'Passwords must match!'
        }
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    try {
        const user = new User({
            username,
            password: hashedPassword,
        })
        const userObject = await user.save()

        const token = generateToken({
            userID: userObject._id,
            username: userObject.username
        })

        res.cookie('aid', token)
        return token
    } catch (err) {
        return {
            error: 'User already exists.'
        };
    }

}

const verifyUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;


    if(password.length < 3 ) return {error: 'Password is too short.'};
    if(username.length < 3) return {error: 'Username is too short'};

    if(!username.match(/^[A-Za-z0-9]+$/)) return { error: 'Username can be only consisted of letters or digits'};
    if(!password.match(/^[A-Za-z0-9]+$/)) return { error: 'Password can be only consisted of letters or digits'};

    try {
        const user = await User.findOne({ username })

        if (!user) {
            return {
                error: 'User does not exist'
            }
        }

        const status = await bcrypt.compare(password, user.password);
        
        if (status) {
            const token = generateToken({
                userID: user._id,
                username: user.username
            })

            res.cookie('aid', token)
        }

        return {
            error: status ? false : 'Wrong credentials'
        }
    } catch (err) {

        return {
            error: 'Wrong credentials',
            status
        }
    }

}

const authAccess = (req, res, next) => {
    const token = req.cookies['aid']
    if (!token) {
        return res.redirect('/')
    }

    try {
        jwt.verify(token, config.privateKey)
        next()
    } catch (e) {
        return res.redirect('/')
    }
}
const authAccessJSON = (req, res, next) => {
    const token = req.cookies['aid']
    if (!token) {
        return res.json({
            error: "Not authenticated"
        })
    }

    try {
        jwt.verify(token, config.privateKey)
        next()
    } catch (e) {
        return res.json({
            error: "Not authenticated"
        })
    }
}

const guestAccess = (req, res, next) => {
    const token = req.cookies['aid']
    if (token) {
        return res.redirect('/')
    }
    next()
}

const getUserStatus = (req, res, next) => {
    const token = req.cookies['aid']
    if (!token) {
        req.isLoggedIn = false
    }

    try {
        const verify = jwt.verify(token, config.privateKey);
        req.id = verify.userID;
        req.username = verify.username;
        req.isLoggedIn = true
    } catch (e) {
        req.isLoggedIn = false
    }

    next()
}

module.exports = {
    saveUser,
    authAccess,
    verifyUser,
    guestAccess,
    getUserStatus,
    authAccessJSON
}