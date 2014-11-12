angular.module('separate', [])
.controller('SeparateCtrl', function($scope, $stateParams, $firebase, $ionicScrollDelegate,
                                     $firebaseSimpleLogin, $ionicModal, capturePictureSrvc, 
                                     $state, $timeout, $cordovaDialogs, $filter) {

  var clubRef = new Firebase($scope.URL + "/clubs").child($stateParams.clublistId);
  var clubSync = $firebase(clubRef);
  var userRef = new Firebase($scope.URL + "/users")
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


    if ($stateParams.messageType === 'person') {
      var messageRef = messagePersonRef;

       //name for the top bar
       clubRef.child("/members/" + $stateParams.rule).once('value', function(melse){
        console.log(melse.val())
        $scope.separateBar = melse.val().position[0] + " | " + $filter('shaveEmail')(melse.val().email)
      })

     }
     else
     {
      var messageRef = messageGroupRef;
      $scope.separateBar = $stateParams.position
    }

  var recievedMessagesMethod = function(){

   messageRef.limitToLast(load).on('value',function(allMessages){
        $scope.recievedMessages = []
          // console.log(Object.keys(allMessages.val()).indexOf('receivervh'))
       angular.forEach(allMessages.val(), function(value, key) {
          if(key !== 'sender' && key !== 'receiver')
          $scope.recievedMessages.push(value)
        });

        $timeout(function() {
         $scope.$apply(function(){

          //console.log(allMessages.val())
          // $scope.recievedMessages = allMessages.val()

          $scope.recievedMessagesLength = allMessages.numChildren()
          //console.log($scope.recievedMessagesLength)
        })
       }); 
      })
  }


 var load = 10;
 $scope.loadMore = function(){
        // adds 10 more data everytime it is called.

    load =  load + 10;
    recievedMessagesMethod()

        $scope.ignoreScrollBottom = true;
  }

  $scope.ignoreScrollBottom = false;  //set this to false if 'load more' button is not pressed

  recievedMessagesMethod();


  $scope.sendMessage = function(message){

  
    if($scope.currentUser){
      sendMessageMethod(message,$scope.currentUser)
    }else{
      ref.onAuth(function(message,currentUser){
        //currentUser.id = currentUser.uid.split(":")[1]
        $scope.currentUser = currentUser; // set current user in scope while scope is alive
        sendMessageMethod(currentUser)
      })
    }

  }


  var sendMessageMethod = function(message,currentUser){

        var ref = new Firebase($scope.URL);
        var position = clubRef.child("members/" + currentUser.uid + "/position").once( 'value', function(positionSnapshot) {
        var messageData = {message: message, image: $scope.imageData}

        $scope.loading = true //.././././././././././././.
        messageRef.push({sender: currentUser, message: messageData,
         position: positionSnapshot.val(),
         rule: false, createdAt: Firebase.ServerValue.TIMESTAMP}, function(ref){

          $scope.loading = false //.././././././././././././.

           var messageboxItem = {}
           messageboxItem[$scope.currentUser.uid] = true;
           if($stateParams.rule.split(",").length === 1){
            clubRef.child("members/" + $stateParams.rule + "/messagebox").update(messageboxItem)
          }

          $cordovaDialogs.beep(1)
          $scope.imageData = "" /* clean the scope from lingering around for next messages */
        });
    });
  }
})
