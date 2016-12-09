var app = angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova']);

app.run(function($ionicPlatform, $rootScope, $state, $stateParams) {
  $ionicPlatform.ready(function() {

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
  });

  $rootScope.$state = $state;
});

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.map', {
    url: '/map',
    views: {
      'menuContent': {
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl'
      }
    }
  })

  .state('app.matching', {
    url: '/matching',
    views: {
      'menuContent': {
        templateUrl: 'templates/matching.html',
        controller: 'MatchingCtrl'
      }
    }
  })

  .state('app.potency', {
    url: '/potency',
    views: {
      'menuContent': {
        templateUrl: 'templates/potency.html'
      }
    }
  })

  .state('app.flexible-vaccines', {
    url: '/flexible-vaccines',
    views: {
      'menuContent': {
        templateUrl: 'templates/flexible-vaccines.html'
      }
    }
  })
  
  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html'
      }
    }
  })

  .state('app.legacy', {
    url: '/legacy',
    views: {
      'menuContent': {
        templateUrl: 'templates/legacy.html'
      }
    }
  })

  .state('app.services', {
    url: '/services',
    views: {
      'menuContent': {
        templateUrl: 'templates/services.html'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
})

.filter('unique', function() {
   return function(collection, keyname) {
      var output = [], 
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });

      return output;
   };
})

.factory('databaseService', ['$http', '$q', function($http, $q){

  var getAllPools = function () {
    
    var res = [];
    var deferred = $q.defer();
    
    $http.get('js/database.json')
      .then(
        function (data) {
          angular.forEach(data.data.matching.items, function(item){
             res.push(item);  
         });
          deferred.resolve(res);
        }, 
        function (err) {
          deferred.reject(err);
        });
    
    return deferred.promise;
  }

  var getPoolsBySero = function (serotype) {
    
    var res = [];
    var deferred = $q.defer();
    
    $http.get('js/database.json')
      .then(
        function (data) {
          angular.forEach(data.data.matching.items, function(item){
             if ((item.type === serotype) && (res.indexOf(item.pool) === -1 )) {
              res.push(item.pool);
             }
         });
          deferred.resolve(res);
        }, 
        function (err) {
          deferred.reject(err);
        });
    
    return deferred.promise;
  }

  var getSouchesBySero = function (serotype) {
    
    var res = [];
    var deferred = $q.defer();
    
    $http.get('js/database.json')
      .then(
        function (data) {
          angular.forEach(data.data.matching.items, function(item){
             if ((item.type === serotype) && (res.indexOf(item.souche) === -1 )) {
              res.push(item.souche);
             }
         });
          deferred.resolve(res);
        }, 
        function (err) {
          deferred.reject(err);
        });
    
    return deferred.promise;
  }

  var getColors = function (serotype, souche, zone) {
    
    var res = [];
    var res2 = [];
    var deferred = $q.defer();
    
    $http.get('js/database.json')
      .then(
        function (data) {
          angular.forEach(data.data.matching.items, function(item){
             if ((item.type === serotype) && (item.souche === souche) && ( zone.indexOf(item.pool) !== -1 )) {
              res.push({couleur:item.couleur, topotype:item.topotype});
              res2.push(item.topotype);
             }
          });

          res.sort(function(a, b){
              var nameA=a.topotype.toLowerCase(), nameB=b.topotype.toLowerCase()
              if (nameA < nameB) //sort string ascending
                  return -1 
              if (nameA > nameB)
                  return 1
              return 0 //default return value (no sorting)
          });

          deferred.resolve({res, res2});
        }, 
        function (err) {
          deferred.reject(err);
        });
    
    return deferred.promise;
  }

  return {
    getAllPools: getAllPools,
    getPoolsBySero: getPoolsBySero,
    getSouchesBySero: getSouchesBySero,
    getColors: getColors
  }

}]);