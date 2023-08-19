const express = require('express');
const clientSessions = require('client-sessions');
const authData = require('./auth-service');
const storeService = require('./store-service');
const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const upload = multer(); 

const exphbs = require("express-handlebars");
var path = require('path');
const port = process.env.PORT || 8080;
const stripJs = require('strip-js');
app.use(express.static('public'));

cloudinary.config({
    cloud_name: "dhobpx4ek",
    api_key: "742724157688558",
    api_secret: "WX4ZV2hlLAYbZpyWFc9MTVlC5Wo",
    secure: true
  });

  app.use(clientSessions({
    cookieName: 'session',
    secret: 'your-secret-key',
    duration: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    activeDuration: 1000 * 60 * 5 // 5 minutes in milliseconds
  }));


  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });
  

 
  function ensureLogin(req, res, next) {
    if (!req.session.user.userName) {
      res.redirect("/login");
    } else {
      next();
    }
  }
  

app.use(function(req,res,next){let route = req.path.substring(1);app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));app.locals.viewingCategory = req.query.category;next();})
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', '.hbs');
app.use(express.json());
app.engine(".hbs", exphbs.engine({
  extname: ".hbs",
  helpers: {
      navLink: function(url, options){
          return '<li' + 
              ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
              '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function (lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      },
      safeHTML: function(context){
          return stripJs(context);
      },
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }
  }
}));
app.get('/', (req, res) => {
    res.redirect('/shop');
  });

  app.get('/about',(req, res) => {
    res.render("about");
});

app.get('/login',(reg,res)=>
{
    res.render("login");

});
app.get('/register',(reg,res)=>
{
    res.render("register");

});
  
app.post('/register', (req, res) => {
  const userData = req.body;
  authData.registerUser(userData)
    .then(() => {
      res.render('register', { successMessage: 'User created' });
    })
    .catch((err) => {
      res.render('register', { errorMessage: err, userName: req.body.userName });
    });
});


app.post('/login', (req, res) => {
 
  const userData = req.body;
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(userData)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      console.log(req.session.user.userName)
      res.redirect('/items');
    })
    .catch((err) => {
      res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});


app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

// User history route
app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});
  // Route: /shop

  app.get("/shop",async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
    
      let items = [];
  
      // if there's a "category" query, filter the returned posts by category
      if (req.query.category) {
        // Obtain the published "posts" by category
        items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await storeService.getPublishedItems();
      }
  
      // sort the published items by postDate
      items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
  
      // get the latest post from the front of the list (element 0)
      let post = items[0];
  
      // store the "items" and "post" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = await storeService.getItemById(1);
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  });
  
app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      
      if(req.query.category){
         
          items = await storeService.getPublishedItemsByCategory(req.query.category);
      }else{

          items = await storeService.getPublishedItems();
      }

      // sort the published items by postDate
      items.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await storeService.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

app.get('/items/add', (req, res) => {

  storeService.getCategories().then(

 data => 
 
 res.render("addItem", {categories: data})
  ).
  catch(  err=>
     {
         res.render("addItem", {categories: []})
     }
  );
});
  
  app.get("/items/:id", (req, res) => {
    const itemId = parseInt(req.params.id);
  
    storeService
      .getItemById(itemId)
      .then((item) => {
        if (item) {
          res.json(item);
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      })
      .catch((error) => {
        res.status(500).json({ message: error });
      });
  });
  
  // Route: /items
  app.get('/items',ensureLogin, (req, res) => {

    let queryPromise = null;

    if (req.query.category) {
        queryPromise = storeService.getItemsByCategory(req.query.category);
    } else if (req.query.minDate) {
        queryPromise = storeService.getItemsByMinDate(req.query.minDate);
    } else {
        queryPromise = storeService.getAllItems()
    }

    queryPromise.then(
        data => {
        if(data.length > 0)
        {
        
        res.render("items", {items: data});
        }
        else
        {

       res.render("items",{ message: "no results" });

        }
    }).catch(err => {

        res.render("items", {message: "no results"});
    })

});




  
  
  // Route: /categories
  app.get('/categories',ensureLogin, (req, res) => {
    storeService.getCategories().then((data => {
        if(data.length > 0)
        {
           
            res.render("categories", {categories: data});

        }
        else
        {
          

       res.render("categories",{ message: "no results" });

        }
    })).catch(err => {
       

        res.render("categories", {message: "no results"});
    });
});

app.get('/categories',ensureLogin, (req, res) => {
  storeService.getCategories().then((data => {

      if(data.length > 0)
      {
    
          res.render("categories", {categories: data});

      }
      else
      {
        

     res.render("categories",{ message: "no results" });

      }
  })).catch(err => {
     

      res.render("categories", {message: "no results"});
  });
});





app.get('/categories/add',ensureLogin, (req, res) => {

  res.render("addCategory")



});


app.post('/categories/add',ensureLogin,(req,res) =>
{
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }

    function processPost(imageUrl){
      
       
      storeService.addCategory(req.body).then(items=>{
            res.redirect("/categories");

        }).catch(err=>{
            res.status(500).send("could not add category");
        })
    }   
});


app.get('/items/delete/:id',  (req, res) => {
  const postId = req.params.id;

  try {
      console.log(postId);
      storeService.deleteItemById(postId).then(
      data=> res.redirect('/items'),
     )
  } catch (error) {
    res.status(500).send('Unable to Remove item / item not found'); 
  }
});

app.get('/categories/delete/:id', (req, res) => {
  const categoryId = req.params.id;

  try {
    storeService.deleteCategoryById(categoryId);
    res.redirect('/categories');
  } catch (error) {
    res.status(500).send('Unable to Remove Category / Category not found');
  }
});
  
  // Route:  /items/add
  app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if (req.file) {
      let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
  
      async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
      }
  
      upload(req)
        .then((uploaded) => {
          processItem(uploaded.url);
        })
        .catch((error) => {
          console.error('Error uploading image:', error);
          processItem('');
        });
    } else {
      processItem('');
    }
  
    function processItem(imageUrl) {
      req.body.featureImage = imageUrl;
      
      storeService.addItem(req.body).then(() =>
      {
    
        res.redirect("/items");
    
      }).catch(err=>{
        res.status(500).send("could not add category");
    })
    
  
    }
  });







  
  // Route: 404 - Page Not Found
  app.get('*', (req, res) => {
    res.status(404).json({ message: 'Page Not Found' });
  });
  
  


  storeService.initialize()
.then
(authData.initialize)
.then(function(){
    app.listen(port, function(){
        console.log("app listening on: " + port)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});