angular.module('clublist', [])

.controller('ClublistCtrl', function($scope, $rootScope, $stateParams, $firebase, $ionicScrollDelegate,
                                      $firebaseSimpleLogin, $ionicModal, $state,
                                      $timeout, $ionicPopover,  $cordovaDialogs, capturePictureSrvc, messageboxSrvc) {

 var clubRef = new Firebase($scope.URL + "/clubs/" + $stateParams.clublistId);
 var clubSync = $firebase(clubRef);
 var userRef = new Firebase($scope.URL + "/users")
 var messageAllRef = new Firebase($scope.URL + "/messages/" + $stateParams.clublistId + "/all")
 var loginObj = $firebaseSimpleLogin(new Firebase($scope.URL));


 $scope.scrollBottom = function(){
   $ionicScrollDelegate.scrollBottom();

 }

 // $scope.$watch('messagebox', function(){
 //    alert("messagebox")
 // })

loginObj.$getCurrentUser().then(function(currentUser){
    $scope.me = currentUser;
      messageboxSrvc.messagebox(currentUser.id, $stateParams.clublistId).then(function(messagebox){
        $scope.messagebox = messagebox;
         console.log(messagebox)       
    })
})

$rootScope.$on('newMessage', function(value, data) {

 
  $timeout(function() {
  // anything you want can go here and will safely be run on the next digest.
     $scope.$apply(function(){
     $scope.messageboxCount = data.length;
     // console.log(data.length + " .......before beep...........")
     // // if(data.length > 0){
     // //  $cordovaNativeAudio.play('recieve');
     // // }
     // // $scope.$apply()
     // console.log(data.length + " .......after beep...........")
  })

})

 
  
})

// $scope.noMessage = function(messageboxLength){

//   if(messageboxLength === null || messageboxLength === 0){
//     $state.go('app.single', {clublistId: $stateParams.clublistId})
//   }
// }

 $scope.goToMessages = function() {
   $state.go('app.messagebox', {clublistId: $stateParams.clublistId})
 }

//name for the top bar 
 clubRef.once('value', function(melse){
    $scope.clubBar = melse.val();
 })

 clubRef.child('members').once('value', function  (snap) {
 //$scope.allUsers = snap.val()
 $scope.allUsers = []; //this array was created for query filters to work properly in the view
      snap.forEach( function(childSnap){
        var item = {};
        item.id = childSnap.name();
        item.email = childSnap.val().email;
        item.position = childSnap.val().position;

        //console.log(childSnap.name())
      
        $scope.allUsers.push(item);

        //console.log(item);
      });
})


 $scope.toPerson = function(person){
     // $rootScope.thisClub = $stateParams.clublistId
     loginObj.$getCurrentUser().then(function(currentUser){

      $scope.currentUser = currentUser; // set current user in scope while scope is alive

      // var rule = []
      // rule.push(person);
      // var item = {clublistId: $stateParams.clublistId, rule: rule, sender: currentUser.id, messageType: 'person'}

      var refName;
        ////console.log(typeof person)
          //console.log(typeof currentUser.id)
        // messages should endup in the same location.
        if (person < currentUser.id){
          refName = person + "," + currentUser.id
          //console.log("this if is called")
          //console.log(refName)
          // 177,178 or 177,177
        }else{
          //console.log("else is called")

          refName = currentUser.id + "," + person;
           //console.log(refName)
          // 177,178 
        }

      var messagePersonRef = new Firebase($scope.URL + "/messages/" +
                                          $stateParams.clublistId + "/person/" + refName)

      messagePersonRef.update({
                               receiver: {person: person, futureLocation: false}, 
                                 sender: {person: currentUser.id, futureLocation: false}
                               })
      var messageboxItem = {}
      messageboxItem[person] = false;
      clubRef.child("members/" + currentUser.id + "/messagebox").update(messageboxItem)
      
      // setTimeout(function(){ $state.go('app.separate', item );}, 3000)
      $state.go('app.separate', {clublistId: $stateParams.clublistId, refName: refName, rule: person, messageType: 'person'});

    });

   }

   $scope.toPeople = function(position){
    // $rootScope.thisClub = $stateParams.clublistId
    loginObj.$getCurrentUser().then(function(currentUser){

      $scope.currentUser = currentUser; // set current user in scope while scope is alive

      var rule = [];
      //var positionRef = clubRef.child("members");

      clubRef.child('members').once( 'value', function(dataSnapshot) {  /* handle read data */ 
        angular.forEach(dataSnapshot.val(), function(value, key) {
          if(value.position === position){
            rule.push(key);
          }
        });
        var messageGroupRef = new Firebase($scope.URL + "/messages/" + 
          $stateParams.clublistId + "/group/" + rule + "," + currentUser.id)
        messageGroupRef.update({rule: rule.join(), sender: currentUser.id})

        var refName = rule.toString() + currentUser.id;

        // if there is only one in a group, make this a personal message
        if(rule.length === 1){
           $scope.toPerson(rule.toString())
        }else
        {
         $state.go('app.separate', {clublistId: $stateParams.clublistId, refName: refName, rule: position, messageType: 'group', position: position});
        }

      });

    });
    
  }

  $scope.imageData = ""; // if picture is taken use that, otherwise use empty string
  $scope.takePicture = function(){

       capturePictureSrvc.takePicture().then(function(imageMelse) {
      $scope.imageData = imageMelse;
      
  })
}

   // $scope.imageData = ""; 
   // capturePictureSrvc.takePicture().then(function(imageMelse) {
   //    $scope.imageData = imageMelse;
   //  });


  //  $scope.imageData = ""; // start with empty string for image string store
  //  $scope.takePicture  = function() {
  //   var options = { 
  //     quality : 75, 
  //     destinationType : Camera.DestinationType.DATA_URL, 
  //     sourceType : Camera.PictureSourceType.CAMERA, 
  //     allowEdit : true,
  //     encodingType: Camera.EncodingType.JPEG,
  //     targetWidth: 100,
  //     targetHeight: 100,
  //     popoverOptions: CameraPopoverOptions,
  //     saveToPhotoAlbum: true
  //   };

  //   $cordovaCamera.getPicture(options).then(function(imageData) {

  //           // Success! Image data is base64 stringified already
  //           //console.log("image upload successful")
  //           $scope.imageData = imageData;



  //         }, function(err) {
  //           // An error occured. Show a message to the user
  //           //console.log(err + "      ERRRRRRRRRRR")

  //         });
  // }

  //message recieved ===============================================
  $scope.recievedMessages = $firebase(messageAllRef.limit(10)).$asArray();
 //message recieved ===============================================


  $scope.sendMessage = function(message){

    var messageSync = $firebase(messageAllRef);


    var messageData = {message: message, image: $scope.imageData}

    if($scope.currentUser){
      var position = clubRef.child("members/" + $scope.currentUser.id + "/position").once( 'value', function(positionSnapshot) {

        messageSync.$push({sender: $scope.currentUser, message: messageData,
         position: positionSnapshot.val(),
         rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}).then(function(ref) {

          // var messageboxItem = {}
          // messageboxItem[currentUser.id] = false;
          // clubRef.child("memebers/" + person + "/messagebox").update(messageboxItem)
         
          $cordovaDialogs.beep(1)
          console.log('beep......')
          $scope.imageData = "" /* clean the scope from lingering around for next messages */
          //alert("before beep")
        
           //alert("after beep")

        });

       });


    }else{

      loginObj.$getCurrentUser().then(function(currentUser){

      $scope.currentUser = currentUser; // set current user in scope while scope is alive

      var position = clubRef.child("members/" + currentUser.id + "/position").once( 'value', function(positionSnapshot) {


        messageSync.$push({sender: currentUser, message: messageData,
         position: positionSnapshot.val(),
         rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}).then(function(ref){

          $cordovaDialogs.beep(1)
          console.log('beep......')
           $scope.imageData = "" /* clean the scope from lingering around for next messages */

         });

        //  if(angular.isDefined($stateParams.rule)){
        //   messageSync.$update({ rule: $stateParams.rule, sender: currentUser.id });
        // }

      });

    })
    }

  }

  $scope.newMember = {}
  $scope.requestingMember = {}
  $scope.titles = ['CEO', 'COO', 'CFO', 'CTO', 'VP Marketing', 'VP HR', 'VP DEPT2', 'VP DEPT3', 'MEMBER', 'GUEST'];

   loginObj.$getCurrentUser().then(function (melse) {
      
       var clubPostionRef = clubRef.child("/members/" + melse.id + "/position");
       var clubRequestRef = clubRef.child("requests");
       var position = clubPostionRef.on('value', function (snap) {
         // body...
        if(snap.val() === 'FOUNDER' || snap.val() === 'VP HR') {
          clubRequestRef.on('value', function(result){

          $timeout(function() {
             $scope.$apply(function(){
             $scope.rightToAdd = true
             $scope.requestCount = result.numChildren();
             console.log($scope.requestCount)
             $scope.requests = result.val();
          }) 
          });
      

          })
       

        } 
  
     
       })
      
       
   })


  $scope.memeberAddError = ""

  $scope.addMember = function(from){

    userRef
    .startAt($scope.newMember.email)
    .endAt($scope.newMember.email)
    .once('value', function(snap) {

      $scope.$apply(function(){
         if(snap.val() === null)
         $scope.memeberAddError = "Member Not Found"
      })
     
    
      var member_id =  Object.keys(snap.val())[0] 


      clubRef.child("members/" + member_id).set({position: $scope.newMember.position, email: $scope.newMember.email},function(){
        //add club member ship in user location
        var userIdRef = new Firebase($scope.URL + "/users/" + member_id + "/clubs")
        var clublistId = $stateParams.clublistId;

           var obj = {};
           obj[clublistId] = true;
           userIdRef.update(obj) 

        $scope.memberModal.hide()

      });

    });


  }

  $scope.addRequestingMember = function(id,email,position){

         clubRef.child("members/" + id).set({position: position, email: email},function(){
        //add club membership in user location
        var userIdRef = new Firebase($scope.URL + "/users/" + id + "/clubs")
        var clublistId = $stateParams.clublistId;

           var obj = {};
           obj[clublistId] = true;
           userIdRef.update(obj) 

           $scope.$apply(function(){

              $scope.requestAdded = true;
           })

           // remove user from request location
            var clubRequestRef = clubRef.child("requests");
            clubRequestRef.child(id).remove(function(){
              //console.log("user removed from requests")
            });

      });
  }

  $ionicModal.fromTemplateUrl('templates/add-member.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.memberModal = modal;
  });
  $scope.openModal = function() {
    $scope.memberModal.show();
  };
  $scope.closeModal = function() {
    $scope.memberModal.hide();
  };
    //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.memberModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('memberModal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('memberModal.removed', function() {
    // Execute action
  });
  

 $ionicPopover.fromTemplateUrl('templates/searchPopover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });


});