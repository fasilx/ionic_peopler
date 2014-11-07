angular.module('others', [])



.controller("CreateCtrl", function($scope, $firebase, $firebaseSimpleLogin, $state, capturePictureSrvc) {

  var clubRef = new Firebase($scope.URL + "/clubs");

  sync = $firebase(clubRef);
  //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
  var ref = new Firebase($scope.URL);



  $scope.imageData = ""; // if picture is taken use that, otherwise use empty string
  $scope.takePicture = function(){

   capturePictureSrvc.takePicture().then(function(imageMelse) {
    $scope.imageData = imageMelse;

  })
 }




 $scope.createClub = function(club){

    ref.onAuth(function(currentUser){
      //currentUser.id = currentUser.uid.split(":")[1]

    $scope.imageData = $scope.imageData ||  $scope.defaultImage;

    //club.name and club.description, etc... are found from the $scope of the main.js, the global scope context
    sync.$push({name: club.name, description: club.description, avatar: $scope.imageData, founders_id: currentUser.uid}).then(function(newChildRef) {
      //console.log("added record with id " + newChildRef.key());

      var clublistId = newChildRef.key();
      var userId = currentUser.uid
      var messageRef = new Firebase($scope.URL + "/messages/" + clublistId)
      var memberRef = new Firebase($scope.URL + "/clubs/" + clublistId)

      memberRef.update({members: userId}, function(){
       var memberPositionRef = new Firebase($scope.URL + "/clubs/" + clublistId + "/members/" + userId)
       var userIdRef = new Firebase($scope.URL + "/users/" + currentUser.uid + "/clubs")

       memberPositionRef.update({position: 'FOUNDER'})
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
    });
  })
}

  //this scope is in www/js/controllers/main.js
 })


.controller('ClublistsCtrl', function($scope, $firebaseSimpleLogin, $state, $timeout) {


  // $state.reload(); // this will help relaod the controller after login. I hope.

  //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
  var ref = new Firebase($scope.URL);

  $scope.list = [];
  
  var clubRef = new Firebase($scope.URL + "/clubs")


  ref.onAuth(function(currentUser){
      // clublistId = currentUser.uid.split(":")[1]

       $scope.goToMessages = function(clublistId, count){
        $state.go('app.single', {clublistId: clublistId})
      }
});

  

    ref.onAuth(function(currentUser){
     // currentUser.id = currentUser.uid.split(":")[1]


    var userIdClubRef = new Firebase($scope.URL + "/users/" + currentUser.uid + "/clubs")

    userIdClubRef.on('value', function(res){
      //console.log(res.val())
      res.forEach(function(childSnapshot){

        //console.log(childSnapshot.key())

        clubRef.child(childSnapshot.key()).on('value', function(snap){

          console.log(snap.key())

          var messagebox = snap.val().members[currentUser.uid].messagebox
          var messageboxCount = 0; 

             if (angular.isDefined(messagebox)) {

                
                  angular.forEach(messagebox, function(value, key) {
                   if(value)
                    messageboxCount++;
                   });
           

             };

              // console.log(messageboxCount)
              // console.log(messagebox)
           

           var position = snap.val().members[currentUser.uid].position || {}
           var item = {}
           //console.log(snap.val())
           

           item.id = snap.key()
           item.name = snap.val().name
           item.description = snap.val().description
           item.avatar = snap.val().avatar
           item.messageboxCount = messageboxCount;
           item.position = position;
  
           if ((position === 'FOUNDER' || position === 'VP HR') && angular.isDefined(snap.val().requests)){
             item.requestCount = Object.keys(snap.val().requests).length;  

           }

           $timeout(function(){
             $scope.$apply(function(){
             $scope.list.push(item)
           })
           })
        
          

         // })

        })
      });

    });

  })

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

.controller('SearchCtrl', function($scope, $state, $firebaseSimpleLogin, $firebase) {

  // var dataRef = new Firebase($scope.URL);

 //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
  var ref = new Firebase($scope.URL);

  var clubRef = new Firebase($scope.URL + "/clubs")

  //use Object in view by declaring it here

// clubRef.on('value', function(res){
 $scope.clubs = [];

   ref.onAuth(function(currentUser){
      //currentUser.id = currentUser.uid.split(":")[1]

  clubRef.once('value', function(dataSnapshot){
      //console.log(dataSnapshot.val())

      dataSnapshot.forEach( function(childSnapshot){

       if(!childSnapshot.hasChild('members/' + currentUser.uid)){

        var item = childSnapshot.val()
        item.id = childSnapshot.key()
        item.memberCount = childSnapshot.child('members').numChildren();

        if(childSnapshot.hasChild( "requests/" + currentUser.uid )){
          item.pendding = true;
        }

        $scope.$apply(function(){
          $scope.clubs.push(item);
                //console.log($scope.clubs)
              })


      }

    });


    })


})


 $scope.success = "";
 $scope.sending = false;
// })
$scope.joinRequest = function(clublistId){

    ref.onAuth(function(currentUser){
      //currentUser.id = currentUser.uid.split(":")[1]


    var item = {}
      //console.log(currentUser.id)
      item[currentUser.uid] = currentUser.password.email;
      clubRef.child(clublistId + "/requests").update(item,function(error){

        if(error === null){

          $scope.$apply(function(){
            $scope.success = clublistId;
            $scope.sending = false
          })
        }

        else
          $scope.error = error

      })



    });



}


})

