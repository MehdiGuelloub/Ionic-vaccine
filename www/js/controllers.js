angular.module('starter.controllers', [])


.controller('AppCtrl', ['$scope', '$rootScope', 'databaseService', function($scope, $rootScope, databaseService){

  $scope.serotypes = ["All", "O", "A", "ASIA", "SAT1", "SAT2", "SAT3", "C"];

  $scope.pools = ["All", "Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6"];

  $scope._selectedSerotype = "All";
  $scope._selectedPool = "All";

  $scope.showSerotypes = function (id){
    console.log(id);
    $scope._selectedSerotype = id;
  }
  $scope.showPools = function (id){
    console.log(id);
    $scope._selectedPool = id;
  }
}])

.controller('MapCtrl', ['$scope','$ionicSideMenuDelegate', function($scope, $ionicSideMenuDelegate){
  
  $scope.$on('$ionicView.afterEnter', function(event) {
        $ionicSideMenuDelegate.canDragContent(false);
    });
    //enable side menu drag before moving to next view
    $scope.$on('$ionicView.beforeLeave', function (event) {
        $ionicSideMenuDelegate.canDragContent(true);
    });
}])

.controller('MatchingCtrl', ['$scope', '$rootScope', 'databaseService', function($scope, $rootScope, databaseService){
  var theSelectedSerotypeIs = null;
  var souches = [];
  $scope.poolsModels = [];
  $scope.selectedSouches = [];
  $scope.cercle = [];

  $scope.serotypesModels = [
    {name:'O' , value: false},
    {name:'A' , value: false},
    {name:'ASIA' , value: false},
    {name:'SAT1' , value: false},
    {name:'SAT2' , value: false},
    {name:'SAT3' , value: false},
    {name:'C' , value: false}
  ];


  $scope.getSeroPools = function (selected) {
    theSelectedSerotypeIs = selected.name;
    $scope.selectedSouches = [];
    $scope._topotypes = [];
    $scope.cercle = [];
    $scope.poolsModels = [];
    if (selected.value) {
        $scope.seroIsSelected = true;
        for(var i in $scope.serotypesModels){
          if(selected.name !== $scope.serotypesModels[i].name) {
            $scope.serotypesModels[i].value = false;
          }
        }
        var SeroZones = [];
        databaseService.getPoolsBySero(selected.name).then(function (data) {
          for(var i = 0; i < data.length; i++) {
              SeroZones.push({name: data[i], value:false, stat: false});
          }
          $scope.SeroZones = SeroZones;
        }, function (err) {
          alert(err);
        });

        var SeroSouches = [];
        databaseService.getSouchesBySero(selected.name).then(function (data) {
          for(var i = 0; i < data.length; i++) {
              SeroSouches.push({name: data[i], value:false, stat: false});
          }
          $scope.SeroSouches = SeroSouches;
        }, function (err) {
          alert(err);
        });
        
    } else {
      $scope.seroIsSelected = false;
    }
  }

  $scope.addPools = function (selectedPool) {
    angular.forEach($scope.SeroSouches, function(souche, key){
      souche.value = false;
      souche.stat = false;
    });
    $scope._topotypes = [];
    $scope.selectedSouches = [];
    $scope.cercle = [];
    souches = [];

    if (selectedPool.value) {
      $scope.poolsModels.push(selectedPool.name);
      if ($scope.poolsModels.length >= 3) {
        for(var z in $scope.SeroZones) {
          if ($scope.SeroZones[z].value === false) {
            $scope.SeroZones[z].stat = true;
          }
        }
      }
    } else {
      $scope.poolsModels.splice($scope.poolsModels.indexOf(selectedPool.name), 1);
      if ($scope.poolsModels.length < 3) {
        for(var z in $scope.SeroZones) {
            $scope.SeroZones[z].stat = false;
        }
      }
    }
  }

  $scope.getSoucheCoulors = function (selectedSouche) {
      if($scope._topotypes.length === 0) {
        databaseService.getColors(theSelectedSerotypeIs, selectedSouche.name, $scope.poolsModels).then(function (data) {
          var array = data.res2;
          array.sort();
          var count = 1;
          for (var i = 0; i < array.length; i++) {
            if (array[i] === array[i+1]) {
              count++;
            } else{
              $scope._topotypes.push({nbr:count, name: array[i]});
              count = 1;
            };
          };
        }, function (err) {
          alert(err);
        });
        
        $scope.cercle.push($scope._topotypes);
      }
      if (selectedSouche.value) {
        $scope.selectedSouches.push(selectedSouche.name);
        if ($scope.selectedSouches.length >= 4) {
          for(var z in $scope.SeroSouches) {
            if ($scope.SeroSouches[z].value === false) {
              $scope.SeroSouches[z].stat = true;
            }
          }
        }

        databaseService.getColors(theSelectedSerotypeIs, selectedSouche.name, $scope.poolsModels).then(function (data) {
          $scope.cercle.push({name: selectedSouche.name, colors: data.res});
          console.log(data.res.length);
        }, function (err) {
          alert(err);
        });
      } else{
        $scope.selectedSouches.splice($scope.selectedSouches.indexOf(selectedSouche.name), 1);
        if ($scope.poolsModels.length < 4) {
          for(var z in $scope.SeroSouches) {
              $scope.SeroSouches[z].stat = false;
          }
        }
        for(var i=0; i < $scope.cercle.length; i++) {
           if($scope.cercle[i].name === selectedSouche.name)
           {
              $scope.cercle.splice(i,1);
              break;
           }
        }
      }
  }
}]);