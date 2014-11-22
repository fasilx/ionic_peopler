angular.module('others', [])



.controller("CreateCtrl", function($scope, $firebase,  $state, capturePictureSrvc) {

  var clubRef = new Firebase($scope.URL + "/clubs");
  var ref = new Firebase($scope.URL);

  $scope.club = {name: "", description: ""}
  $scope.imageData = ""; // if picture is taken use that, otherwise use empty string
  
  $scope.takePicture = function(){
   capturePictureSrvc.takePicture().then(function(imageMelse) {
   $scope.imageData = imageMelse;
  })
 }




 $scope.createClub = function(club){

  if (club.name === "" || club.description === "") {
    $scope.creationError = "Name and description of Club is required";
    //$scope.$apply();
    return;
  }

  ref.onAuth(function(currentUser){

    if(currentUser === null) return;
      //currentUser.id = currentUser.uid.split(":")[1]
      var titles = ['CEO', 'COO', 'CFO', 'CTO', 'VP MARKETING', 'VP HR', 'VP PR', 'VP LAW', 'MEMBER', 'GUEST']; 
      $scope.imageData = $scope.imageData ||  $scope.defaultImage;

    //club.name and club.description, etc... are found from the $scope of the main.js, the global scope context
    var newChildRef = clubRef.push({name: club.name, titles: titles, description: club.description, createdAt: Firebase.ServerValue.TIMESTAMP,
                                    avatar: $scope.imageData, founders_id: currentUser.uid, founders_name: currentUser.password.email},
      function(error) {
      //console.log("added record with id " + newChildRef.key());
      if (error === null){


        var clublistId = newChildRef.key();
        var userId = currentUser.uid
        var messageRef = new Firebase($scope.URL + "/messages/" + clublistId)
        var memberRef = new Firebase($scope.URL + "/clubs/" + clublistId)

        memberRef.update({members: userId}, function(){
         var clubMemberIdRef = new Firebase($scope.URL + "/clubs/" + clublistId + "/members/" + userId)
         var userIdRef = new Firebase($scope.URL + "/users/" + currentUser.uid + "/clubs")

         clubMemberIdRef.update({position: ['FOUNDER'], email: currentUser.password.email, messagebox: "init"})
         messageRef.update({all: "init", group: "init", person: "init"})

         var obj = {};
         obj[clublistId] = true;
         userIdRef.update(obj) 

         $scope.createModal.hide(); 
        //make sure to remove modal after use.Or it will linger cause uninteded stuff
        $scope.$on('$destroy', function() {
          $scope.createModal.remove();
        });

        $state.go('app.single', {clublistId: newChildRef.key()})
      }) 
      }
    });
  })
  }

  //this scope is in www/js/controllers/main.js
})


.controller('ClublistsCtrl', function($scope,  $state, $timeout, $ionicModal, $ionicLoading) {


          //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
          var ref = new Firebase($scope.URL);

          $scope.list = [];
          
          var clubRef = new Firebase($scope.URL + "/clubs")

      

         $scope.editMyClub = function(editableItems){


          $scope.club = {name: "", description: ""}

              ref.onAuth(function(currentUser){


                   $ionicLoading.show({
                    template: '<i class="ion-loading-c" style="font-size:200%;z-index:10;"></i>'
                  });

                  
                clubRef.child(editableItems.id).on('value', function(myClub){
                  //console.log(myClub.val())

                  $ionicLoading.hide();

                    if(myClub.val().founders_id === currentUser.uid){

          
                           $scope.clubInfo = myClub.val();
                           $scope.clubKey = myClub.key();
              

                           // $scope.$apply();

                

                    }

                })

              })

            $scope.editableItems = editableItems;
            $scope.openEditMyClubModal();
          
         }


         $scope.changeClubProfile = function(clubKey,club){

              
             console.log($scope.imageDatas)

              if(club === null && $scope.imageData === ''){
                // $scope.errorMessage = "Please add new name or description"
                //console.log("case 0")
                $scope.closeEditMyClubModal();
                return;
              }


              ref.onAuth(function(currentUser){
                //console.log($scope.clubInfo)

                    clubRef.child(clubKey)
                           .update({name: club.name || $scope.clubInfo.name, 
                                    description: club.description || $scope.clubInfo.description,
                                    avatar: $scope.imageData || $scope.clubInfo.avatar}, function(done){

                             
                              // console.log("case 1")
                              $scope.closeEditMyClubModal();
                              $scope.imageData = ""
                              $scope.club = {}
                              $scope.clubInfo = {}

                             })


              })

         }


  $scope.deleteClub = function(clubKey){

      var r = confirm("Are you sure you want to delete this club?");
      if (r == true) {
          // x = "You pressed OK!";
          var userRef = new Firebase($scope.URL + "/users")
          userRef.once("value", function(dataSnapshot){
            dataSnapshot.forEach(function(childSnapshot){
              
              
              if(childSnapshot.hasChild( "clubs/" + clubKey)){
                 var location = Object.keys(childSnapshot.val().clubs).indexOf(clubKey)

                 userRef.child(childSnapshot.key() + "/clubs/" + clubKey).remove(function(){

                  $scope.closeEditMyClubModal();
                  console.log(clubKey + " removed from all current users")

                  })

              }
             
              // userRef.child(val.clubs + '/' + clubKey).remove(function(){
              //   console.log(clubKey + " removed from all current users")
              // })

            });

          })
          

      } else {
          // x = "You pressed Cancel!";
      }
  }

  ref.onAuth(function(currentUser){
         // currentUser.id = currentUser.uid.split(":")[1]
              if(currentUser === null) return;

              $scope.goToMessages = function(clublistId, count){
                $state.go('app.single', {clublistId: clublistId})
              }

              
              var userIdClubRef = new Firebase($scope.URL + "/users/" + currentUser.uid + "/clubs")

                 $ionicLoading.show({
                    template: '<i class="ion-loading-c" style="font-size:200%"></i>'
                  });



              userIdClubRef.on('value', function(res){

                $ionicLoading.hide();

              if(res.val()){
                var clubkeys = Object.keys(res.val())
                 // console.log(clubkeys.length)

                
                 //else {
               //     $scope.loading = false;  //...../...../...../...../
               //   }
                 
                 angular.forEach(clubkeys, function(key, val){
                  //alert("adding.....")
                  //console.log(childSnapshot.key())

                  clubRef.child(key).once('value', function(snap){


                      //console.log(snap.val())
                      $scope.loading = false;  //...../...../...../...../


                      var item = []
                      item.id = snap.key()
                      item.founder = snap.val().founders_name
                      item.createdAt = snap.val().createdAt
                      item.name = snap.val().name
                      item.description = snap.val().description
                      item.avatar = snap.val().avatar

                     // Object.keys() can be called on non-object, so protect that by if...else
                     if(angular.isObject(snap.val().members[currentUser.uid].messagebox)){
                      item.messageboxCount = Object.keys(snap.val().members[currentUser.uid].messagebox).length
                    }else{
                      item.messageboxCount = 0
                    }

                    item.memberCount = Object.keys(snap.val().members).length;
                    var position = snap.val().members[currentUser.uid].position
                    item.position = position.toString()

                    if ((position.indexOf('FOUNDER') > -1 || position.indexOf('VP HR') > -1 ) && angular.isDefined(snap.val().requests)){
                     item.requestCount = Object.keys(snap.val().requests).length;  

                   }

                   $timeout(function(){
                   $scope.$apply(function(){
                     $scope.list.push(item);

                        $scope.expandPhoto = function(displayItem){

                              $scope.displayItem = displayItem; 
                              $scope.openPhotoModal();
                            
                           }
                       })

                       })

                     })


      });

  } // end if 

});


})



        $ionicModal.fromTemplateUrl('templates/photo-modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.photoModal = modal;
        });
        $scope.openPhotoModal = function() {
          $scope.photoModal.show();
        };
        $scope.closePhotoModal = function() {
          $scope.photoModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
          $scope.photoModal.remove();
        });
        // Execute action on hide modal
        $scope.$on('photoModal.hidden', function() {
          // Execute action
        });
        // Execute action on remove modal
        $scope.$on('photoModal.removed', function() {
          // Execute action
        });


        $ionicModal.fromTemplateUrl('templates/editMyClub-modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.editMyClubModal = modal;
        });
        $scope.openEditMyClubModal = function() {
          $scope.editMyClubModal.show();
        };
        $scope.closeEditMyClubModal = function() {
          $scope.editMyClubModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
          $scope.editMyClubModal.remove();
        });
        // Execute action on hide modal
        $scope.$on('editMyClubModal.hidden', function() {
          // Execute action
        });
        // Execute action on remove modal
        $scope.$on('editMyClubModal.removed', function() {
          // Execute action
        });






})

.controller('IntroCtrl', function($scope, $state, $firebaseSimpleLogin) {

  // var dataRef = new Firebase($scope.URL);

  //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
  var ref = new Firebase($scope.URL);

  $scope.skip = function(){

    $state.go("app.request")
  }

 //  ref.onAuth(function(currentUser){


 //   if(currentUser !== null){
 //     $state.go('app.clublists')
 //   }

 // });


})


.controller('UsersCtrl', function($scope, $state, $firebaseSimpleLogin) {

  // var dataRef = new Firebase($scope.URL);

  //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
  var ref = new Firebase($scope.URL);
  var userRef = new Firebase($scope.URL + "/users")

    ref.onAuth(function(currentUser){

        $scope.users = []
        userRef.once('value', function(dataSnapshot){

          dataSnapshot.forEach(function(childSnapshot){

                var item = childSnapshot.val()
                 item.id = childSnapshot.key()
                 $scope.users.push(item);


          });

            
        })

   });


})

.controller('RequestCtrl', function($scope, $state,  $firebase, $ionicModal, $ionicLoading) {

 var ref = new Firebase($scope.URL);
 var clubRef = new Firebase($scope.URL + "/clubs")

 $scope.clubs = [];


 ref.onAuth(function(currentUser){

  $scope.currentUser = currentUser;

       $ionicLoading.show({
          template: '<i class="ion-loading-c" style="font-size:200%"></i>'
        });

      clubRef.once('value', function(dataSnapshot){
      
          $ionicLoading.hide();

          dataSnapshot.forEach( function(childSnapshot){
            

          // if(!childSnapshot.child('members').hasChild(currentUser.uid)){

            var item = childSnapshot.val()
            item.id = childSnapshot.key()
            item.memberCount = childSnapshot.child('members').numChildren();


              if(currentUser && childSnapshot.hasChild( "requests/" + currentUser.uid )){
                item.pendding = true;
              }

              $scope.$apply(function(){
              $scope.clubs.push(item);

             

              // $scope.loading = false;

              $scope.expandPhoto = function(displayItem){

                    $scope.displayItem = displayItem; 
                    $scope.openPhotoModal();
                  
                 }


              })
          //}

        });


    })

    
 })


 $scope.success = "";
 $scope.sending = false;
  $scope.joinRequest = function(clublistId){

  ref.onAuth(function(currentUser){

      if(!currentUser){

        $scope.loginModal.show();
        return;
      }
   
      var item = {}
      // this will add .. simplelogin:124:email@email.com at this location
      item[currentUser.uid] = currentUser.password.email;
      clubRef.child(clublistId + "/requests").update(item,function(error){

        if(error === null){
          $scope.$apply(function(){
            $scope.success = clublistId;
            $scope.sending = false
          })
        }
        else{
          $scope.requestError = error.message;
        }
          
      })
    });
  }




        $ionicModal.fromTemplateUrl('templates/photo-modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.photoModal = modal;
        });
        $scope.openPhotoModal = function() {
          $scope.photoModal.show();
        };
        $scope.closePhotoModal = function() {
          $scope.photoModal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
          $scope.photoModal.remove();
        });
        // Execute action on hide modal
        $scope.$on('photoModal.hidden', function() {
          // Execute action
        });
        // Execute action on remove modal
        $scope.$on('photoModal.removed', function() {
          // Execute action
        });



})



