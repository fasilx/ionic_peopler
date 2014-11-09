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

// get messages as they come
$timeout(function() {
  var currentUser = $scope.currentUser;
    $scope.$apply(function(){
      messageboxSrvc.messagebox(currentUser.uid, $stateParams.clublistId).then(function(messagebox){
        $scope.messagebox = messagebox;
        $scope.messageboxCount = messagebox.length
         console.log(messagebox)       
    })
})
  
});


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
     
    if($scope.currentUser){
     
      toPersonMethod(person, $scope.currentUser)
    }else{

     ref.onAuth(function(currentUser){
        toPersonMethod(person, currentUser)
      });

 }
}

 var toPersonMethod = function(person, user){

  var currentUser = user;
      var refName;
        if (person < currentUser.uid){
          refName = person + "," + currentUser.uid
        }else{
          //console.log("else is called")

          refName = currentUser.uid + "," + person;
           //console.log(refName)
          // 177,178 
        }

        console.log(person)
      var messagePersonRef = new Firebase($scope.URL + "/messages/" +
                                          $stateParams.clublistId + "/person/" + refName)

      messagePersonRef.update({
                               receiver: {person: person, futureLocation: false}, 
                                 sender: {person: currentUser.uid, futureLocation: false}
                               })

      clubRef.child("members/" + currentUser.uid + "/messagebox/" + person).remove()//(messageboxItem)
      
      // setTimeout(function(){ $state.go('app.separate', item );}, 3000)
      $state.go('app.separate', {clublistId: $stateParams.clublistId, 
                                 refName: refName, rule: person, messageType: 'person', position: 'person'});

    };
 



$scope.toPeople = function(title, isGroup){
    
    if($scope.currentUser){
      currentUser = $scope.currentUser
      toPeopleMethod(title,isGroup)
    }else{
      ref.onAuth(function(currentUser){

        toPeopleMethod(title,isGroup)
      })
    }
  }

var toPeopleMethod = function(title, isGroup){

      if(isGroup){
        var position = "RANDOM GROUP"
        rule = title //rule now is array of users uid
        rule.push(currentUser.uid)
        console.log("is grouop is true")
        console.log(rule)
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
     
      
        // if there is only one in a group, make this a personal message.
        // that means two people inluding the sender
        if(rule.length === 2){

           var splice = rule.splice(rule.indexOf(currentUser.uid), 1)
           $scope.toPerson(rule.toString()) //send a String not an array. OK?

        }
        else
        {

                // var membership = ""
                var refName = rule.sort().toString()  //creates one locaiton for all groupe messages
            
                var messageGroupRef = new Firebase($scope.URL + "/messages/" + 
                  $stateParams.clublistId + "/group/" + refName)

                messageGroupRef.update({
                                       receiver: {people: rule.toString(), futureLocation: false}, 
                                         sender: {person: currentUser.uid, futureLocation: false}
                                       })

            $state.go('app.separate', {clublistId: $stateParams.clublistId, refName: refName, rule: rule, messageType: 'group', position: position});
        }    
  }

$scope.imageData = ""; // if picture is taken use that, otherwise use empty string
$scope.takePicture = function(){

       capturePictureSrvc.takePicture().then(function(imageMelse) {
      $scope.imageData = imageMelse;
      
  })
}



  //message recieved =============================================== 

  var load = 10;

  $scope.loadMore = function(){
      // adds 10 more data everytime it is called.
        $scope.ignoreScrollBottom = true;
       load =  load + 10;
         messageAllRef.limitToLast(load).on('value',function(allMessages){
            $timeout(function() {
               $scope.$apply(function(){
                $scope.recievedMessages = allMessages.val()
                $scope.recievedMessagesLength = allMessages.numChildren()
                console.log($scope.recievedMessagesLength)
            })
            }); 
          
            console.log($scope.recievedMessages)
          })
     
       //$ionicScrollDelegate.scrollTop();
       console.log("scrolling top")

  }
  $scope.ignoreScrollBottom = false;  //set this to false if 'load more' button is not pressed

      
      messageAllRef.limitToLast(load).on('value',function(allMessages){
        $timeout(function() {
           $scope.$apply(function(){
            $scope.recievedMessages = allMessages.val()
             $scope.recievedMessagesLength = allMessages.numChildren()
             console.log($scope.recievedMessagesLength)
        })
        }); 
      
       
      })
    console.log($scope.recievedMessages)
 // end message recieved ===============================================



// sending messages ==================================================
  $scope.sendMessage = function(message){

    if($scope.currentUser){

       var currentUser = $scope.currentUser
       sendMessageMethod(message,currentUser)

    }else{

      ref.onAuth(function(currentUser){

        sendMessageMethod(message,currentUser)

    })
    }

  }

var sendMessageMethod = function(message,currentUser){

console.log("message....message")
console.log(message)
    var messageData = {message: message, image: $scope.imageData}

        // currentUser.id = currentUser.uid.split(":")[1]  //new firebase auth does not have id by default anymore. sucks

        var position = clubRef.child("members/" + currentUser.uid + "/position").once( 'value', function(positionSnapshot) {

          messageAllRef.push({sender: currentUser, message: messageData,
           position: positionSnapshot.val(), createdAt: Firebase.ServerValue.TIMESTAMP}, function(res) {

            // var messageboxItem = {}
            // messageboxItem[currentUser.id] = false;
            // clubRef.child("memebers/" + person + "/messagebox").update(messageboxItem)
            console.log(res)
            $cordovaDialogs.beep(1)
            console.log('beep......')
            $scope.imageData = "" /* clean the scope from lingering around for next messages */
            //alert("before beep")
          
             //alert("after beep")

          });

         });

  }

  $scope.newMember = {}
  $scope.requestingMember = {}
  $scope.titles = ['CEO', 'COO', 'CFO', 'CTO', 'VP Marketing', 'VP HR', 'VP ONE', 'VP TWO', 'MEMBER', 'GUEST'];

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

      $scope.addRequestingMember(member_id, $scope.newMember.email,$scope.newMember.position)

      // clubRef.child("members/" + member_id).set({position: $scope.newMember.position, 
      //                                            email: $scope.newMember.email, messagebox: "init"},function(){
      //   //add club member ship in user location
      //   var userIdRef = new Firebase($scope.URL + "/users/" + member_id + "/clubs")
      //   var clublistId = $stateParams.clublistId;

      //      var obj = {};
      //      obj[clublistId] = true;
      //      userIdRef.update(obj) 

      //   $scope.memberModal.hide()


      // });

    });


  }


  // var addMemberMethod = function(id, position, email){


  //        clubRef.child("members/" + id).set({position: position, email: email, messagebox: "init"},function(){
  //       //add club membership in user location
  //       var userIdRef = new Firebase($scope.URL + "/users/" + id + "/clubs")
  //       var clublistId = $stateParams.clublistId;

  //          var obj = {};
  //          obj[clublistId] = true;
  //          userIdRef.update(obj) 

  //          $scope.$apply(function(){

  //             $scope.requestAdded = true;
  //          })

  //          // remove user from request location
  //           var clubRequestRef = clubRef.child("requests");

  //           clubRequestRef.child(id).remove(function(){
  //             $scope.$apply();
  //             console.log("user removed from requests")
  //           });

  //     });

  // }


  $scope.formGroup = function(users){

  console.log(users)

  var rule = []
  
   //reset data value in allUsers arry
    angular.forEach(  $scope.allUsers, function(value, key) {

      if(value.data){
        rule.push(value.id) //push it up then reset it back to false
        value.data = false;
      }
       
      
    });
console.log(rule)
    if(rule === []){

      $scope.groupFormingError = "Please add at least one name"

    }else{

       $scope.memberModal.hide()
       $scope.toPeople(rule,true); //send true to toPeopele() so it can know this sent it.
       
    }

    // console.log("akljsdfkljasdklfjaskldfjklasjdfklasdjfklasdjfkljasdklfj")
    // console.log(rule)
    //$scope.toPeople(rule,true); //send true to toPeopele() so it can know this sent it.
 
}

  $scope.addRequestingMember = function(id,email,position){

         clubRef.child("members/" + id).set({position: position, email: email, messagebox: "init"},function(){
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
              $scope.$apply();
              console.log("user removed from requests")
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