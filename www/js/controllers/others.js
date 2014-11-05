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
})


.controller('ClublistsCtrl', function($scope, $firebaseSimpleLogin, $state, messageboxSrvc) {


  // $state.reload(); // this will help relaod the controller after login. I hope.

  var loginObj = $firebaseSimpleLogin(new Firebase($scope.URL));


  
 $scope.list = [];

  loginObj.$getCurrentUser().then(function(currentUser){


   var userIdClubRef = new Firebase($scope.URL + "/users/" + currentUser.id + "/clubs")
   var clubRef = new Firebase($scope.URL + "/clubs")

   $scope.goToMessages = function(clublistId, count){
        $state.go('app.single', {clublistId: clublistId})
   }

   userIdClubRef.on('value', function(res){
 
           res.forEach( function(childSnapshot){

           new Firebase($scope.URL + "/clubs/" +  childSnapshot.name()).on('value', function(melse){
               // list.push({id: melse.name(), name: melse.val().name});
              console.log("11111111")
              clubRef.child(melse.name() + "/members/" + currentUser.id + "/position").on('value', function(position){
                    console.log("222222222")
                    clubRef.child(melse.name() + "/requests").on('value', function(reqResult){
                     // console.log("child added called....")
                     console.log("333333333")
                        messageboxSrvc.messagebox(currentUser.id, childSnapshot.name()).then(function(back){

                         var item = {}

                         item.id = melse.name()
                         item.name = melse.val().name
                         item.description = melse.val().description
                         item.avatar = melse.val().avatar
                         item.messageboxCount = back.length;
                         item.position = position.val()

                         if (position.val() === 'FOUNDER' || position.val() === 'VP HR'){

                            item.requestCount = reqResult.numChildren();
                         }

                        
                         ////console.log(item)
                        //$scope.$apply(function(){
                          $scope.list.push(item)
                          //$scope.$apply()
                       // });


                    }) 
          
                     
                    })
                  
            console.log("4444444444")
               })
      
        
                //console.log(melse.name())
            });
        //  //console.log(childSnapshot.val())
        // //console.log(childSnapshot.name())

      });
   // //console.log(res.val())
   // //console.log(res.name())

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

// .controller('MessageboxCtrl', function($scope, $firebaseSimpleLogin, $state, $rootScope, $stateParams, messageboxSrvc) {

// var dataRef = new Firebase($scope.URL);
// var loginObj = $firebaseSimpleLogin(dataRef)
// var clubRef = new Firebase($scope.URL + "/clubs")


// loginObj.$getCurrentUser().then(function(currentUser){
//     $scope.me = currentUser;
//       messageboxSrvc.messagebox(currentUser.id, $stateParams.clublistId).then(function(messagebox){
//         $scope.messagebox = messagebox;
//          console.log(messagebox)       
//     })
// })

// $rootScope.$on('newMessage', function(value, data) {
//   //$scope.$apply(function(){
    
//      $scope.$apply(function(){
//        $scope.messageboxCount = data.length;
//      })
//      console.log(data.length + " .......length...........")
//   //})
 
  
// })



//  $scope.goToMessages = function() {
//    $state.go('app.messagebox', {clublistId: $stateParams.clublistId})
//  }


// })


