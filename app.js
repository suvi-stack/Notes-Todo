const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js")
const mongoose =  require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", 'ejs');
app.use(express.static("public"));



// console.log(date);

// var items = ["Buy Milk","Buy Groceries", "Buy Electronics"];
// var workItems = []



mongoose.connect('mongodb+srv://admin-su:MongoATLAS-123@cluster0.i6vpyy7.mongodb.net/todolistDB', {useNewUrlParser: true});

//schema
const itemsSchema = new mongoose.Schema({
    name: String
})

const listSchema = new mongoose.Schema({
    name: String, 
    items : [itemsSchema]
})

//model
const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);


//document
const item1 = new Item({
    name: "Welcome to your todolist!"
})
const item2 = new Item({
    name: "Hit the + button to add a new item."
})
const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3]





app.get("/", function(req, res){
   
     //only getting day
    // let today = date.getDate();

    Item.find({}).then(function(items){
        // console.log(items)
        if(items.length === 0){
            Item.insertMany(defaultItems).then(function(){
                console.log("success");
            })
            .catch(function(err){
                console.log(err);
            })
            res.redirect("/")
        } else {
            res.render("list", {listTitle: "Today", newListItem: items})
        }
    })

    .catch(function (err) {
        console.log(err);
    });

   
   
})


app.post("/", function(req, res){

    // console.log(req.body)
    const itemName = req.body.newItem; //buy food, do laundry, clean the room.
    const listName = req.body.list; //today, work, office, shopping.

    const item = new Item ({
        name : itemName
    })


    if(listName === "Today"){
        
        item.save();

        res.redirect("/");
    }
    else 
    {
        List.findOne({name: listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName)
        })
        .catch(function(err){
            console.log(err);
        })
    }
    
})


app.post("/delete", function(req, res){

    console.log(req.body)
    
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName; //newly added
    
    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
    
    .then(function(){
        console.log("successfully deleted");
    })
    
    .catch(function (err) {
        console.log(err);
    });
    
    res.redirect("/")
  
    } else {
        List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: checkedItemId}}})
        .then(function(){
            console.log("Successfully deleted.")
        })
        .catch(function(err){
            console.log(err)
        })
        res.redirect("/" + listName)
    }
    
});




app.get("/:customListName", function(req, res){
    // const customListName = req.params.customListName;
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({name: customListName})
    
    .then(function(foundList){
    
        if(!foundList){
            // console.log("Doesnot exists")
            //create a new list
            const list = new List ({
                name: customListName,
                items: defaultItems
            })

            list.save();

            res.redirect("/" + customListName)

        } else {
            // console.log("exists");
            //show an existing list
            res.render("list", {listTitle: foundList.name, newListItem: foundList.items})
        }
        
    })
    .catch(function(err){
        console.log(err)
    })

})








app.listen(3000, function(){
    console.log("server is running on port 3000");
})




