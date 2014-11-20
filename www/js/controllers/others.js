angular.module('others', [])



.controller("CreateCtrl", function($scope, $firebase, $firebaseSimpleLogin, $state, capturePictureSrvc) {

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
    var newChildRef = clubRef.push({name: club.name, titles: titles, description: club.description, 
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


.controller('ClublistsCtrl', function($scope, $firebaseSimpleLogin, $state, $timeout, $ionicModal) {


          //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
          var ref = new Firebase($scope.URL);

          $scope.list = [];
          
          var clubRef = new Firebase($scope.URL + "/clubs")

   

         $scope.editMyClub = function(editableItems){


          $scope.club = {name: "", description: ""}

              ref.onAuth(function(currentUser){

                clubRef.child(editableItems.id).on('value', function(myClub){
                  //console.log(myClub.val())
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

                // if($scope.imageData !== null && club.name !== null && club.description !== null){
                // clubRef.child(clubKey).update({name: club.name, description: club.description,
                //              avatar: $scope.imageData}, function(done){
                //               console.log("case 1")
                //               $scope.closeEditMyClubModal();
                //               $scope.imageData = ""
                //               $scope.club = {}

                //              })

                // }else if($scope.imageData === null && club.name !== null && club.description !== null)
                // {

                //    clubRef.child(clubKey).update({name: club.name, description: club.description}, function(done){
                //               console.log("case 2")
                //               $scope.closeEditMyClubModal();
                //               $scope.imageData = ""

                //              })

                // }else if ($scope.imageData === null && club.name !== null && club.description === null){
                //       clubRef.child(clubKey).update({name: club.name}, function(done){
                //               console.log("case 3")
                //               $scope.closeEditMyClubModal();
                //               $scope.imageData = ""

                //              })


                // }else if($scope.imageData === null && club.name === null && club.description !== null){

                //         clubRef.child(clubKey).update({description: club.description}, function(done){
                //               console.log("case 4")
                //               $scope.closeEditMyClubModal();
                //               $scope.imageData = ""

                //              })

                // }else if ($scope.imageData !== null && club.name === null && club.description === null){

                //      clubRef.child(clubKey).update({avatar: $scope.imageData}, function(done){
                //               console.log("case 5")
                //               $scope.closeEditMyClubModal();
                //               $scope.imageData = ""

                //              })

                // }else {
                //             console.log("case 6")
                //    $scope.closeEditMyClubModal();
                // }


              })

         }


          // ref.onAuth(function(currentUser){
          //     // clublistId = currentUser.uid.split(":")[1]

            
          //   });



          ref.onAuth(function(currentUser){
         // currentUser.id = currentUser.uid.split(":")[1]
              if(currentUser === null) return;

              $scope.goToMessages = function(clublistId, count){
                $state.go('app.single', {clublistId: clublistId})
              }

              $scope.loading = true;  //...../...../...../...../
              var userIdClubRef = new Firebase($scope.URL + "/users/" + currentUser.uid + "/clubs")


              userIdClubRef.on('value', function(res){

               if(res.val()){
                var clubkeys = Object.keys(res.val())
                 // console.log(clubkeys.length)

               }else {
                   $scope.loading = false;  //...../...../...../...../
                 }
                 

                 angular.forEach(clubkeys, function(key, val){
                  //alert("adding.....")
                  //console.log(childSnapshot.key())

                  clubRef.child(key).once('value', function(snap){


                      //console.log(snap.val())
                      $scope.loading = false;  //...../...../...../...../


                      var item = []
                      item.id = snap.key()
                      item.founder = snap.val().founders_name
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

});

                  // $timeout(function(){
                  //      $scope.$apply(function(){

                  //        $scope.list.push(item);
                  //        console.log($scope.list)

                  //      })
                  //     })

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

  ref.onAuth(function(currentUser){


   if(currentUser !== null){
     $state.go('app.clublists')
   }

 });


})

.controller('SearchCtrl', function($scope, $state, $firebaseSimpleLogin, $firebase, $ionicModal) {

 var ref = new Firebase($scope.URL);
 var clubRef = new Firebase($scope.URL + "/clubs")

 $scope.clubs = [];

 ref.onAuth(function(currentUser){

      clubRef.once('value', function(dataSnapshot){
      
          dataSnapshot.forEach( function(childSnapshot){

           if(!childSnapshot.child('members').hasChild(currentUser.uid)){

            var item = childSnapshot.val()
            item.id = childSnapshot.key()
            item.memberCount = childSnapshot.child('members').numChildren();


              if(childSnapshot.hasChild( "requests/" + currentUser.uid )){
                item.pendding = true;
              }

              $scope.$apply(function(){
              $scope.clubs.push(item);

              $scope.expandPhoto = function(displayItem){

                    $scope.displayItem = displayItem; 
                    $scope.openPhotoModal();
                  
                 }


              })
          }

        });


    })
 })


 $scope.success = "";
 $scope.sending = false;
  $scope.joinRequest = function(clublistId){

  ref.onAuth(function(currentUser){
   
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



