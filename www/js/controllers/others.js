angular.module('others', [])



.controller("CreateCtrl", function($scope, $firebase, $firebaseSimpleLogin, $state, capturePictureSrvc) {

  var ref = new Firebase($scope.URL + "/clubs");

  sync = $firebase(ref);
  var loginObj = $firebaseSimpleLogin(new Firebase($scope.URL));


  $scope.imageData = ""; // if picture is taken use that, otherwise use empty string
  $scope.takePicture = function(){

   capturePictureSrvc.takePicture().then(function(imageMelse) {
    $scope.imageData = imageMelse;

  })
 }




 $scope.createClub = function(club){

  loginObj.$getCurrentUser().then(function(currentUser){

    $scope.imageData = $scope.imageData ||  $scope.defaultImage;

    //club.name and club.description, etc... are found from the $scope of the main.js, the global scope context
    sync.$push({name: club.name, description: club.description, avatar: $scope.imageData, founders_id: currentUser.id}).then(function(newChildRef) {
      //console.log("added record with id " + newChildRef.name());

      var clublistId = newChildRef.name();
      var userId = currentUser.id
      var messageRef = new Firebase($scope.URL + "/messages/" + clublistId)
      var memberRef = new Firebase($scope.URL + "/clubs/" + clublistId)

      memberRef.update({members: userId}, function(){
       var memberPositionRef = new Firebase($scope.URL + "/clubs/" + clublistId + "/members/" + userId)
       var userIdRef = new Firebase($scope.URL + "/users/" + currentUser.id + "/clubs")

       memberPositionRef.update({position: 'FOUNDER'})
       messageRef.update({all: "init", group: "init", person: "init"})

       var obj = {};
       obj[clublistId] = true;
       userIdRef.update(obj) 

       $state.go('app.single', {clublistId: newChildRef.name()})
     }) 
    });
  })
}

  //this scope is in www/js/controllers/main.js
 })


.controller('ClublistsCtrl', function($scope, $firebaseSimpleLogin, $state, $timeout) {


  // $state.reload(); // this will help relaod the controller after login. I hope.

  var loginObj = $firebaseSimpleLogin(new Firebase($scope.URL));

  $scope.list = [];
  
  var clubRef = new Firebase($scope.URL + "/clubs")


  loginObj.$getCurrentUser().then(function(currentUser){

       $scope.goToMessages = function(clublistId, count){
        $state.go('app.single', {clublistId: clublistId})
      }
});

  

  loginObj.$getCurrentUser().then(function(currentUser){
    var userIdClubRef = new Firebase($scope.URL + "/users/" + currentUser.id + "/clubs")

    userIdClubRef.on('value', function(res){
      console.log(res.val())
      res.forEach(function(childSnapshot){

        console.log(childSnapshot.name())

        clubRef.child(childSnapshot.name()).on('value', function(snap){

          console.log(snap.name())

          var messagebox = snap.val().members[currentUser.id].messagebox
          var messageboxCount = 0; 

             if (angular.isDefined(messagebox)) {

                
                  angular.forEach(messagebox, function(value, key) {
                   if(value)
                    messageboxCount++;
                   });
           

             };

              console.log(messageboxCount)
              console.log(messagebox)
           

           var position = snap.val().members[currentUser.id].position || {}
           var item = {}
            console.log(snap.val())
           // console.log(snap.val());

           item.id = snap.name()
           item.name = snap.val().name
           item.description = snap.val().description
           item.avatar = snap.val().avatar
           item.messageboxCount = messageboxCount;
           item.position = position;

           if (position === 'FOUNDER' || position === 'VP HR'){
             item.requests = snap.val().requests;  
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

  var dataRef = new Firebase($scope.URL);
  var loginObj = $firebaseSimpleLogin(dataRef)

  loginObj.$getCurrentUser().then(function(currentUser){




   if(currentUser !== null){
     $state.go('app.clublists')
   }

 });


})

.controller('SearchCtrl', function($scope, $state, $firebaseSimpleLogin, $firebase) {

  var dataRef = new Firebase($scope.URL);
  var loginObj = $firebaseSimpleLogin(dataRef)
  var clubRef = new Firebase($scope.URL + "/clubs")

  //use Object in view by declaring it here

// clubRef.on('value', function(res){
 $scope.clubs = [];
 loginObj.$getCurrentUser().then(function(currentUser){

  clubRef.once('value', function(dataSnapshot){
      //console.log(dataSnapshot.val())

      dataSnapshot.forEach( function(childSnapshot){

       if(!childSnapshot.hasChild('members/' + currentUser.id)){

        var item = childSnapshot.val()
        item.id = childSnapshot.name()
        item.memberCount = childSnapshot.child('members').numChildren();

        if(childSnapshot.hasChild( "requests/" + currentUser.id )){
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

  loginObj.$getCurrentUser().then(function(currentUser){


    var item = {}
      //console.log(currentUser.id)
      item[currentUser.id] = currentUser.email;
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

