import { Router } from "express";
const router = Router();
import { gameListData } from "../data/index.js";
import { gameData } from "../data/index.js";
import xss from 'xss';


router.route('/creategame').get(async (req, res)=>{
  try{
    const userRole =req.session.user.role;
    if (userRole != 'admin') throw 'cannot access';
  }
  catch(e)
  {
    res.render('error', {errorMessage : 'you are not admin'});
    return;
  }
  res.render('createGame', {Titlename : 'createGame'});

})
.post(async (req, res) =>{
  let genre = req.body.genreInput;
  let platform = req.body.platformInput;
  let systemRequirements = req.body.systemRequirementsInput;
  let name = req.body.gameNameInput;
  let releaseDate = req.body.releaseDateInput;
  let age = Number(req.body.ageInput);
  let description = req.body.descriptionInput;
  

  genre = xss(genre);
  systemRequirements = xss(systemRequirements);
  name = xss(name);
  description = xss(description);
  platform = xss(platform);
  releaseDate = xss(releaseDate);

  try {
    if (genre) {
      if (genre.trim() == '') throw 'Genre should not be empty spaces';
      if (typeof(genre) != 'string') throw 'Genre type wrong';
      genre = genre.trim();
      let dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let res = 0;
      for (let i = 0; i < genre.length; i++) {
        if (dict.indexOf(genre.charAt(i)) < 0) res++;
      }
      if (res > 0) throw 'invalid genre input';
    }
    if (systemRequirements) {
      if (systemRequirements.trim() == '') throw 'genre should be no empty spaces';
      if (typeof(systemRequirements) != 'string') throw 'genre type wrong';
      systemRequirements = systemRequirements.trim()
      let dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let res = 0;
      for (let i = 0; i < systemRequirements.length; i++) {
        if (dict.indexOf(systemRequirements.charAt(i)) < 0) res++;
      }
      if (res == systemRequirements.length) throw 'invalid systemRequirements input';
    }
    if (systemRequirements) {
      if (systemRequirements.trim() == '') throw 'genre should be no empty spaces';
      if (typeof(systemRequirements) != 'string') throw 'genre type wrong';
      systemRequirements = systemRequirements.trim()
      let dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let res = 0;
      for (let i = 0; i < systemRequirements.length; i++) {
        if (dict.indexOf(systemRequirements.charAt(i)) < 0) res++;
      }
      if (res == systemRequirements.length) throw 'invalid systemRequirements input';
    }
    if (platform) {
      if (platform.trim() == '') throw 'platform should be no empty spaces';
      if (typeof(platform) != 'string') throw 'platform type wrong';
  }
    if (name) {
      if (name.trim() == '') throw 'name should be no empty spaces';
      if (typeof(name) != 'string') throw 'name type wrong';
    }
    if (releaseDate) {
      if (releaseDate.trim() == '') throw 'releaseDate should be no empty spaces';
      if (typeof(releaseDate) != 'string') 'releaseDate type wrong';
    }
    if (age) {
      if (typeof(age) != 'number') throw 'age type wrong';
    }
    if (description) {
      if (description.trim() == '') throw 'description should be no empty spaces';
      if (typeof(description) != 'string') throw 'description type wrong';
      description = description.trim();
      let dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let res = 0;
      for (let i = 0; i < description.length; i++) {
        if (dict.indexOf(description.charAt(i)) < 0) res++;
      }
      if (res == description.length) throw 'invalid description input';
    }

    let testName = await gameListData.getGameByName(name);
    if (testName == 'exist') throw 'Name exists';

    const newGame = await gameListData.createGame(releaseDate, name, genre, description, systemRequirements, age, platform);
    if (newGame) res.render('createGame', {Titlename: "createGame", showErrorMessage : 'Game Added!'});
    if (!newGame) throw 'not created';


  } catch (e) {
    res.render('createGame', {Titlename: "createGame", showErrorMessage : e});

  }

});

router.route('/').get(async (req,res)=>{

  // const user = req.session.user;
  // let userAge = user.age;


  let userAge = 14;

  if (!req.session.user) userAge = 14;
  else userAge = req.session.user.age;

  // try{
  //   const userAge =req.session.user.age;
  // }
  // catch(e)
  // {
  //   userAge = 14;
  // }



    try{
        const game = await gameData.getAll();
        let filteredGame = gameListData.ageFilter(userAge, game);
        // console.log('!!rsi', req.session?.user, req.session?.user?.userId);
        res.render('gameList', {Titlename: "Game list", sortTerm: filteredGame,
         profileId: req.session?.user?.userId,userRole: req.session?.user?.role
        });
        // render -> profileId: req.session?.user?.userId
        // {{#if profileId}}
        // <a href="/user/{{profileId}}">profile</a>
        // {{/if}}
        
    }catch(e){
        return res.status(404).json({error:e})
    }
})
.post(async (req, res) => {
    //code here for POST

    let userAge = 14;

    if (!req.session.user) userAge = 14;
    else userAge = req.session.user.age;
  
    // try{
    //   const userAge =req.session.user.age;
    // }
    // catch(e)
    // {
    //   userAge = 14;
    // }


    let genre = req.body.genreInput;
    let platform = req.body.platformInput;
    let sortWay = req.body.sortWayInput;
    let sortBy = req.body.sortByInput;

    platform = xss(platform);
    genre = xss(genre);
    sortWay = xss(sortWay);
    sortBy = xss(sortBy);

    if (!genre && !platform && !sortWay && !sortBy) res.status(400).render('gameList', {Titlename: "Game List", showErrorMessage : 'Sort/Filter missing',profileId: req.session?.user?.userId,userRole: req.session?.user?.role});



    try {
        if (genre) {
            if (genre.trim() == '') throw 'genre should be no empty spaces';
            if (typeof(genre) != 'string') throw 'genre type wrong';
        }
        if (platform) {
            if (platform.trim() == '') throw 'platform should be no empty spaces';
            if (typeof(platform) != 'string') throw 'platform type wrong';
            if (platform != 'all' &&platform != 'xbox' && platform != 'switch' && platform != 'ps5' && platform != 'pc') throw 'platform input wrong';
        }
        if (sortWay && sortBy) {
            if (sortWay.trim() == '') throw 'sortWay should be no empty spaces';
            if (typeof(sortWay) != 'string') throw 'sortWay type wrong';
            if (sortWay != 'ascending' && sortWay != 'descending') throw 'you have to choose a correct order';
            if (sortBy.trim() == '') throw 'sortWay should be no empty spaces';
            if (typeof(sortBy) != 'string') throw 'sortWay type wrong';
            if (sortBy != 'rate' && sortBy != 'date') throw 'you have to choose a correct sort way';
        }


    } catch (e) {
      return res.status(400).render('gameList', {Titlename: "Game list", showErrorMessage : e,profileId: req.session?.user?.userId,userRole: req.session?.user?.role});
    }





    try {
        if (genre) {
            let ans = await gameListData.getGameByGerne(genre);
           let filteredGame = gameListData.ageFilter(userAge, ans);
            
           let nogame;

           if (filteredGame.length == 0) nogame = 'no games found';
            
           return res.render('gameList', {Titlename: "gameList", sortTerm: filteredGame, showErrorMessage : nogame, profileId: req.session?.user?.userId,userRole: req.session?.user?.role});
        

      } else if (platform) {

        let ans = await gameListData.getGameByPlatform(platform);
        let filteredGame = gameListData.ageFilter(userAge, ans);
            
        let nogame;

        if (filteredGame.length == 0) nogame = 'no games found';
         
        return res.render('gameList', {Titlename: "gameList", sortTerm: filteredGame, showErrorMessage : nogame, profileId: req.session?.user?.userId,userRole: req.session?.user?.role});

      } else if (sortWay && sortBy) {
        if (sortBy == 'date') {
            let ans = await gameListData.sortGameByDate(sortWay);
            let filteredGame = gameListData.ageFilter(userAge, ans);
            
            let nogame;

            if (filteredGame.length == 0) nogame = 'no games found';
             
            return res.render('gameList', {Titlename: "gameList", sortTerm: filteredGame, showErrorMessage : nogame,profileId: req.session?.user?.userId,userRole: req.session?.user?.role});

        } else if (sortBy == 'rate') {

          let ans = await gameListData.sortGameByRate(sortWay);
          let filteredGame = gameListData.ageFilter(userAge, ans);

           let nogame;

           if (filteredGame.length == 0) nogame = 'no games found';
            
          return res.render('gameList', {Titlename: "gameList", sortTerm: filteredGame, showErrorMessage : nogame, profileId: req.session?.user?.userId,userRole: req.session?.user?.role});
        }

      } else {
        return res.status(500).render('gameList', {Titlename : "error", showErrorMessage: "Internal Server Error" });
      }

    } catch (e) {
      return res.render('gameList', {Titlename: "gameList", showErrorMessage : e, profileId: req.session?.user?.userId,userRole: req.session?.user?.role});
    }

  });


export default router;