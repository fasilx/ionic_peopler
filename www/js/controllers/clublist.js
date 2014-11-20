angular.module('clublist', [])

.controller('ClublistCtrl', function($scope, $rootScope, $stateParams, $firebase, $ionicScrollDelegate,
                                      $firebaseSimpleLogin, $ionicModal, $state,
                                      $timeout, $ionicPopover,  $cordovaDialogs, capturePictureSrvc, messageboxSrvc) {

 var ref = new Firebase($scope.URL);
 var clubRef = new Firebase($scope.URL + "/clubs/" + $stateParams.clublistId);
 var userRef = new Firebase($scope.URL + "/users")
 var messageAllRef = new Firebase($scope.URL + "/messages/" + $stateParams.clublistId + "/all")
 
 

   $scope.newMember = {}
   $scope.requestingMember = {}


  
  $scope.scrollBottom = function(){
    if(!$scope.ignoreScrollBottom){
     $ionicScrollDelegate.scrollBottom();
   }
  }


  clubRef.once('value', function(melse){

      $scope.clubBar = melse.val();
      $scope.members = melse.child('members').val()
      $scope.titles  = melse.child('titles').val()

      //console.log($scope.members)
      $scope.membersAsArray = []
      angular.forEach($scope.members, function(val,key){

        var item = val;
        item.id = key;
        $scope.membersAsArray.push(item);

      })
  })



  ref.onAuth(function(currentUser){

    $scope.currentUser = currentUser;

           // check messages for this user
    messageboxSrvc.messagebox(currentUser.uid, $stateParams.clublistId).then(function(messagebox){

      $timeout(function() {
       $scope.$apply(function(){
           // message live updating 
           $scope.messagebox = messagebox;
           $scope.messageboxCount = Object.keys(messagebox).length
           //console.log(messagebox)
         }) 
      });
    })


     var clubPostionRef = clubRef.child("members/" + currentUser.uid + "/position");
     var clubRequestRef = clubRef.child("requests");

     // check request for this user
     var position = clubPostionRef.on('value', function (snap) {
      //console.log(snap.val())


      if((snap.val().indexOf('FOUNDER') > -1 || snap.val().indexOf('VP HR') > -1) ) {

       $scope.rightToAdd = true
       clubRequestRef.on('value', function(result){
         $timeout(function() {
           $scope.$apply(function(){
                // rquests live updateing
               $scope.requestCount = result.numChildren();
               $scope.requests = result.val();

             }) 
         });
       })
      }  
    })
 })



 $scope.goToMessages = function() {
   $state.go('app.messagebox', {clublistId: $stateParams.clublistId})
 }



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

        //console.log(person)
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
 



  $scope.toPeople = function(title, isGroup, name){
      // check if in scope or call onAuth. Saves time from checking in onAuth all the time.
      if($scope.currentUser){
        currentUser = $scope.currentUser
        toPeopleMethod(title,isGroup, name)
      }else{
        ref.onAuth(function(currentUser){

          toPeopleMethod(title,isGroup, name)
        })
      }
  }

  var toPeopleMethod = function(title, isGroup, name){

      if(isGroup){

        if(title.length > 1) // if there is more than one person in this group
        {

          angular.forEach(title, function(val, key){

            var array = []
              //console.log(val)
              clubRef.child('members/' + val + "/position")
                     .once('value', function(snap){
                      //console.log('lkajsdfkajkfjadsj')
                      //console.log(snap.val())
                      array = snap.val()
                      array.push(name)
                      //console.log(array);
                      clubRef.child('members/' + val + "/position").set(array)
                      

                     });
                     //(positions, function(){console.log("new array is set")}) 

          } );
      
            clubRef.child('titles').once('value', function(snap){
              var ttl = snap.val()
                  ttl.push(name)  //get array from firebase and update it. there is no other way
              clubRef.child('titles').set(ttl)
            }) //add this title's name to this aray location  //add this titels name to this location
        }


        var position = name
        rule = title //rule now is array of users uid
        rule.push(currentUser.uid)
        //console.log("is grouop is true")
        //console.log(rule)
      }
      else
      {

            var rule = [];
            var position = title[0];
            rule.push(currentUser.uid)

            //var positionRef = clubRef.child("members");

            clubRef.child('members').once( 'value', function(dataSnapshot) {  /* handle read data */ 

              angular.forEach(dataSnapshot.val(), function(value, key) {
                //console.log(value.position)
                if(value.position[0] === title[0] && key !== currentUser.uid){
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
  } // End to toPeopleMethod




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
                //console.log($scope.recievedMessagesLength)
            })
            }); 
          
            //console.log($scope.recievedMessages)
          })
     
       //$ionicScrollDelegate.scrollTop();
       //console.log("scrolling top")
  }


  $scope.ignoreScrollBottom = false;  //set this to false if 'load more' button is not pressed

      
  messageAllRef.limitToLast(load).on('value',function(allMessages){
    $timeout(function() {
     $scope.$apply(function(){
      $scope.recievedMessages = allMessages.val()
      $scope.recievedMessagesLength = allMessages.numChildren()
             //console.log($scope.recievedMessagesLength)
      })
    }); 
  }) 



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


    var messageData = {message: message, image: $scope.imageData}

    var position = clubRef.child("members/" + currentUser.uid + "/position").once( 'value', function(positionSnapshot) {

      $scope.loading = true //.././././././././././././.
      messageAllRef.push({sender: currentUser, message: messageData,
       position: positionSnapshot.val(), createdAt: Firebase.ServerValue.TIMESTAMP}, function(res) {
      $scope.loading = false //.././././././././././././.

      $cordovaDialogs.beep(1)
        //console.log('beep......')
        $scope.imageData = "" /* clean the scope from lingering around for next messages */
    });

    });
  }



  // $scope.memeberAddError = ""
  // $scope.addMember = function(from){

  //   userRef
  //   .startAt($scope.newMember.email)
  //   .endAt($scope.newMember.email)
  //   .once('value', function(snap) {

  //     $scope.$apply(function(){
  //        if(snap.val() === null)
  //        $scope.memeberAddError = "Member Not Found"
  //     })
     
    
  //     var member_id =  Object.keys(snap.val())[0] 
      

  //     $scope.addRequestingMember(member_id, $scope.newMember.email,$scope.newMember.position)
     
  //       $scope.memberModal.hide();

  //   });
  // }



  $scope.hire = function(user, position){
    console.log(user)
    console.log(position)
    $scope.addRequestingMember(user.id, user.displayName, position)

  }


  $scope.fire = function(user){

    clubRef.child("members/" + user.id).remove(function(done){
        console.log("removed from clubRef..."  + user.id)
      userRef.child(user.id + "/clubs/" +  $stateParams.clublistId).remove(function(doneAgain){

         console.log("removed from userRef ..."  + user.id)
        
      })
     
     
    });

  }


  $scope.selectedUsers = { rule: []}
  $scope.formGroup = function(groupName){

    //console.log(rule)
    if($scope.selectedUsers.rule.length === 0 || groupName === null){

     $scope.groupFormingError = "Choose at least one name and don't forget to name the new group"

     return; 

   }else{

     $scope.memberModal.hide()
      // $scope.toPeople($scope.selectedUsers.rule, true, name); //send true to toPeopele() so it can know this sent it.

    }

    $scope.toPeople($scope.selectedUsers.rule,true); //send true to toPeopele() so it can know this sent it.
  }



  $scope.addRequestingMember = function(id,email,position){

         clubRef.child("members/" + id).set({position: [position], email: email, messagebox: "init"},function(){
        //add club membership in user location
        var userIdRef = new Firebase($scope.URL + "/users/" + id + "/clubs")
        var clublistId = $stateParams.clublistId;

           var obj = {};
           obj[clublistId] = true;
           userIdRef.update(obj) 

           // $scope.$apply(function(){

           //    $scope.requestAdded = true;
           // })

           // remove user from request location
            var clubRequestRef = clubRef.child("requests");
            clubRequestRef.child(id).remove(function(){
              $scope.$apply();
              //console.log("user removed from requests")
            });

      });
  }

    $scope.denyRequestingMember = function(id){

           // remove user from request location
            var clubRequestRef = clubRef.child("requests");
            clubRequestRef.child(id).remove(function(){
              $scope.$apply();
              //console.log("user removed from requests")
            });

      
  }



  $ionicModal.fromTemplateUrl('templates/add-member.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.memberModal = modal;
  });
  $scope.openModal = function() {
    $scope.clublistId = $stateParams.clublistId;  //asldkfjklasjfklajsfkljsfk aslkdfjaksfkjsdf afasdfj attention
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