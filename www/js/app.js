
angular.module
('starter', ['ionic', 'firebase', 'others', 'clublist', 'ui.utils',
             'main','separate','ngCordova', 'monospaced.elastic','service', 'checklist-model'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

  if(window.cordova && window.cordova.plugins.Keyboard) {
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  }
  if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
        
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: "/search",
    views: {
      'menuContent' :{
        templateUrl: "templates/request.html"
      }
    }
  })

  .state('app.create', {
    url: "/create",
    views: {
      'menuContent' :{
        templateUrl: "templates/create.html",
        controller: 'CreateCtrl'
      }
    }
  })
  .state('app.clublists', {
    url: "/clublists",
    views: {
      'menuContent' :{
        templateUrl: "templates/clublists.html",
        controller: 'ClublistsCtrl'
      }
    }
  })

  .state('app.separate', {
    url: "/separate/:clublistId/:refName/:rule/:messageType/:position",
    views: {
      'menuContent' :{
        templateUrl: "templates/separate.html",
        controller: 'SeparateCtrl'
      }
    }
  })

  .state('app.single', {
    url: "/clublists/:clublistId",
    views: {
      'menuContent' :{
        templateUrl: "templates/clublist.html",
        controller: 'ClublistCtrl'
      }
    }
  })
  .state('app.messagebox', {
    url: "/messagebox/:clublistId",
    views: {
      'menuContent' :{
        templateUrl: "templates/messagebox.html",
        controller: 'ClublistCtrl'
      }
    }
  })



  .state('intro', {
    url: "/intro",
    
        templateUrl: "templates/intro.html",
        controller: 'IntroCtrl'
      
    
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/intro');
})

.filter('shaveEmail', function() {
 return function(email) {
  if(email)
    return email.slice(0,email.indexOf("@"))
};
})

.filter("timeago", function () {
  // credit: https://gist.github.com/rodyhaddad/5896883
  // thanks
  //time: the time
  //local: compared to what time? default: now
  //raw: wheter you want in a format of "5 minutes ago", or "5 minutes"
  return function (time, local, raw) {
    if (!time) return "never";

    if (!local) {
      (local = Date.now())
    }

    if (angular.isDate(time)) {
      time = time.getTime();
    } else if (typeof time === "string") {
      time = new Date(time).getTime();
    }

    if (angular.isDate(local)) {
      local = local.getTime();
    }else if (typeof local === "string") {
      local = new Date(local).getTime();
    }

    if (typeof time !== 'number' || typeof local !== 'number') {
      return;
    }

    var
    offset = Math.abs((local - time) / 1000),
    span = [],
    MINUTE = 60,
    HOUR = 3600,
    DAY = 86400,
    WEEK = 604800,
    MONTH = 2629744,
    YEAR = 31556926,
    DECADE = 315569260;

    if (offset <= MINUTE)              span = [ '', raw ? 'now' : 'less than a minute' ];
    else if (offset < (MINUTE * 60))   span = [ Math.round(Math.abs(offset / MINUTE)), 'min' ];
    else if (offset < (HOUR * 24))     span = [ Math.round(Math.abs(offset / HOUR)), 'hr' ];
    else if (offset < (DAY * 7))       span = [ Math.round(Math.abs(offset / DAY)), 'day' ];
    else if (offset < (WEEK * 52))     span = [ Math.round(Math.abs(offset / WEEK)), 'week' ];
    else if (offset < (YEAR * 10))     span = [ Math.round(Math.abs(offset / YEAR)), 'year' ];
    else if (offset < (DECADE * 100))  span = [ Math.round(Math.abs(offset / DECADE)), 'decade' ];
    else                               span = [ '', 'a long time' ];

    span[1] += (span[0] === 0 || span[0] > 1) ? 's' : '';
    span = span.join(' ');

    if (raw === true) {
      return span;
    }
    return (time <= local) ? span + ' ago' : 'in ' + span;
  }
})

//angular.module('ui.filters') copied from 
// https://github.com/angular-ui/angular-ui-OLDREPO/blob/master/modules/filters/unique/unique.js
.filter('unique', function () {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
})

 
//default avatar and profile image
  .constant('defaultImage', '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');

