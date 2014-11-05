
angular.module
('starter', ['ionic', 'firebase', 'others', 'clublist',
             'main','separate','ngCordova', 'monospaced.elastic','service'])

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
        templateUrl: "templates/search.html"
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
    url: "/separate/:clublistId/:refName/:rule/:messageType",
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
});

