var karmaBotApp = angular.module('karmaBotApp', ['ngRoute', 'ngScrollbar', 'LocalStorageModule']);

karmaBotApp.config(['$routeProvider', '$locationProvider', 'localStorageServiceProvider', function($routeProvider, $locationProvider, localStorageServiceProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  localStorageServiceProvider.setPrefix('karmaBot');

  $routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'AppCtrl'
  }).when('/login', {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  }).otherwise({ redirectTo: '/' });

}]);

karmaBotApp.service('gruposService', ['$http', function($http) {
  var groups = '';

  return ({
    getGroups: getGroups
  });

  function getGroups() {
    if (groups.length > 0) {
      return groups;
    } else {
      return $http.get('/api/groups/all').then(function(result) {
        groups = result.data;
        return result.data;
      }, function(response) {
        consoe.log("Error retrieving contacts.");
      });
    }
  }

}]);

karmaBotApp.service('userService', ['$http', function($http) {
  return ({
    getUser: getUser,
    isLog: isLog
  });

  function getUser() {
    // return $http.get('/api/groups/all').then(function(result) {
    //   groups = result.data;
    //   return result.data;
    // }, function(response) {
    //   consoe.log("Error retrieving contacts.");
    // });
  }

  function isLog() {
    return false;
  }
}]);

karmaBotApp.controller('LoginCtrl', ['$scope', function($scope) {
  $scope.saludo = "Hola";
}]);

karmaBotApp.controller('AppCtrl', ['$scope', 'userService', function($scope, userService) {
  $scope.saludo = "Hola";
  $scope.user = userService;
}]);

karmaBotApp.controller('NavCtrl', ['$scope', 'gruposService', function($scope, gruposService) {
  gruposService.getGroups().then(function(groups) {
    $scope.groups = groups;
  });
}]);
