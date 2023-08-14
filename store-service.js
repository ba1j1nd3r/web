
// const Sequelize = require('sequelize');
// const { gte } = Sequelize.Op;


// // set up sequelize to point to our postgres database
// var sequelize = new Sequelize('hjyymrzx', 'hjyymrzx', 'ZqbfnKV2x4Ryus8J8LMHNepP5pdK5fDo', {
//     host: 'mahmud.db.elephantsql.com',
//     dialect: 'postgres',
//     port: 5432,
    
//     dialectOptions: {
//         ssl: { rejectUnauthorized: false }
//     },
//     query: { raw: true },
//     pool: {
//         max: 5,
//         min: 0,
//         idle: 10000
//       },
// });
// var Post = sequelize.define('post',{
  
//     body: Sequelize.TEXT,
//     title: Sequelize.STRING,
//     postDate: Sequelize.DATE,
//     featureImage: Sequelize.STRING,
//     published: Sequelize.BOOLEAN

// })

// var Category = sequelize.define('Category', {

//     category: Sequelize.STRING

// });

// Post.belongsTo(Category, {foreignKey: 'category'});
// function initialize() {
//   return new Promise((resolve, reject) => {
//     fs.readFile(path.join(dataPath, 'items.json'), 'utf8', (err, itemsData) => {
//       if (err) {
//         reject('Unable to read items file');
//         return;
//       }
      
//       items = JSON.parse(itemsData);
      
//       fs.readFile(path.join(dataPath, 'categories.json'), 'utf8', (err, categoriesData) => {
//         if (err) {
//           reject('Unable to read categories file');
//           return;
//         }
        
//         categories = JSON.parse(categoriesData);
        
//         resolve();
//       });
//     });
//   });
// }

// function getAllItems() {
//   return new Promise((resolve, reject) => {
//     if (items.length === 0) {
//       reject('No items available');
//       return;
//     }
    
//     resolve(items);
//   });
// }

// function getPublishedItems() {
//   return new Promise((resolve, reject) => {
//     const publishedItems = items.filter(item => item.published == true);
    
//     if (publishedItems.length === 0) {
//       reject('No published items available');
//       return;
//     }
    
//     resolve(publishedItems);
//   });
// }

// function getCategories() {
//   return new Promise((resolve, reject) => {
//     if (categories.length === 0) {
//       reject('No categories available');
//       return;
//     }
    
//     resolve(categories);
//   });
// }


// function addItem(itemData) {
//     return new Promise((resolve, reject) => {
//         itemData.published==undefined ? itemData.published = false : itemData.published = true;
//       itemData.id = items.length + 1;
  
//       items.push(itemData);
//       resolve(itemData);
//     });
//   }


//   function getItemsByCategory(category) {
//     return new Promise((resolve,reject) => {
//       var found = items.filter(items => items.category == category);
//       if (found.length == 0) {
//           reject('no results');
//       }
//       resolve(found);


//   })
//   }
  
//   function getItemsByMinDate(minDateStr) {
//     return new Promise((resolve,reject) =>
//     {
//        var found = items.filter(items => items.postDate >= minDateStr);
//        if (found.length == 0) {
//            reject('no results');
//        }
//        resolve(found);
//     })
//   }
  
//   function getItemById(id) {
//     return new Promise((resolve,reject) =>
//          {
//             var found = items.filter(items => items.id == id);
//             const uniquePost = found[0];
//          //    if (found.length == 0) {
//          //        reject('no results');
//          //    }
//          //    
//          //    resolve(found);
//          if (uniquePost) {
          
//             resolve(uniquePost);
//         }
//         else {
//             reject("no result returned");
//         }
//           }
         
         
//          )
//   }

//  function getPublishedItemsByCategory(cat) {
//     return new Promise((resolve,reject)=>{
//         let filtered = items.filter(items => items.category == cat );
       
//         (filtered.length > 0) ? resolve(filtered) : reject("no results returned");
//     });
   
    
// }
// module.exports = {
//   initialize,
//   getAllItems,
//   getPublishedItems,
//   getCategories,
//   addItem,
//   getItemsByCategory,
//   getItemsByMinDate,
//   getItemById,
//   getPublishedItemsByCategory
// };


const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;


// set up sequelize to point to our postgres database
var sequelize = new Sequelize('hjyymrzx', 'hjyymrzx', 'ZqbfnKV2x4Ryus8J8LMHNepP5pdK5fDo', {
    host: 'mahmud.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
      },
});
var Post = sequelize.define('Item',{
  
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE

})

var Category = sequelize.define('Category', {

    category: Sequelize.STRING

});

Post.belongsTo(Category, {foreignKey: 'category'});


module.exports.initialize = function () {
  
   
    return new Promise((resolve, reject) => {
       

      
        sequelize.sync().then(()=> {
            
            console.log('Database synced successfully');
            
            resolve();
        })  
        .catch((error) => {
            console.log('Unable to sync the database:', error);
            reject('Unable to sync the database');
          });

});

}

module.exports.getAllItems = ()=>{

    return new Promise((resolve, reject) => {
        let post = Post.findAll();

          if(post)
          {
            
                resolve(post);
          }
          else{
            reject();
          }
         
});

}

module.exports.getItemsByCategory = (cat)=>{
    return new Promise((resolve, reject) => {
       Post.findAll({where:
    {
        category: cat
    }}).then(posts => { 
        
        if (posts.length > 0) {
            resolve(posts);
          } else {
            reject("no results returned");
          }
    })
    .catch(error => {
        reject(error.message);
    
        })
});

}

module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
       
Post.findAll({
    where: {
        postDate: {
            [gte]: new Date(minDateStr)
        }
    }
})
.then(posts => {
    if (posts.length > 0) {
      resolve(posts);
    } else {
      reject("No items found with the given minimum date");
    }
  })
  .catch(error => {
    reject(error.message);

    })
});
}


module.exports.getItemById = function(ID){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: ID
    
            }
        })
        .then(posts => {
            if (posts.length > 0) {

              resolve(posts[0]);
            } else {
              reject("No items found with id: ${ID}" );
            }
          })
          .catch(error => {
            reject(error.message);
        
            })
});

}

module.exports.addItem = function(postData){

    postData.published = (postData.published) ? true : false;
  
    console.log(postData);

    for (const property in postData) {
        if(postData[property] == "")
        {
            postData[property] = null;
        }
    }
    postData.postDate = new Date();
    return new Promise((resolve, reject) => {
        sequelize.sync().then(Post.create(postData)
        .then(post => {
          resolve(post);
        })
        .catch(error => {
          reject("Unable to create post");
        }));
});

}

module.exports.getPublishedItems = function(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(Post.findAll()
        .then(posts => {
          const publishedPosts = posts.filter(post => post.published === true);
          resolve(publishedPosts);
        })
        .catch(error => {
          return Promise.reject("No results returned");
        }));
});

}

module.exports.getPublishedItemsByCategory = function(cat){
    return new Promise((resolve, reject) => {
        
        sequelize.sync().then(Post.findAll({where:
                {
                    category: cat
                }}
        )
        .then(posts => {
          const publishedPosts = posts.filter(post => post.published === true);
          resolve(publishedPosts);
        })
        .catch(error => {
          return Promise.reject("No results returned");
        }));
});

}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {

        let category = Category.findAll();
       if(category)
       {
        
        resolve(category)
       }
       else
       {
        reject();
       }
});

}

module.exports.addCategory = function(categoryData){
    for (const property in categoryData) {
        if(categoryData[property]== "")
        {
            categoryData[property] = null;
        }
    }
   
    return new Promise((resolve, reject) => {
        sequelize.sync().then(  Category.create(categoryData)
        .then(category => {
          resolve(category);
        })
        .catch(error => {
          reject("Unable to create category");
        }));
});

}

module.exports.deleteCategoryById = ID =>
{
    return new Promise ((resolve,reject) =>
    {
        Category.destroy({
            where: { id: ID }
        }).then( resolve()).catch( reject("unable to delete category"));
    })

}
module.exports.deleteItemById = ID =>
{
    return new Promise ((resolve,reject) =>
    {
    

        Post.destroy({
            where: { id: ID }
        }).then( 
            
            resolve())
        .catch( reject("unable to delete post"));
    })

}
