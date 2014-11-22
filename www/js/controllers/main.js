angular.module('main', [])

.controller('AppCtrl', function($scope, $ionicModal, $firebase,  $ionicNavBarDelegate, $filter,
  $state, $rootScope, capturePictureSrvc, defaultImage, $timeout) {


  $scope.loginData = {username: "", password: "", passwordConfirmation: ""};
  $scope.URL = "https://peopler.firebaseio.com"
  $scope.defaultImage = defaultImage;
  var ref = new Firebase($scope.URL)


  $scope.goBack = function() {
    if($ionicNavBarDelegate.getTitle() === 'Unread Messages'){

      $state.go('app.clublists')
    }
    else{
      $ionicNavBarDelegate.back();
    }
  };


  $scope.getPreviousTitle = function() {

    if($ionicNavBarDelegate.getTitle() === 'Unread Messages'){
      return 'My Clubs'
    }
    else if($ionicNavBarDelegate.getTitle() === 'My Clubs'){
      return 'msgs';
    }
    else{
      return $filter('limitTo')($ionicNavBarDelegate.getPreviousTitle(), 6)
    }  
  };


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
    
    $scope.currentUser = ""
    ref.unauth(function () {
     $state.reload();
     $state.go('app.request')      
    })
    
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
      
      $scope.currentUser = currentUser;
    } else {

    }
  });


  $scope.imageData = ""; // if picture is taken use that, otherwise use empty string
  $scope.takePicture = function(){
     capturePictureSrvc.takePicture().then(function(imageMelse) {
      $scope.imageData = imageMelse;
    })
  }


  // Perform the login action when the user submits the login form
  $scope.doLogin = function($event) {

  
  // more validation                                                          
  if ($scope.loginData.username === "" || $scope.loginData.password === "" || 
      // a hack agains angulars validation, it gives undefined for non-email string
      !angular.isDefined($scope.loginData.username)) {

    $scope.loginError = "email or password is required";

    //$scope.$apply();

    return;
  }

   // console.log($scope.loginData)
    $event.preventDefault();

  $scope.loading = true;
  ref.authWithPassword({
      email: $scope.loginData.username,
      password: $scope.loginData.password

    }, function(error, currentUser) {

      if(error === null){

        $scope.currentUser = currentUser;
        

        if($scope.imageData !== null){
          //if someone change profile picture or add new one from longin page

          ref.child('users/' + currentUser.uid).update({
            avatar: $scope.imageData
          }, function(){
            $scope.imageData = "" //clears image after update
          });
        }

        // clean up and route after success longin
        $state.go('app.clublists')
        $scope.loginData = {};
       
        $scope.loginModal.hide();
        $timeout(function() {
           $scope.loading = false; //this has to come after modal.hide() to prevent async effects
        }, 10);
       


      }else {

        console.log(error.message)
        $scope.loginError = error.message;
        $scope.loading = false;
        $scope.$apply();

      }

    });

  }

  // Perform the login action when the user submits the login form
  $scope.doSignup = function() {

      //check password confirmation
      if($scope.loginData.passwordConfirmation !== $scope.loginData.password ||
          // a hack agains angulars validation, it gives undefined for non-email string
        !angular.isDefined($scope.loginData.username)){

        $scope.signupError = "Password confirmation does not match";
        
        return;
      }

      // more validation
      if ($scope.loginData.username === "" || $scope.loginData.password === "" || 
          $scope.loginData.passwordConfirmation === "" || 
        // a hack agains angulars validation, it gives undefined for non-email string
        !angular.isDefined($scope.loginData.username)) {
        $scope.signupError = "email or password and confirmation is required";
        //$scope.$apply();
        return;
      }

        $scope.loading = true
         // Create user 
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
              }, currentUser.password.email, function(){

                   $scope.loginData = {};
                   $scope.imageData = ""; //clean image buffer
              });
           
              $state.go('app.clublists')
              $scope.loginModal.hide();

                 $timeout(function() {
                     $scope.loading = false; //this has to come after modal.hide() to prevent async effects
                  }, 10);
                 


            }     

            else 
            {
              console.log(loginError.message)
              $scope.loading = false;
              $scope.signupError = loginError.message;
              $scope.$apply();
            }

          })
   }

    else{

      $scope.signupError = error.message;
      $scope.loading = false;
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