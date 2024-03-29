import express from 'express';
const app = express();
import configRoutes from './routes/index.js'
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import exphbs from 'express-handlebars'
import session from 'express-session';
import Handlebars from 'handlebars';
Handlebars.registerHelper('concat', function(str1,str2) {
  return str1+str2;
});

Handlebars.registerHelper('ifEqual', function(str1, str2){
  return str1 === str2;
} )

Handlebars.registerHelper('or', function(boo1, bool2){
  if(boo1 || bool2){
    return true
  }else{
    return false
  }
})
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + '/public');
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    console.log(req.body._method)
    delete req.body._method;
  }
  next();
};
const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  partialsDir: ['views/partials/','views']
});

app.use(
  session({
    name: 'AuthCookie',
    secret: "This is a secret",
    saveUninitialized: false,
    resave: false
  })
);

app.use('/register',(req, res, next)=>{
    if(req.session.user){
      return res.redirect('/')
    }else{
      next();
    }
})

app.use('/login',(req, res, next)=>{
    if(req.session.user){
      return res.redirect('/')
    }else{
      next();
    }
})

app.use('/logout',(req,res, next)=>{
    if(!req.session.user){
      return res.redirect('/login')
    }else{
      next();
    }
})

app.use('/gamelist/creategame',(req,res, next)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }else{
    next();
  }
})

app.use('/games/:id/edit',(req,res, next)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }else{
    if(req.session.user.role==='admin'){
      next();
    }else{
      return res.status(403).render('unauthorized',{titleName:'Unauthorized'})
    }
  }
})

app.use('/games/reviews/:id/edit',(req,res, next)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }else{
    next();
  }
})

app.use('/user/:id',(req, res, next)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }else{
    next();
  }
})

app.use('/user/:id/edit',(req, res, next)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }else{
    next();
  }
})

app.use('/user/:id/edit/avatar',(req, res, next)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }else{
    next();
  }
})

app.use('/user/:id/delete',(req, res, next)=>{
  if(!req.session.user){
    return res.redirect('/login')
  }else{
    next();
  }
})



app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app)

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });