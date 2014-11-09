angular.module('main', [])

.controller('AppCtrl', function($scope, $ionicModal, $firebase, $firebaseSimpleLogin, 
                                $state, $rootScope, capturePictureSrvc, defaultImage) {
  

  $scope.loginData = {username: "", password: "", passwordConfirmation: ""};
  $scope.URL = "https://peopler.firebaseio.com"
  $scope.defaultImage = defaultImage;
  var ref = new Firebase($scope.URL)

  // ref.onAuth(function(currentUser){



  //    $scope.me = currentUser;
  //    // $state.go('app.clublists')

  //    if(currentUser === null){
  //     $state.go('intro')
  //    }
  //  });




   
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.loginModal = modal;
    });

    
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
      $state.go('intro')
      ref.unauth()
      
    }

    $scope.closeCreateClubModal = function() {
      $scope.createModal.hide();
    };

    $scope.openCreateClubModal = function() {
      $scope.createModal.show();
    };


    $scope.createClub = function(){
      $scope.createModal.hide();
    }


    ref.onAuth(function(currentUser) {
      if (currentUser) {
        // user authenticated with Firebase
        $scope.currentUser = currentUser;

        console.log("User ID: " + currentUser.uid + ", Provider: " + currentUser.provider);
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
  $scope.doLogin = function($event) {

  // more validation
  if ($scope.loginData.username === "" || $scope.loginData.password === "") {
    $scope.error = "email or password is required";
    //$scope.$apply();
    return;
  }
    //$event.preventDefault();

    ref.authWithPassword({
              email: $scope.loginData.username,
              password: $scope.loginData.password

      }, function(error, currentUser) {

      if(error === null){
        console.log(error)
        $scope.currentUser = currentUser;
        

        if($scope.imageData !== null){
          //if someone change profile picture or add new one from longin page

            ref.child('users/' + currentUser.uid).update({
            avatar: $scope.imageData
             });
        }


        $state.go('app.clublists')
        $scope.loginModal.hide();

      }else {

        console.log(error.message)
        $scope.error = error.message;
        $scope.$apply();
    
      }

     });

    }

      // Perform the login action when the user submits the login form
$scope.doSignup = function() {

          //check password confirmation
            if($scope.loginData.passwordConfirmation !== $scope.loginData.password){

              $scope.error = "Password confirmation does not match";
              $scope.$apply();
              return;
            }

                  // more validation
            if ($scope.loginData.username === "" || $scope.loginData.password === "" || $scope.loginData.passwordConfirmation === "") {
              $scope.error = "email or password and confirmation is required";
              //$scope.$apply();
              return;
            }


        // // console.log($scope.user);
        // // Create user 
         ref.createUser({email: $scope.loginData.username, password: $scope.loginData.password}, function(error){

             if(error === null){

                  ref.authWithPassword({
                  email: $scope.loginData.username,
                  password: $scope.loginData.password

                }, function(loginError, currentUser) {

                 if(loginError === null){
                    
                    $scope.currentUser = currentUser;

                   $scope.imageData = $scope.imageData ||  $scope.defaultImage;
                    ref.child('users').child(currentUser.uid).setWithPriority({
                      displayName: currentUser.password.email, /* this may not work with other providers than "password" provider */
                      provider: currentUser.provider,
                      provider_id: currentUser.uid,
                      avatar: $scope.imageData
                    }, currentUser.password.email);

                  $state.go('app.clublists')
                  $scope.loginModal.hide();


                    }     
        
                  else 
                  {
                    console.log(loginError.message)
                    $scope.error = loginError.message;
                    $scope.$apply();
                    }
              
                })

            }

            else{

              $scope.error = error.message;
              console.log(error.message)
              $scope.$apply();
           }

              });

    }

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