var app = angular.module('angularjsNodejsTutorial', []);
var array = angular.module('array', []);



// Controller for the Recommendations
app.controller('recommendationsController', function($scope, $http) {
  $scope.getRecommendation = function (user) {

    var user_id = user;

    $http({
      url: '/recommendations/' + user_id,
      method: 'GET'
    }).then(res => {
      console.log(res.data);
      $scope.recommendations = res.data;
    }, error => {
      console.log("error in recommendations ", error);
    });

  }

    /*
    $http({
      url: '/recommendations/get_recommendation',
      method: 'GET'
    }).then(res => {
      console.log(res.data);
      $scope.recommendations = res.data;
    }, error => {
      console.log("error in authors ", error);
    });*/

    $http({
      url: '/recommendations/get_random_user',
      method: 'GET'
    }).then(res => {
      console.log()
      console.log(res.data);
      $scope.random_user = res.data;
    }, error => {
      console.log("error in random_user ", error);
    });

}); 

app.controller('dashboardController', function($scope, $http) {
/*returns json array. To get name do authors_books.name*/
  $http({
    url: '/authors/names',
    method: 'GET'
  }).then(res => {
    console.log("Authors names: ", res.data),
    $scope.authors_books = res.data;
  }, error => {
    console.log("error in authors ", error);
  });


  $http({
    url: '/top_authors',
    method: 'GET'
  }).then(res => {
    $scope.top_authors = res.data;
  }, error => {
    console.log("error in authors ", error);
  });
  
  $scope.usersRead = function (b) {

    var book_id = b;

    $http({
      url: '/books/' + book_id +'/usersread',
      method: 'GET'
    }).then(res => {
      console.log(res.data);
      $scope.users_read = res.data;
    }, error => {
      console.log("error in users_read ", error);
    });

  }

  /*array of reviews. displayed as is.*/
  $http({
    url: '/books/reviews',
    method: 'GET'
  }).then(res => {
    console.log("Reviews of a book: ", res.data),
    $scope.books_reviews = res.data;
  }, error => {
    console.log("error in getting book reviews ", error);
  });

  /*series written by the author. returns array of series_id. displaed as is*/
  $http({
    url: '/authors/allseries',
    method: 'GET'
  }).then(res => {
    console.log("Series by an author: ", res.data),
    $scope.all_series = res.data;
  }, error => {
    console.log("error in getting all series ", error);
  });

  /*returns list of book_ids read by the user*/
  $http({
    url: '/users/interactions',
    method: 'GET'
  }).then(res => {
    console.log("Interactions from a user: ", res.data),
    $scope.user_interactions = res.data;
  }, error => {
    console.log("error in getting user interactions ", error);
  });

  /**/
  $http({
    url: '/books/genres/all_genres',
    method: 'GET'
  }).then(res => {
    console.log("All genres of books: ", res.data),
    $scope.all_genres = res.data;
  }, error => {
    console.log("error in getting all genres ", error);
  });

    /* get the info for a particular book */
  $http({
    url: '/books/:book_id',
    method: 'GET'
  }).then(res => {
    console.log("Book info: ", res.data),
    $scope.book_info = res.data;
  }, error => {
    console.log("Error in getting book info ", error);
  });

  $scope.showBooksOfGenres = function (g) {

    $http({
      url: '/books/genres/top_of_' + g,
      method: 'GET'
    }).then(res => {

      console.log("Top books of " + g + ": ", res.data);
      $scope.top_books_of_genre = res.data;
    }, err => {
      console.log("Top books of genre ERROR: ", err);        
      console.log(g);
      console.log(genre);
    });
  }

  $scope.search = {SearchId: null};
  $scope.searchBooks = function (s) {

    var query = encodeURIComponent(s);

    $http({
      url: '/search/books/' + query,
      method: 'GET'
    }).then(res => {
      console.log("Search results for " + s + ": ", res.data);
      $scope.selected_book = "";
      $scope.users_read = "";
      $scope.book_search = res.data;
    }, err => {
      console.log("Error in searching for a book: ", err);
    });

  }

  $scope.showBook = function (b) {

    var book_id = b.book_id;

    $http({
      url: '/books/' + book_id,
      method: 'GET'
    }).then(res => {
      console.log("Book details returned for " + b.title + ": ", res.data);
      $scope.book_search = "";
      $scope.selected_book = res.data;
    }, err => {
      console.log("Error in showing searched book: ", err);
      console.log("Book searched is: ", b);
      console.log("Book_id is: ", book_id);
    });

    $http({
      url: '/books/' + book_id + '/authors',
      method: 'GET'
    }).then(res => {
      console.log("Author info for authors of " + book_id + ": ", res.data);
      $scope.selected_book_authors = res.data; 
    }, err => {
      console.log("Error in getting authors of book " + book_id + ": ", err);
    });

    $http({
      url: '/books/' + book_id + '/series',
      method: 'GET'
    }).then(res => {
      console.log("Other books in this book's series: ", res.data);
      $scope.selected_book_others_in_series = res.data;
    }, err => {
      console.log("Error in getting other books in book series " + book_id + ": ", err);
    });

    $http({
      url: '/books/' + book_id + '/reviews',
      method: 'GET'
    }).then(res => {
      console.log("Reviews of book " + book_id + ": ", res.data);
      $scope.selected_book_reviews = res.data;
    }, err => {
      console.log("Error in getting reviews of " + book_id + ": ", err);
    })

  }

  $scope.searchAuthors = function (s) {

    var query = encodeURIComponent(s);

    $http({
      url: '/search/authors/' + query,
      method: 'GET'
    }).then(res => {
      console.log("Search results for " + s + ": ", res.data);
      $scope.selected_author = "";
      $scope.author_search = res.data;
    }, err => {
      console.log("Error in searching for an author: ", err);
    });

  }

  $scope.showAuthor = function (a) {

    var author_id = a.author_id;

    $http({
      url: '/authors/' + author_id,
      method: 'GET'
    }).then(res => {
      console.log("Author details returned for " + a.name + ": ", res.data);
      $scope.author_search = "";
      $scope.selected_author = res.data;
    }, err => {
      console.log("Error in showing searched author: ", err);
      console.log("Author searched is: ", a);
      console.log("Author_id is: ", author_id);
    });

    $http({
      url: '/authors/' + author_id + '/books',
      method: 'GET'
    }).then(res => {
      console.log("Books by author with id " + author_id + ": ", res.data);
      $scope.selected_author_books = res.data;
    }, err => {
      console.log("Error in getting books by an author: ", err);
      console.log("Author id is: " + author_id);
    });

  }


  $scope.searchReddit = function (s) {

    var query = encodeURIComponent(s);

    $http({
      url: '/search/reddit/' + query,
      method: 'GET'
    }).then(res => {
      console.log("Reddit comment search results for " + s + ": ", res.data);
      $scope.reddit_search = res.data;
    }, err => {
      console.log("Error in searching for an author: ", err);
    });

  }

  $scope.getComment = function (comment_id) {

    console.log(comment_id);
    var id_without_prefix = comment_id.substr(3, comment_id.length);

    $http({
      url: '/reddit/' + id_without_prefix,
      method: 'GET'
    }).then(res => {
      console.log("Found comment with id " + id_without_prefix + ": ", res.data);
      $scope[id_without_prefix] = res.data;
    }, err => {
      console.log("error getting reddit comment: ", err);
    });

  }

  $scope.getChildren = function (comment) {

    var comment_id = comment.id;

    $http({
      url: '/reddit/children/' + comment_id,
      method: 'GET'
    }).then(res => {
      console.log("Found children of comment with id " + comment_id + ": ", res.data);
      $scope.children = res.data;
    }, err => {
      console.log("error getting reddit comment: ", err);
    });

  }



  /*returns entire json.
  Fields needed:
  isbn
  text_reviews_count
  average_rating
  description
  format
  publisher
  num_pages
  publication_day
  publication_month
  publication_year
  image_url
  ratings_count
  title
*/
  // $http({
  //   url: '/search/book',
  //   method: 'GET'
  // }).then(res => {
  //   console.log("Search book result: ", res.data),
  //   $scope.book = res.data;
  // }, error => {
  //   console.log("error in authors ", error);
  // });



  /*returns book along with author data.
  Fields needed for book:
  isbn
  text_reviews_count
  average_rating
  description
  format
  publisher
  num_pages
  publication_day
  publication_month
  publication_year
  image_url
  ratings_count
  title
  For author:
  author_id.author_id
*/
  $http({
    url: '/search/book/author',
    method: 'GET'
  }).then(res => {
    console.log("Authors given title: ", res.data),
    $scope.book_authors = res.data;
    $scope.users_read = "";
  }, error => {
    console.log("error in authors ", error);
  });

 /*get authors info. entire json returned
 Fields:
 average_rating
 text_reviews_count
 name
 ratings_count
 */
  $http({
    url: '/authors',
    method: 'GET'
  }).then(res => {
    console.log("Authors: ", res.data),
    $scope.authors = res.data;
  }, error => {
    console.log("error in authors ", error);
  });

 /*get all the titles written by an author. array of titles. loop through and display as is*/
  $http({
    url: '/authors/books',
    method: 'GET'
  }).then(res => {
    console.log("Authors books: ", res.data),
    $scope.authors_books = res.data;
  }, error => {
    console.log("error in authors ", error);
  });

  /*series an author has written. array of titles*/
  $http({
    url: '/books/series',
    method: 'GET'
  }).then(res => {
    console.log("Books series: ", res.data),
    $scope.books_series = res.data;
  }, error => {
    console.log("error in series ", error);
  });






// What does this do? 
  $http({
    url: '/abooks/genres',
    method: 'GET'
  }).then(res => {
    console.log("Author: ", res.data),
    $scope.books_series = res.data;
  }, error => {
    console.log("error in series ", error);
  });





});


