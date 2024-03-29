import { Router } from "express";
const router = Router();
import { userData } from "../data/index.js";
import { gameData } from "../data/index.js";
import { getAllCommentsByUserId } from "../data/comment.js";
import validation from "../validations/userValidation.js";
import fs from "fs";
import xss from 'xss';
import path from "path";
import session from "express-session";
import fileUpload from 'express-fileupload'; // this is used for profile picture upload

//app.use(fileUpload()); // this is used for profile picture upload

// import multer from 'multer';
// const upload = multer({ dest: './public/userimages/' , limits: { fileSize: 10 * 1024 * 1024 }});

router.route("/:id").get(async (req, res) => {
  let user1=undefined
  try {
    req.params.id = validation.checkId(req.params.id);
  } catch (e) {
    res.render('error', {errorMessage : JSON.stringify(e)});
  }
  try{
    user1 = await userData.getUserById(req.params.id);
  }catch(e){
    return res.render('error', {errorMessage: e})
  }
  let ratedArr = [];
  try{
      for (let r of user1.ratedIds){
      // console.log(r.toString());
        let game1 = await gameData.getGame(r.toString());
        console.log(game1);
        ratedArr.push(game1);
    }
  }catch(e){
    console.log(e)
  }

  try {
    //if not logged in will be redirected to login page ??? how to do
    //const user1 = await userData.getUserById(req.params.id);
    
    // const comments = await commentCollection.getMany({userId: req.params.id});
    let comments = []
    let cursor = await getAllCommentsByUserId(req.params.id);
    for await (const doc of cursor) {
      console.dir(doc);
      comments.push(doc)
    }
    // r is a str
    
    // for (let r of user1.ratedIds){
    //   // console.log(r.toString());
    //   let game1 = await gameData.getGame(r.toString());
    //   console.log(game1);
    //   ratedArr.push(game1);
    // }
    console.log(ratedArr)
    let bool1 =  req.session?.user?.role === 'admin' || req.session?.user?.userId === req.params.id;
    return res.render("userProfile", {Titlename : "User Profile",
      id: req.params.id,
      avatar: user1.avatar,
      username: user1.userName,
      age: user1.age,
      email: user1.email,
      isLoggedInUser: bool1, // if logged in user is the same as the user being viewed
      posts: comments, // type array
      rated: ratedArr
    });
  } catch (e) {
    return res.render('error', {errorMessage: e})
  }
}
).delete(async(req, res) =>{
  if (req.params.id === req.session?.user?.userId || req.session?.user?.role === 'admin') {
    try {
      req.params.id = validation.checkId(req.params.id);
    } catch (e) {
      return res.render('error', {errorMessage: e})
    }
    try {
      const user1 = await userData.getUserById(req.params.id);
      req.session.destroy()
      await userData.deleteUser(req.params.id);
      res.render('deleted', {Titlename : "User Deleted", name : user1.userName, id : user1._id});
    } catch (e) {
      return res.render('error', {errorMessage: e})
    }
  } else {
    res.render('error', {errorMessage : "not logged in as the user or you are not the admin!"});
  }
})

// // delete user
// router.route("/:id/delete").get(async (req, res) => {
//   if (req.params.id === req.session?.user?.userId || req.session?.user?.role === 'admin') {
//     try {
//       req.params.id = validation.checkId(req.params.id);
//     } catch (e) {
//       return res.render('error', {errorMessage: e})
//     }
//     try {
//       const user1 = await userData.getUserById(req.params.id);
//       req.session.destroy()
//       await userData.deleteUser(req.params.id);
//       res.render('deleted', {name : user1.userName});
//     } catch (e) {
//       return res.render('error', {errorMessage: e})
//     }
//   } else {
//     res.render('error', {errorMessage : "not logged in as the user or you are not the admin!"});
//   }
// });
// link to edit page
router
  .route("/:id/edit")
  .get(async (req, res) => {
    try {
      req.params.id = validation.checkId(req.params.id);
      let currUser = await userData.getUserById(req.params.id);
      if(req.session?.user?.userId !== req.params.id ) throw "You are not logged in as this user";
      res.render("editProfile", {Titlename : "User Update", id: req.params.id, age: currUser.age, username: currUser.userName });
    } catch (e) {
      res.render('error', {errorMessage : JSON.stringify(e)});
    }
  })
  // post to put
  .post(fileUpload(),async (req, res) => {
    let { userName: userName, oldpassword, newpassword, age: age } = req.body;
    let errors = [];
    try {
      userName = xss(userName);
      userName = validation.checkString(userName, "userName");
    } catch (e) {
      errors.push(e);
    }
    try {
      oldpassword = xss(oldpassword);
      oldpassword = validation.checkPass(oldpassword);
      newpassword = xss(newpassword);
      newpassword = validation.checkPass(newpassword);
      
    } catch (e) {
      errors.push(e);
    }
    // try{
    //   if(oldpassword !== bcrypt(newpassword)) throw "New password is not the same as old password";
    //   // bcrypt
    // }catch(e){
    //   errors.push(e);
    // }
    try {
      age = xss(age);
      age = validation.checkAge(age);
    } catch (e) {
      errors.push(e);
    }
    if (errors.length > 0) {
      return res
        .status(400)
        .render("editProfile", { errors: errors, hasErrors: true });
    }
    if (userName && oldpassword && newpassword && age) {
      try {
        // check oldPassword is correct else return
        //is parseInt ok?

        let data = await userData.updateUser(
          req.params.id,
          userName,
          parseInt(age),
          newpassword,
          oldpassword
        );
        if (data) {
          res.redirect("/user/" + req.params.id);
        }
      } catch (e) {
        errors.push(e);
        res
          .status(400)
          .render("editProfile", { errors: errors, hasErrors: true });
      }
    }
  });

  //check reload
router
  .route("/:id/edit/avatar")
  .get(async (req, res) => {
    try {
      req.params.id = validation.checkId(req.params.id);
      let currUser = await userData.getUserById(req.params.id);
      if(req.session?.user?.userId !== req.params.id) throw "You are not logged in as this user";
    } catch (e) {
      res.render('error', {errorMessage : JSON.stringify(e)});
    }
    res.render("editAvatar", {Titlename : "User Avatar Update"});
  })
  .post(fileUpload(),async (req, res) => {
    let errors = [];
    try {
      const { file: file } = req.body;
      // console.log(file, req.body, req.files);
      // console.log(req.files.avatar);
      if (!req.files && !req.files.avatar) throw "No avatar submitted";
      if (req.files && req.files?.avatar.data) {
        fs.writeFileSync(
          path.join('./public', 'userimages', req.params.id+"."+req.files.avatar.name.split(".")[1]),
          req.files.avatar.data,
          {
            flag: "w+",
          }
        );//You must use path.join to keep your code working in all kinds of platform!
        let data = await userData.updateAvatar(
          req.params.id,
          req.params.id + "." + req.files.avatar.name.split(".")[1]
        );
      }
      // console.log("check");
      res.redirect("/user/" + req.params.id);
    } catch (e) {
      errors.push(e);
      res.status(400).render("editAvatar", { errors: errors, hasErrors: true });
    }
  });


export default router;
