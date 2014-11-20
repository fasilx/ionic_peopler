angular.module('service', [])

.service('messageboxSrvc', [ '$firebase', '$q', '$rootScope',function($firebase, $q, $rootScope) {

 this.messagebox = function(currentUserId, clublistId){
   var clubRef = new Firebase("https://peopler.firebaseio.com/clubs/" + clublistId);
   var userRef = new Firebase("https://peopler.firebaseio.com/users")
   var messageboxMessage = [];
   var deferred = $q.defer();

   clubRef.child('members/' + currentUserId + '/messagebox').on('value', function(melse){

    if( angular.isObject(melse.val()) ){

    angular.forEach(melse.val(), function(value, key) {
      //console.log(value)
      userRef.child(key).on('value',function(res){
        if (value) {

          messageboxMessage.push(res.val());
          //console.log(messageboxMessage)

        };
        $rootScope.$broadcast('newMessage', messageboxMessage)    
        deferred.resolve(messageboxMessage);
       // console.log(messageboxMessage)
        
      })
    });
  }
  })  
    //})

return deferred.promise;

}

}])

.service('capturePictureSrvc', [ '$firebase', '$ionicActionSheet', '$cordovaCamera', '$q',
  function($firebase, $ionicActionSheet, $cordovaCamera, $q) {


    
    this.takePicture = function() {

      
      var deferred = $q.defer();
            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
             buttons: [
             { text: 'From Camera' },
             { text: 'From Album' }
             ],
             cancelText: 'Cancel',
             cancel: function() {
                  // add cancel code..
                },
                buttonClicked: function(index) {
                  
                  capturePicture(index);

                  return true;
                }
              });

            var capturePicture  = function(index) {

              if (index === 0) {sourceType = Camera.PictureSourceType.CAMERA} else{sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM};
              var options = { 
                quality : 75, 
                destinationType : Camera.DestinationType.DATA_URL, 
                sourceType : sourceType, 
                allowEdit : true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 400,
                targetHeight: 400,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
              };
              var imageData;
              $cordovaCamera.getPicture(options).then(function(imageMelse) {
                
                
                deferred.resolve(imageMelse);

              }, function(err) {
                console.log(err)
              },function(){

                      //console.log(imageMelse)
                    });
            }

            return deferred.promise;
          }


  //  return {
  //   takePicture: takePicture
  // };




}])

