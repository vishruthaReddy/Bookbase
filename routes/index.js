var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../db-config.js');

/* ----- Connects to your mySQL database ----- */

//We did not end up implementing the sql portion of our project and did 
//the entirety of our project in Mongo but the connections are still
//here as we could theoretically connect to the sql instance with more time
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://vkreddyCIS550:passwordCIS550@cluster0-n1fx1.mongodb.net/goodreads?retryWrites=true&w=majority";


/* ------------------------------------------- */
/* ----- Routers to handle FILE requests ----- */
/* ------------------------------------------- */


//router for dashboard
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'dashboard.html'));
});
//router for the bookresults 
router.get('/bookresult', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'bookresult.html'));
});


// router for author search
router.get('/authorssearch', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'authorsearch.html'));
});

// router for reddit comment search
router.get('/redditsearch', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'redditsearch.html'));
});

router.get('/recommendations', function(req, res) {
  res.sendFile(path.join(__dirname, '../', 'views', 'recommendations.html'));
});


/* ------------------------------------------------ */
/* ----- Routers to handle data requests ----- */
/* ------------------------------------------------ */

router.get('/books/:book_id', function(req, res) {
  var url_book_id = req.params.book_id;
  MongoClient.connect(url, function(err, client) {

    var db = client.db("goodreads");
    db.collection('books').find({
      book_id: url_book_id
    }).toArray(function(err, items) {
      console.log(items);
      res.json(items);
    });



    client.close();
                          
  });
});

router.get('/authors/:author_id', function(req, res) {
  var url_author_id = req.params.author_id;
  MongoClient.connect(url, function(err, client) {

    var db = client.db("goodreads");
    db.collection('authors').find({
      author_id: url_author_id
    }).toArray(function(err, items) {
      console.log(items);
      res.json(items);
    });



    client.close();
                          
  });
});


router.get('/books/:book_id/reviews', function(req, res) {
  var data = [];

  var book_id = req.params.book_id;

  MongoClient.connect(url, function(err, client) {

      var db = client.db("goodreads");

      var cursor = db.collection('books').aggregate([
        {
          $match: {
            book_id: book_id
            }
        }, {
          $lookup: {
            from: "reviews",
            localField: "book_id",
            foreignField: "book_id",
            as: "comments"
          }
        }
      ]).toArray(function(err, items) {
        console.log(items);
        res.json(items);
      });
      client.close();

  });
});

router.get('/authors/allseries', function(req, res) {

  MongoClient.connect(url, function(err, client) {
    var db = client.db("goodreads");

    var cursor = db.collection("books").aggregate([
      {
        $match: {isbn: "1934876569"}
      },
      {
        $lookup: {
          from: "books",
          localField: "authors.author_id",
          foreignField: "authors.author_id",
          as: "series"
        }
      }, {
        $unwind: "$series"
      }, {
        $project: {
          _id: 0,
          book: "$series.series"
        }
      }
    ]);

    cursor.each(function(err, item) {
      if (item!==null) {
        res.json(item);
      }
    })
  })

});

router.get('/users/interactions', function(req, res) {

  MongoClient.connect(url, function(err, client) {
    var db = client.db("goodreads");

    var cursor =  db.collection('user_interactions').aggregate([
      {
        $match: {user_id: "8842281e1d1347389f2ab93d60773d4d"}
      }
    ]).toArray(function(err,arr){
      var ids = [];
      for (var i = 0; i < arr.length; i++) {
        ids[i] = arr[i].book_id;
      }
      res.json(ids);
    });
  })
});

router.get('/books/genres/all_genres', function(req, res) {

  MongoClient.connect(url, function(err, client) {
    var db = client.db("goodreads");

    var cursor =  db.collection('genres').aggregate([
        {
           $project: {
              _id: 0,
              genres_arr: { $objectToArray: "$genres" }
           }
        },
        {
          $unwind: "$genres_arr"
        },
        {
          $group: {
            _id: "$genres_arr.k", count: { $sum: 1 }
          }
        },
        {
          $sort: {count: -1} 
        }
    ]).toArray(function(err,arr){
      var genres = [];
      for (var i = 0; i < arr.length; i++) {
        genres[i] = arr[i]._id;
      }
      res.json(genres);
    });
  })
});

router.get('/books/genres/top_of_:genre', function(req, res) {
  var genre = req.params.genre;
  console.log("hello world");
  MongoClient.connect(url, function(err, client) {

    var db = client.db("goodreads");
    db.collection('books').aggregate([
  
      {
        $lookup: {
          from: "genres_2",
          localField: "book_id",
          foreignField: "book_id",
          as: "book_id"
        },
      },
      {
         $project: {
            _id: 0,
            genres_obj: { $arrayElemAt: ["$book_id", 0] },
            average_rating: 1,
            title: 1,
            ratings_count: 1,
            text_reviews_count: 1
         }
      },
      {
         $project: {
            _id: 0,
            genres_arr: { $objectToArray: "$genres_obj.genres" },
            average_rating: 1,
            title: 1,
            ratings_count: 1, 
            text_reviews_count: 1
         }
      },
      {
        $match: {
          genres_arr: { 
            $elemMatch: { k: genre },
          }
        }
      },
      {
        $sort: { average_rating: -1 }
      },
      {
        $limit: 20
      }
      
    ]).toArray(function(err, items) {
      console.log(items);
      res.json(items);
    });



    client.close();
                          
  });
});


// router.get('/search/book', function(req, res) {
//   var book_title = "Final Harvest: Poems";
//   MongoClient.connect(url, function(err, client) {

//       var db = client.db("goodreads");
//       var name = "";
//       var cursor = db.collection('books').aggregate([
//         {$match: {
//           title:"Final Harvest: Poems"
//           }
//         }
//       ]);

//       cursor.each(function(err, item) {
//         if(item!==null){
//           res.json(item)
//         }
//       });

//       client.close();

//   });
// });


router.get('/search/books/:query', function(req, res) {
  MongoClient.connect(url, function(err, client) {

    /* Convert URI-encoded query back into query string */
    var encoded_query = req.params.query;
    var search_query = decodeURIComponent(encoded_query);

    /* Regex search using search query */
    var db = client.db("goodreads");
    db.collection('books').find({
      title: {$regex: search_query, $options: "$i"}
    }).toArray(function(err,items){
      console.log(items);
      res.json(items);
    });

    client.close();

  });
});


router.get('/search/authors/:query', function(req, res) {
  MongoClient.connect(url, function(err, client) {

    /* Convert URI-encoded query back into query string */
    var encoded_query = req.params.query;
    var search_query = decodeURIComponent(encoded_query);

    /* Regex search using search query */
    var db = client.db("goodreads");
    db.collection('authors').find({
      name: {$regex: search_query, $options: "$i"}
    }).toArray(function(err,items){
      console.log(items);
      res.json(items);
    });

    client.close();

  });
});

router.get('/search/reddit/:query', function(req, res) {
  MongoClient.connect(url, function(err, client) {

    var encoded_query = req.params.query;
    var search_query = decodeURIComponent(encoded_query);

    var db = client.db("goodreads");
    db.collection('scraped_reddit_data').aggregate([
      {
        $match: {body: {$regex: search_query, $options: "$i"}}
      },{
        $sort: {score: -1}
      }
    ]).toArray(function(err, items) {
      console.log(items);
      res.json(items);
    });

    // console.log(cursor);

    // cursor.each(function(err, item) {
    //   console.log(err);
    //   console.log(item);
    // })    

  })
});

router.get('/reddit/:comment_id', function(req, res) {
  MongoClient.connect(url, function(err, client) {

    var comment_id = req.params.comment_id;

    var db = client.db("goodreads");
    db.collection('scraped_reddit_data').find({
      id: comment_id
    }).toArray(function(err, items) {
      console.log(items);
      res.json(items);
    });

    // console.log(cursor);

    // cursor.each(function(err, item) {
    //   console.log(err);
    //   console.log(item);
    // })    

  })
});

router.get('/reddit/children/:comment_id', function(req, res) {
  MongoClient.connect(url, function(err, client) {

    var comment_id = req.params.comment_id;

    var db = client.db("goodreads");
    db.collection('scraped_reddit_data').find({
      parent_id: {$regex: comment_id, $options: "$i"}
    }).toArray(function(err, items) {
      console.log(items);
      res.json(items);
    });

    // console.log(cursor);

    // cursor.each(function(err, item) {
    //   console.log(err);
    //   console.log(item);
    // })    

  })
});


router.get('/books/:book_id/authors', function(req, res) {
  
  var book_id = req.params.book_id;
  
  MongoClient.connect(url, function(err, client) {

    var db = client.db("goodreads");
    var cursor = db.collection('books').aggregate([
      {
        $match: 
          {
            book_id: book_id
          }
      }, {
        $lookup: 
          {
            from: "authors",
            localField: "authors.author_id",
            foreignField: "author_id",
            as: "author_id"
          }
      }
    ]).toArray(function(err, items) {
      console.log(items);
      res.json(items);
    });

    client.close();

  });
});



router.get('/authors', function(req, res) {
  var data = [];
  var author_id = "604031";
  MongoClient.connect(url, function(err, client) {

      var db = client.db("goodreads");
      var name = "";
      var cursor = db.collection('authors').find({author_id:author_id});

      cursor.each(function(err, item) {
        if(item!==null){
          name = item.name;
          data.push(item)
          res.json(data)
        }
        });

        client.close();

  });
});


router.get('/books/:book_id/series', function(req, res) {
  
  var book_id = req.params.book_id;

  MongoClient.connect(url, function(err, client) {

      var db = client.db("goodreads");
      var cursor = db.collection('books').aggregate([
        {
            $match: {
                book_id: book_id
            }
        }, {
            $lookup: {
                from: "books",
                localField: "series",
                foreignField: "series",
                as: "series"
            }
        }, {
            $project: {
                _id: 0,
                title: "$series.title"
            }
        }, {
          $unwind: "$title"
        }
      ]).toArray(function(err,items){
        res.json(items);
      });

      client.close();

  });
});

router.get('/authors/:author_id/books', function(req, res) {
  var data = [];

  var author_id = req.params.author_id;

  MongoClient.connect(url, function(err, client) {

      var db = client.db("goodreads");
      var cursor = db.collection('books').aggregate([
        {
        $match: {
            "authors.author_id": author_id
            }
        }
      ]).toArray(function(err,items){
        res.json(items);
    });

  });
});



router.get('/authors/names', function(req, res) {
  var data = [];
  MongoClient.connect(url, function(err, client) {

      var db = client.db("goodreads");
      var name = "";
      var cursor = db.collection('authors').aggregate([
           {$group:
                  {_id:0, names: {$push: {name: "$name" }}}
           },
          {
            $sort: {average_rating: -1}
          },
          {
            $limit: 15
          }
      ]);

      cursor.each(function(err, item) {
        if(item!==null){
          res.json(item.name)
        }
        });

      client.close();

  });
});



router.get('/top_authors', function(req, res)   {
  var data = [];
  MongoClient.connect(url, function(err, client) {

  console.log("Hello? I can't reach this?");
  MongoClient.connect(url, function(err, client) {
    var db = client.db("goodreads");

    db.collection('authors').aggregate([
        {
          $match: 
            {
              "text_reviews_count": { $nin: [ "1", "2", "3", "4", "5", "6", "7", "8", "9" ]}
            }
        },
        {
          $sort: {average_rating: -1}
        },

        {
          $limit: 15
        }
    ]).toArray(function(err,items){
      
      res.json(items);

    });
  });
});
});

// router.get('/authors/top_authors', function(req, res)   {

//   console.log("Hello world");

//   MongoClient.connect(url, function(err, client) {

//     var db = client.db("goodreads");
//     db.collection('authors').aggregate([
//         {
//           $match: 
//             {
//               "text_reviews_count": { $nin: [ "1", "2", "3", "4", "5", "6", "7", "8", "9" ]}
//             }
//         },
//         {
//           $sort: {average_rating: -1}
//         },

//         {
//           $limit: 15
//         }
//     ]).toArray(function(err,items){
//       console.log(err);
//       console.log(items);
//       var names = [];
//       for (var i = 0; i < items.length; i++) {
//         names[i] = items[i].name;
//       }
//       res.json(names);
//     });


//     client.close();

//   });
// });

router.get('/books/:book_id/usersread', function(req, res)   {
  var book_id = req.params.book_id;

  var data = [];
  MongoClient.connect(url, function(err, client) {

    var db = client.db("goodreads");
    var name = "";
    var cursor = db.collection('user_interactions').aggregate([
         {
        $match: 
        {
            book_id: book_id
        }
    }, {
        $project: {
            _id: 0,
            user_id: "$user_id",
            book_ids: "$book_id",
            book_title: "$title"
        }
    }, {
        $lookup: {
          from: "user_interactions",
          localField: "user_id",
          foreignField: "user_id",
          as: "other_users_books"
        }
    }, {
        $unwind: "$other_users_books"
    }, {
        $group: {
            _id: "$other_users_books.book_id",
            count: {$sum: 1}
        }
    }, {
        $project: {
            _id: 0,
            book_ids: "$_id",
            count: "$count"
        }
    }, {
        $lookup: {
          from: "books",
          localField: "book_ids",
          foreignField: "book_id",
          as: "books_titles"
        }
    }, {
        $group: {
            _id: "$books_titles.title"
        }
    }, {
        $project: {
            _id: 0,
            title: "$_id"
        }
    }, {
      $unwind: "$title"
    }
  ]).toArray(function(err,items){
      console.log(items);
      var names = [];
      for (var i = 0; i < items.length; i++) {
        names[i] = items[i].title;
      }
      res.json(names);
    });


    client.close();

  });
});

router.get('/recommendations/get_random_user', function(req, res)   {
  var data = [];
MongoClient.connect(url, function(err, client) {

  var db = client.db("goodreads");
  var name = "";

  var mycursor =  db.collection('user_interactions').aggregate([
    {$sample: {size: 1}}
  ]).toArray(function(err,items){
    console.log(items);
    var names = [];
      for (var i = 0; i < items.length; i++) {
        names[i] = items[i].user_id;
      }
      res.json(names);
  });
  client.close();

  });
});


router.get('/recommendations/:user_id', function(req, res)   {
    var user_id = req.params.user_id;
    var data = [];
  MongoClient.connect(url, function(err, client) {

    var found_user_id = req.params.user_id;

    var db = client.db("goodreads");
    db.collection('user_interactions').aggregate([
      {
          $match: {
              user_id: found_user_id
          }
      }, {
          $project: {
              _id:0,
              book_id: 1
          }
      }, {
          $lookup: {
            from: "genres_2",
            localField: "book_id",
            foreignField: "book_id",
            as: "books_genres"
          }
      }, {
          $project: {
              _id:0,
              genres_obj: {$arrayElemAt: ["$books_genres", 0]},
          }
      }, {
          $project: {
              _id:0,
              genres_arr: {$objectToArray: "$genres_obj.genres"}
          }
      }, {
          $unwind: "$genres_arr"
      }, {
          $project: {
              _id:0,
              genres: "$genres_arr.k",
              count: "$genres_arr.v"
          }
      }, {
          $group: {
              _id: "$genres",
              count: {$sum: {$toInt: "$count"}}
          }
      }, {
          $project: {
              _id:0,
              genre: "$_id",
              total_count: "$count"
          }
      }, {
          $sort: {total_count: -1}
      }, {
          $group: {
              _id: "$genres",
              genre_array: {$push: "$genre"}
          }
      }, {
          $project: {
              _id: 0,
              genre_array: 1
          }
      }, {
        $unwind: "$genre_array"
      }
    ]).toArray(function(err, items) {
      console.log("Hello world?");
      console.log(items);
      res.json(items);
    });

    // console.log(cursor);

    // cursor.each(function(err, item) {
    //   console.log(err);
    //   console.log(item);
    // })    

  })
});


// router.get('/recommendations/:user_id', function(req, res)   {
//     var user_id = req.params.user_id;
//     var data = [];
//   MongoClient.connect(url, function(err, client) {

//     var db = client.db("goodreads");
//     var name = "";
//     var cursor = db.collection('user_interactions').aggregate([
//         {
//             $match: {
//                 user_id: '8842281e1d1347389f2ab93d60773d4d'
//             }
//         }, {
//             $project: {
//                 _id:0,
//                 book_id: 1
//             }
//         }, {
//             $lookup: {
//               from: "genres",
//               localField: "book_id",
//               foreignField: "book_id",
//               as: "books_genres"
//             }
//         }, {
//             $project: {
//                 _id:0,
//                 genres_obj: {$arrayElemAt: ["$books_genres", 0]},
//             }
//         }, {
//             $project: {
//                 _id:0,
//                 genres_arr: {$objectToArray: "$genres_obj.genres"}
//             }
//         }, {
//             $unwind: "$genres_arr"
//         }, {
//             $project: {
//                 _id:0,
//                 genres: "$genres_arr.k",
//                 count: "$genres_arr.v"
//             }
//         }, {
//             $group: {
//                 _id: "$genres",
//                 count: {$sum: {$toInt: "$count"}}
//             }
//         }, {
//             $project: {
//                 _id:0,
//                 genre: "$_id",
//                 total_count: "$count"
//             }
//         }, {
//             $sort: {total_count: -1}
//         }, {
//             $group: {
//                 _id: "$genres",
//                 genre_array: {$push: "$genre"}
//             }
//         }, {
//             $project: {
//                 _id: 0,
//                 genre_array: 1
//             }
//         }    
//   ]).toArray(function(err,items){
//       console.log(items);
//       var names = [];
//       for (var i = 0; i < items.length; i++) {
//         names[i] = items[i].genre_array;
//       }
//       res.json(names);
//     });


//     client.close();

//   });
// });


module.exports = router;