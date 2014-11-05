angular.module('service', [])

.service('messageboxSrvc', [ '$firebase', '$q', '$rootScope',function($firebase, $q, $rootScope) {

     this.messagebox = function(currentUserId, clublistId){
       var clubRef = new Firebase("https://peopler.firebaseio.com/clubs/" + clublistId);
       var userRef = new Firebase("https://peopler.firebaseio.com/users")
       var messageboxMessage = [];
       var deferred = $q.defer();

       clubRef.child('members/' + currentUserId + '/messagebox').on('value', function(melse){

        console.log("service called for child added");


        angular.forEach(melse.val(), function(value, key) {
          userRef.child(key).on('value',function(res){
            if (value) {
              console.log(value + "   value")
              console.log(key)
              messageboxMessage.push(res.val());
              // $rootScope.$broadcast('messageboxCount', {count: res.val().length})
               console.log(res.val().length + " length from here")
              //messageboxCount = messagebox.length
            };
             $rootScope.$broadcast('newMessage', messageboxMessage)    
            deferred.resolve(messageboxMessage);
            console.log(messageboxMessage.length + "........service......")
            console.log(messageboxMessage)
          })
        });
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
                quality : 95, 
                destinationType : Camera.DestinationType.DATA_URL, 
                sourceType : sourceType, 
                allowEdit : true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 100,
                targetHeight: 100,
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

