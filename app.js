const express  = require('express');
const bodyparser = require('body-parser');
const _ = require('lodash');
const mongoose = require('mongoose');

const app = express();

const fixitems=[];
mongoose.connect("mongodb+srv://Admin_Aditya:123-aditya@cluster0.qxxwb.mongodb.net/ListDB?retryWrites=true&w=majority",{useNewUrlParser:true});

const ItemSchema=mongoose.Schema({
    Name:String
});

const items = mongoose.model("ItemList",ItemSchema);

const Item1=new items({
  Name:"Welcome to To-Do_List"
});

const Item2=new items({
  Name:"Click + to add new item"
});

const Item3=new items({
  Name:"<- Click here to delete item"
});

const defaultitems=[Item1,Item2,Item3];

//-----------------List Schema----------------------
const listSchema = mongoose.Schema({
  name:String,
  Items:[ItemSchema]
});

const List = mongoose.model("customlist",listSchema);

// const Homeitem=["Buy Orange"];
// const exapmle=["Add Your Items"];

app.set("view engine","ejs");
app.use(express.static("Public"));
app.use(bodyparser.urlencoded({extended:true}));

app.get("/",function(req,res){
   // const date = new Date();
   //
   // const options={
   //   weekday:"long",
   //   day:"numeric",
   //   month:"long"
   // }
   // const day = date.toLocaleDateString("en-us",options);
   items.find(function(err,founditem){
     if(!err){
       if(founditem.length===0){
         items.insertMany(defaultitems,function(err){
           if(!err){
             console.log("Data inserted sucessfully in ListDB");
           }
           res.redirect("/");
         });
       }else{
         res.render("list",{listtitle:"Today",Defaultitem:founditem});
       }
     }
   });
});

app.get("/:customlist",function(req,res){
  const customlistName =_.capitalize(req.params.customlist);
  List.findOne({name:customlistName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name:customlistName,
          Items:defaultitems
        });
        list.save();
        res.redirect("/"+customlistName);
      }else{
        res.render("list",{listtitle:foundlist.name,Defaultitem:foundlist.Items});
      }
    }
  });
});

app.post("/",function(req,res){
  const item=req.body.additem;
  const listname=req.body.b1;

  const newitem = new items({
    Name:item
  });

  if(listname=="Today"){
    newitem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname},function(err,foundlist){
        foundlist.Items.push(newitem);
        foundlist.save();
        res.redirect("/" + listname);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedItem = req.body.cb1;
  const list = req.body.listname;

   if(list==="Today"){
     items.findByIdAndRemove(checkedItem,function(err){
       if(!err){
         console.log("Data Deleted Sucessfully!");
         res.redirect("/");
       }
     });
   }else{
     List.findOneAndUpdate({name:list},{$pull: {Items: {_id:checkedItem}}},function(err,foundlist){
       if(!err){
         res.redirect("/"+list);
       }
     });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
  console.log("Server started on port 3000");
});
