var express=require('express'),
  app=express(),
  methodOverride=require('method-override'),
  expressSanitizer =require('express-sanitizer'),
  mongoose=require('mongoose'),
  bodyParser=require('body-parser');

// App Config
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(expressSanitizer());   // Sanitizer goes after body parser
mongoose.connect("mongodb://localhost/restfulBlog");

app.listen(3000,'localhost',function(){
  console.log('RESTfulBlog server started.');
});

//mongoDB schema
var blogSchema= new mongoose.Schema({
  title:String,
  image:String,
  body:String,
  created_at: { type: Date, default:Date.now }
});

var Blog= mongoose.model("Blog", blogSchema);

// seeding initial data;
Blog.create({
  title: " Test Blog",
  image: "https://www.publicdomainpictures.net/pictures/70000/velka/stars-in-the-night-sky.jpg",
  body:"This is a test blog"
});
// RESTful routes.
app.get('/', (req,res)=>{
  res.redirect('/blogs');
});
// Index route
app.get('/blogs', (req,res)=>{
  Blog.find({},(err,blogs)=>{
    if(err){
      console.log("Error");
    }else{
      res.render("index",{blogs:blogs})
    }
  });
});
//New route
app.get('/blogs/new',function(req,res){
  res.render('new');
})
//create route
app.post("/blogs",function(req,res){
  req.body.blog.body =req.sanitize(req.body.blog.body);
  // create blog.
   Blog.create(req.body.blog,(err,newBlog)=>{
     if(err){
       res.render("new");
     }else{
       res.redirect("/blogs");
     }
   });
});

//show route
app.get('/blogs/:id',function(req, res){
  Blog.findById(req.params.id, function(err,data){
    if(err){
      console.log("Error in db connection");
      res.redirect("/blogs");
    }else{
      res.render('show',{blog:data});
    }
  });
});

//edit route
app.get("/blogs/:id/edit",function(req,res){
  Blog.findById(req.params.id, function(err,data){
    if(err){
      res.redirect("/blogs");
    }else{
      res.render('edit',{blog:data})
    }
  })
});

// update route
app.put("/blogs/:id",function(req,res){
  req.body.blog.body =req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,data){
    if(err){
      res.redirect("/blogs/");
    }else{
      res.redirect("/blogs/"+req.params.id)
    }
  })
});


// Delete routes
app.delete("/blogs/:id",function(req,res){
  Blog.findByIdAndRemove(req.params.id,function(err){
    if(err){
      res.redirect("/blogs");
    }else{
      res.redirect("/blogs");
    }
  })
})
