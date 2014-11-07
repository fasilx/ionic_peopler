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

var ref = new Firebase($scope.URL)


 $scope.scrollBottom = function(){
  if(!$scope.ignoreScrollBottom){

   $ionicScrollDelegate.scrollBottom();
 }
 

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
      $scope.separateBar = {position: $stateParams.position}
     
      // if($stateParams.refName.split) { //rule in this case tells us whether this is open dicsussion or private among the gruope members
      //    $scope.separateBar = {position: $stateParams.position}
       
      // }else 
      // {
      //    $scope.membersOnly = true
      //    $scope.separateBar = {position: 'ONLY ' + $stateParams.position}
      // }
      // console.log($stateParams)
     // var list = $firebase(messageRef.limit(10)).$asArray();
    }


      var load = 10;
        $scope.loadMore = function(){
            // adds 10 more data everytime it is called.

             load =  load + 10;

            var list = $firebase(messageRef.limit(load)).$asArray();

              list.$loaded().then(function(){ 

                list.pop();
                list.pop(); // remove 'rule' and 'sender' from array. they are methadata, not actual
                $scope.recievedMessages = list;

              })
            $scope.ignoreScrollBottom = true;
            //$ionicScrollDelegate.scrollTop();
             console.log("scrolling top")

        }

      
      $scope.ignoreScrollBottom = false;  //set this to false if 'load more' button is not pressed
      var list = $firebase(messageRef.limit(load)).$asArray();

        list.$loaded().then(function(){ 

          list.pop();
          list.pop(); // remove 'rule' and 'sender' from array. they are methadata, not actual
          $scope.recievedMessages = list;

        })

      


  //console.log(list)

}


  ref.onAuth(function(currentUser){
  //currentUser.id = currentUser.uid.split(":")[1] //the new simple login does not proved id
      $scope.me = currentUser;
})



$scope.sendMessage = function(message){

  //var ref = $firebaseSimpleLogin(new Firebase($scope.URL));
  var ref = new Firebase($scope.URL);

  var messageSync = $firebase(messageRef);


  var messageData = {message: message, image: $scope.imageData}

  if($scope.currentUser){
    var position = clubRef.child("members/" + $scope.currentUser.uid + "/position").once( 'value', function(positionSnapshot) {

      messageSync.$push({sender: $scope.currentUser, message: messageData,
       position: positionSnapshot.val(),
       rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}).then(function(ref) {

          var messageboxItem = {}
          messageboxItem[$scope.currentUser.uid] = true;
          if(stateParams.rule.split(",").length === 1){
          clubRef.child("members/" + $stateParams.rule + "/messagebox").update(messageboxItem)
          }

        $scope.imageData = "" /* clean the scope from lingering around for next messages */

      });

       });


  }else{

      ref.onAuth(function(currentUser){
      //currentUser.id = currentUser.uid.split(":")[1]

      $scope.currentUser = currentUser; // set current user in scope while scope is alive

      var position = clubRef.child("members/" + currentUser.uid + "/position").once( 'value', function(positionSnapshot) {


        messageSync.$push({sender: currentUser, message: messageData,
         position: positionSnapshot.val(),
         rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}).then(function(ref){

             var messageboxItem = {}
            messageboxItem[$scope.currentUser.uid] = true;
            if(stateParams.rule.split(",").length === 1){
            clubRef.child("members/" + $stateParams.rule + "/messagebox").update(messageboxItem)
            }

           $scope.imageData = "" /* clean the scope from lingering around for next messages */

         });

      });

    })
  }

}


})
