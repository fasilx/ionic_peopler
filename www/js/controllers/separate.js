angular.module('separate', [])
.controller('SeparateCtrl', function($scope, $stateParams, $firebase, $ionicScrollDelegate,
 $firebaseSimpleLogin, $ionicModal, capturePictureSrvc, $state) {
  var clubRef = new Firebase($scope.URL + "/clubs").child($stateParams.clublistId);
  var clubSync = $firebase(clubRef);
  var userRef = new Firebase($scope.URL + "/users")
 // var messageAllRef = new Firebase($scope.URL + "/messages/" + $stateParams.clublistId + "/all")
 var messageGroupRef = new Firebase($scope.URL + "/messages/" + 
                                    $stateParams.clublistId + "/group/" + $stateParams.refName)
 var messagePersonRef = new Firebase($scope.URL + "/messages/" +
                                    $stateParams.clublistId + "/person/" + $stateParams.refName)




 $scope.scrollBottom = function(){
   $ionicScrollDelegate.scrollBottom();
   

 }


  $scope.imageData = ""; // if picture is taken use that, otherwise use empty string
  $scope.takePicture = function(){
      
       capturePictureSrvc.takePicture().then(function(imageMelse) {
      $scope.imageData = imageMelse;
      
  })
}


  if(angular.isDefined($stateParams.rule)){

    if ($stateParams.messageType === 'person') {
      var messageRef = messagePersonRef;
  
       //name for the top bar
       clubRef.child("/members/" + $stateParams.rule).once('value', function(melse){
        console.log(melse.val())
        $scope.separateBar = melse.val()
       })



    }
    else
    {
      var messageRef = messageGroupRef;
      $scope.separateBar = {position: $stateParams.rule} //matches the if statements response
      console.log($stateParams)
     // var list = $firebase(messageRef.limit(10)).$asArray();
    }


      var list = $firebase(messageRef.limit(10)).$asArray();

        list.$loaded().then(function(){ 

          list.pop();
          list.pop(); // remove 'rule' and 'sender' from array. they are methadata, not actual
          $scope.recievedMessages = list;

        })

      


  //console.log(list)

}



$scope.sendMessage = function(message){

  var loginObj = $firebaseSimpleLogin(new Firebase($scope.URL));
  var messageSync = $firebase(messageRef);


  var messageData = {message: message, image: $scope.imageData}

  if($scope.currentUser){
    var position = clubRef.child("members/" + $scope.currentUser.id + "/position").once( 'value', function(positionSnapshot) {

      messageSync.$push({sender: $scope.currentUser, message: messageData,
       position: positionSnapshot.val(),
       rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}).then(function(ref) {

          var messageboxItem = {}
          messageboxItem[$scope.currentUser.id] = true;
          clubRef.child("members/" + $stateParams.rule + "/messagebox").update(messageboxItem)


        $scope.imageData = "" /* clean the scope from lingering around for next messages */

      });

       });


  }else{

    loginObj.$getCurrentUser().then(function(currentUser){

      $scope.currentUser = currentUser; // set current user in scope while scope is alive

      var position = clubRef.child("members/" + currentUser.id + "/position").once( 'value', function(positionSnapshot) {


        messageSync.$push({sender: currentUser, message: messageData,
         position: positionSnapshot.val(),
         rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}).then(function(ref){

            var messageboxItem = {}
            messageboxItem[currentUser.id] = true;
            clubRef.child("members/" + $stateParams.rule + "/messagebox").update(messageboxItem)

           $scope.imageData = "" /* clean the scope from lingering around for next messages */

         });

      });

    })
  }

}


})
