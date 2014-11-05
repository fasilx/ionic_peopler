angular.module('main', [])

.controller('AppCtrl', function($scope, $ionicModal, $firebase, $firebaseSimpleLogin, 
                                $state, $rootScope, capturePictureSrvc) {
  // Form data for the login modal
  $scope.loginData = {};
  $scope.URL = "https://peopler.firebaseio.com"

  var dataRef = new Firebase($scope.URL);
  var loginObj = $firebaseSimpleLogin(dataRef)

  loginObj.$getCurrentUser().then(function(currentUser){

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
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    $scope.logout = function(){

      $firebaseSimpleLogin(dataRef).$logout()
        $state.go('intro')
      

    }

    $rootScope.$on("$firebaseSimpleLogin:login", function(event, user) {
      //console.log("firebaseSimpleLogin login")
      $scope.user = user;
      $state.reload();
     // console.log($scope.user)
   });
    // Upon successful logout, reset the user object
    $rootScope.$on("$firebaseSimpleLogin:logout", function(event) {
      $scope.user = null;
      console.log("firebaseSimpleLogin logout")
      console.log($scope.user)

    });



  $scope.imageData = ""; // if picture is taken use that, otherwise use empty string
  $scope.takePicture = function(){
      
       capturePictureSrvc.takePicture().then(function(imageMelse) {
      $scope.imageData = imageMelse;
      
  })
}


      // Perform the login action when the user submits the login form
      $scope.doLogin = function() {

       $firebaseSimpleLogin(dataRef).$login("password", {
        email: $scope.loginData.username,
        password: $scope.loginData.password

      }).then(function(user) {
       // console.log($scope.user)
       // $location.path('app/clublists')
        $state.go('app.clublists')
       $scope.modal.hide();

     }, function(error) {
       console.error("Login failed: ", error);
     });

    }

      // Perform the login action when the user submits the login form
      $scope.doSignup = function() {

        // console.log($scope.user);
        // Create user 
        loginObj.$createUser($scope.loginData.username, $scope.loginData.password).then(function(user){

          dataRef.child('users').child(user.id).setWithPriority({
            displayName: user.email, /* this may not work with other providers than "password" provider */
            provider: user.provider,
            provider_id: user.id,
            avatar: $scope.imageData
          }, user.email);

        // login in the created user
        loginObj.$login("password", {email: $scope.loginData.username, password: $scope.loginData.password})
        .then(function(user) {
          $state.go('app.clublists')
          $scope.modal.hide();
          $scope.imageData = "" //clean image holder

        }, function(error) {
          //console.error("Login failed: ", error);
        });

      });

      }


    })