const router = require('express').Router();
const { getUserStatus, authAccess} = require('../controllers/user');
const { getAllPlays } = require('../controllers/play');

router.get('/', getUserStatus, async (req, res) => {
    let plays = await getAllPlays(req, res);
    plays = plays.filter(play => play.isPublic == true);
    plays = plays.sort((a, b) => b.usersLiked.length - a.usersLiked.length);


    let playsUser = await getAllPlays(req, res);
    playsUser = playsUser.filter(play => play.isPublic == true || play.creator == req.id);
    playsUser = playsUser.sort((a, b) => (b.createdAt.getTime() / 1000) - (a.createdAt.getTime() / 1000));
    
    if(req.isLoggedIn){
        res.render('user-home', {
            title: "Home page | User",
            isLoggedIn: req.isLoggedIn,
            playsUser
        })
    }else{
        res.render('home', {
            title: "Home page | Guest",
            isLoggedIn: req.isLoggedIn,
            plays
        })
    
    }
})

router.get('/sort/likes', authAccess, getUserStatus , async (req, res) => {
    let playsUser = await getAllPlays(req, res);
    playsUser = playsUser.filter(play => play.isPublic == true || play.creator == req.id);
    playsUser = playsUser.sort((a, b) => b.usersLiked.length - a.usersLiked.length);

    res.render('user-home', {
        title: "Home page | User",
        isLoggedIn: req.isLoggedIn,
        playsUser
    })
})

router.get('/sort/date', authAccess, getUserStatus, async (req, res) => {
    let playsUser = await getAllPlays(req, res);
    playsUser = playsUser.filter(play => play.isPublic == true || play.creator == req.id);
    playsUser = playsUser.sort((a, b) => (b.createdAt.getTime() / 1000) - (a.createdAt.getTime() / 1000));

    res.render('user-home', {
        title: 'Home page | User',
        isLoggedIn: req.isLoggedIn,
        playsUser
    }) 
})
module.exports = router;