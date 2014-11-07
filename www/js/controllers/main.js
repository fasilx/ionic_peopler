angular.module('main', [])

.controller('AppCtrl', function($scope, $ionicModal, $firebase, $firebaseSimpleLogin, 
                                $state, $rootScope, capturePictureSrvc, defaultImage) {
  // Form data for the login modal
  $scope.loginData = {};
  $scope.URL = "https://peopler.firebaseio.com"



  $scope.defaultImage = defaultImage;

  // var dataRef = new Firebase($scope.URL);
  //var ref = $firebaseSimpleLogin(dataRef)
  var ref = new Firebase($scope.URL)

  ref.onAuth(function(currentUser){



     $scope.me = currentUser;
     // $state.go('app.clublists')

     if(currentUser === null){
      $state.go('intro')
     }
   });




    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.loginModal = modal;
    });

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/create.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.createModal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.loginModal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.loginModal.show();
    };

    $scope.logout = function(){

      ref.unauth()
        $state.go('intro')
      
    }



    // Triggered in the login modal to close it
    $scope.closeCreateClubModal = function() {
      $scope.createModal.hide();
    };

    // Open the login modal
    $scope.openCreateClubModal = function() {
      $scope.createModal.show();
    };


    $scope.createClub = function(){
      $scope.createModal.hide();
    }


    ref.onAuth(function(user) {
      if (user) {
        // user authenticated with Firebase
        $scope.user = user;

        console.log("User ID: " + user.uid + ", Provider: " + user.provider);
      } else {
        // user is logged out

      }
    });

   //  $rootScope.$on("$firebaseSimpleLogin:login", function(event, user) {
   //    //console.log("firebaseSimpleLogin login")
   //    $scope.user = user;
   //    $state.reload();
   //   // console.log($scope.user)
   // });
   //  // Upon successful logout, reset the user object
   //  $rootScope.$on("$firebaseSimpleLogin:logout", function(event) {
   //    $scope.user = null;
   //    console.log("firebaseSimpleLogin logout")
   //    console.log($scope.user)

   //  });



  $scope.imageData = ""; // if picture is taken use that, otherwise use empty string
  $scope.takePicture = function(){
      
       capturePictureSrvc.takePicture().then(function(imageMelse) {
      $scope.imageData = imageMelse;
      
  })
}


      // Perform the login action when the user submits the login form
  $scope.doLogin = function() {

        ref.authWithPassword({
              email: $scope.loginData.username,
              password: $scope.loginData.password

      }, function(error, user) {

      if(error === null){
        $scope.user = user;
        if($scope.imageData !== null){
          //if someone change profile picture or add new one from longin page

            ref.child('users/' + user.uid).update({
            avatar: $scope.imageData
             });
        }


        $state.go('app.clublists')
        $scope.loginModal.hide();

      }else {
        console.log(error.message)
        $scope.errorMessage = error.message;
    
      }

     });

    }

      // Perform the login action when the user submits the login form
      $scope.doSignup = function() {

        // // console.log($scope.user);
        // // Create user 
         ref.createUser({email: $scope.loginData.username, password: $scope.loginData.password}, function(error){


             if(error === null){

                  ref.authWithPassword({
                  email: $scope.loginData.username,
                  password: $scope.loginData.password

                }, function(loginError, user) {

                 if(loginError === null){
                    
                   $scope.imageData = $scope.imageData ||  $scope.defaultImage;
                    ref.child('users').child(user.uid).setWithPriority({
                      displayName: user.password.email, /* this may not work with other providers than "password" provider */
                      provider: user.provider,
                      provider_id: user.uid,
                      avatar: $scope.imageData
                    }, user.password.email);

                  $state.go('app.clublists')
                  $scope.loginModal.hide();


                    }     
        
                  else 
                  {
                    console.log(loginError.message)
                    $scope.errorMessage = error.message;
                    }
              
                })

            }

            else{

              $scope.errorMessage = error;
              console.log(error)
           }

              });
    }



          // if(error === null){



          //  $scope.imageData = $scope.imageData ||  $scope.defaultImage;
          //   ref.child('users').child(user.uid).setWithPriority({
          //     displayName: user.password.email, /* this may not work with other providers than "password" provider */
          //     provider: user.provider,
          //     provider_id: user.uid,
          //     avatar: $scope.imageData
          //   }, user.password.email);

          //   // // login in the created user
          //   //   ref.authWithPassword({email: $scope.loginData.username, password: $scope.loginData.password},
          //   //     function(user) {
          //   //     $scope.user = user;
          //   //     $state.go('app.clublists')
          //   //     $scope.loginModal.hide();
          //   //     $scope.imageData = "" //clean image holder

          //   //   }, function(error) {
          //   //     //console.error("Login failed: ", error);
          //   //   });


          //     // login the created user
          //     $scope.doLogin();


          // }


    


    //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.loginModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('loginModal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('loginModal.removed', function() {
    // Execute action
  });
  $scope.$on('createModal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('createModal.removed', function() {
    // Execute action
  });

      //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.createModal.remove();
  });

  // // Execute action on hide modal
  // $scope.$on('createModal.hidden', function() {
  //   // Execute action
  // });
  // // Execute action on remove modal
  // $scope.$on('createModal.removed', function() {
  //   // Execute action
  // });
  

    })