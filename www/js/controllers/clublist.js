angular.module('clublist', [])

.controller('ClublistCtrl', function($scope, $rootScope, $stateParams, $firebase, $ionicScrollDelegate,
                                      $firebaseSimpleLogin, $ionicModal, $state,
                                      $timeout, $ionicPopover,  $cordovaDialogs, capturePictureSrvc, messageboxSrvc) {

 var clubRef = new Firebase($scope.URL + "/clubs/" + $stateParams.clublistId);
 // var clubSync = $firebase(clubRef);
 var userRef = new Firebase($scope.URL + "/users")
 var messageAllRef = new Firebase($scope.URL + "/messages/" + $stateParams.clublistId + "/all")
 //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
 var ref = new Firebase("https://peopler.firebaseio.com");
 


 $scope.scrollBottom = function(){
  if(!$scope.ignoreScrollBottom){

   $ionicScrollDelegate.scrollBottom();
 }


}

 // $scope.$watch('messagebox', function(){
 //    alert("messagebox")
 // })

  ref.onAuth(function(currentUser){
  console.log(currentUser)
  //currentUser.id = currentUser.uid.split(":")[1] //the new simple login does not proved id
      $scope.me = currentUser;
      messageboxSrvc.messagebox(currentUser.uid, $stateParams.clublistId).then(function(messagebox){
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
        item.id = childSnap.key()
        item.email = childSnap.val().email;
        item.position = childSnap.val().position;

        //console.log(childSnap.name())
      
        $scope.allUsers.push(item);

        //console.log(item);
      });
})


 $scope.toPerson = function(person){
     // $rootScope.thisClub = $stateParams.clublistId
     ref.onAuth(function(currentUser){
     // currentUser.id = currentUser.uid.split(":")[1]
      $scope.currentUser = currentUser; // set current user in scope while scope is alive

      // var rule = []
      // rule.push(person);
      // var item = {clublistId: $stateParams.clublistId, rule: rule, sender: currentUser.id, messageType: 'person'}

      var refName;
        ////console.log(typeof person)
          //console.log(typeof currentUser.id)
        // messages should endup in the same location.
        if (person < currentUser.uid){
          refName = person + "," + currentUser.uid
          //console.log("this if is called")
          //console.log(refName)
          // 177,178 or 177,177
        }else{
          //console.log("else is called")

          refName = currentUser.uid + "," + person;
           //console.log(refName)
          // 177,178 
        }

      var messagePersonRef = new Firebase($scope.URL + "/messages/" +
                                          $stateParams.clublistId + "/person/" + refName)

      messagePersonRef.update({
                               receiver: {person: person, futureLocation: false}, 
                                 sender: {person: currentUser.uid, futureLocation: false}
                               })

      // ready the location to put message in
      // var messageboxItem = {}
      // messageboxItem[person] = false;
      clubRef.child("members/" + currentUser.uid + "/messagebox/" + person).remove()//(messageboxItem)
      
      // setTimeout(function(){ $state.go('app.separate', item );}, 3000)
      $state.go('app.separate', {clublistId: $stateParams.clublistId, refName: refName, rule: person, messageType: 'person', position: 'person'});

    });

   }

   $scope.toPeople = function(title, isGroup){
    // $rootScope.thisClub = $stateParams.clublistId
     ref.onAuth(function(currentUser){
     // currentUser.id = currentUser.uid.split(":")[1]

      $scope.currentUser = currentUser; // set current user in scope while scope is alive

      if(isGroup){
        var position = "RANDOM GROUP"
        rule = title //rule now is array of users uid
        rule.push(currentUser.uid)
      }
      else
      {

            var rule = [];
            var position = title;
            rule.push(currentUser.uid)

            //var positionRef = clubRef.child("members");

            clubRef.child('members').once( 'value', function(dataSnapshot) {  /* handle read data */ 

              angular.forEach(dataSnapshot.val(), function(value, key) {

                if(value.position === title && key !== currentUser.uid){
                  rule.push(key);
                }
              
              });
            })

      }
     

        // var membership = ""
        var refName = rule.sort().toString()  //creates one locaiton for all groupe messages
       
        // if(rule.indexOf(currentUser.uid) === -1)
        // {

        //   membership = 'only'  //only members with this title in this loop
        // }else
        // { membership = 'open'} // someone other than this members is in the loop

        var messageGroupRef = new Firebase($scope.URL + "/messages/" + 
          $stateParams.clublistId + "/group/" + refName)

        messageGroupRef.update({
                               receiver: {people: rule.toString(), futureLocation: false}, 
                                 sender: {person: currentUser.uid, futureLocation: false}
                               })

       

        // if there is only one in a group, make this a personal message.
        // that means two people inluding the sender
        if(rule.length === 2){
           $scope.toPerson(rule.splice(indexOf(currentUser.uid), 1).toString())
        }else
        {
         $state.go('app.separate', {clublistId: $stateParams.clublistId, refName: refName, rule: rule, messageType: 'group', position: position});
        }

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

  var load = 10;
  $scope.loadMore = function(){
      // adds 10 more data everytime it is called.

       load =  load + 10;
       $scope.recievedMessages = $firebase(messageAllRef.limit(load)).$asArray();
       $scope.ignoreScrollBottom = true;
       //$ionicScrollDelegate.scrollTop();
       console.log("scrolling top")

  }
  $scope.ignoreScrollBottom = false;  //set this to false if 'load more' button is not pressed
  //message recieved ===============================================
  $scope.recievedMessages = $firebase(messageAllRef.limitToFirst(load)).$asArray();
 //message recieved ===============================================
 console.log($scope.recievedMessages)

  $scope.sendMessage = function(message){

    var messageSync = $firebase(messageAllRef);


    var messageData = {message: message, image: $scope.imageData}

    if($scope.currentUser){

     // currentUser.id = currentUser.uid.split(":")[1]  //new firebase auth does not have id by default anymore. sucks

      var position = clubRef.child("members/" + $scope.currentUser.uid + "/position").once( 'value', function(positionSnapshot) {

        messageSync.$push({sender: $scope.currentUser, message: messageData,
         position: positionSnapshot.val(),
         rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}).then(function(res) {

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

      ref.onAuth(function(currentUser){
      //currentUser.id = currentUser.uid.split(":")[1]

      $scope.currentUser = currentUser; // set current user in scope while scope is alive

      var position = clubRef.child("members/" + currentUser.uid + "/position").once( 'value', function(positionSnapshot) {


        messageSync.$push({sender: currentUser, message: messageData,
         position: positionSnapshot.val(),
         rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}).then(function(res){

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

    ref.onAuth(function(currentUser){
     // currentUser.id = currentUser.uid.split(":")[1]

       var clubPostionRef = clubRef.child("/members/" + currentUser.uid + "/position");
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


  $scope.memberUsers = function(users){

  console.log(users)

  var rule = []
   $scope.memberModal.hide()
   //reset data value in allUsers arry
    angular.forEach(  $scope.allUsers, function(value, key) {

      if(value.data){
        rule.push(value.id) //push it up then reset it back to false
        value.data = false;
      }
       
      
    });
    console.log("akljsdfkljasdklfjaskldfjklasjdfklasdjfklasdjfkljasdklfj")
    console.log(rule)
    $scope.toPeople(rule,true); //send true to toPeopele() so it can know this sent it.
 
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