var karmaBotApp = angular.module('karmaBotApp', ['ngRoute', 'ngScrollbar', 'LocalStorageModule']);

karmaBotApp.config(['$routeProvider', '$locationProvider', 'localStorageServiceProvider', '$logProvider', function($routeProvider, $locationProvider, localStorageServiceProvider, $logProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  $logProvider.debugEnabled(true);

  localStorageServiceProvider
    .setPrefix('karmaBot')
    .setDefaultToCookie(false);

  $routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'AppCtrl'
  }).when('/login', {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  }).when('/logout', {
    template: " ",
    controller: 'LogOutCtrl'
  }).otherwise({
    redirectTo: '/'
  });

}]);

/******************* Services *******************************/
karmaBotApp.service('gruposService', ['$http', function($http) {
  var groups = '';

  return ({
    getGroups: getGroups
  });

  function getGroups() {
    if (groups.length > 0) {
      return groups;
    } else {
      return $http.get('/api/groups/all').then( function(result) {
        groups = result.data;
        return result.data;
      }, function(response) {
        console.log("Error retrieving contacts.");
      });
    }
  }

}]);

karmaBotApp.service('userService', ['$http', 'localStorageService', function($http, localStorageService) {
  return ({
    getUser: getUser,
    SaveUser: SaveUser,
    DeleteUser: DeleteUser,
    LogOut: LogOut,
    IsLog: IsLog,
    GetToken: GetToken,
    IsStart: IsStart
  });

  function getUser() {
    if (localStorageService.isSupported) {
      return localStorageService.get('karma_user');
    } else {
      console.log("Your browser is not compatible.");
    }
  }

  function DeleteUser() {
    if (localStorageService.isSupported) {
      localStorageService.remove('karma_user');
    } else {
      console.log("Your browser is not compatible.");
    }
  }

  function IsLog() {
    return false;
  }

  function GetToken() {
    return $http.get('/api/users/GetToken').then( function(result) {
      return result.data;
    }, function(response) {
      console.log("Error retrieving token.");
    });
  }

  function LogOut() {
    return $http.post('/logout').then( function(result) {
      return result.data;
    }, function(response) {
      console.log("Error retrieving token.");
    });
  }

  function IsStart(tok) {
    return $http.post('/api/users/GetTokenAuth', {
      token: tok
    }).then(function(result) {
      return result.data;
    }, function(response) {
      console.log("Error retrieving token.");
    });
  }

  function SaveUser(userInfo) {
    if (localStorageService.isSupported) {
      localStorageService.set('karma_user', userInfo);
    } else {
      console.log("Your browser is not compatible.");
    }
  }

}]);

/******************* Directives *****************************/
karmaBotApp.directive('krFillgauge',['$window', '$timeout', function($window, $timeout) {
  return {
    restrict: 'E',
    scope: {
      myGraph: '=',
      myIndex: '@',
      myCategory: '@'
    },
    templateUrl: 'views/parts/fillgauge.html',
    link: function(scope, element, attrs) {
      var circle;
      var innerCircleSolid;
      var text;

      $timeout( function() {
        var svgRaw = element.find("svg")[0];
        var col = element.find(".s7")[0];
        var h = $(svgRaw).height();
        var w = $(col).width();
        var r = (Math.min(h, w) - 15) / 2;
        var data = scope.myGraph;
        var d3 = $window.d3;
        var svg = d3.select(svgRaw)
          .attr('id', "fillgauge" + scope.myIndex)
          .attr("height", r*2+10);

        var g = svg.append('g');

        circle = g.append('circle')
          .attr('class', 'circle-resume')
          .attr('r', r)
          .attr('cx', w/2)
          .attr('cy', r+10);

        innerCircleSolid = g.append('circle')
          .attr('class', 'circle-inner-solid')
          .attr('r', r - 7)
          .attr('cx', w/2)
          .attr('cy', r+10);

        text = g.append('text')
          .attr('class', 'circle-text')
          .attr('x', w/2)
          .attr('y', r+10)
          .text(0);
      });

      scope.$watch('myGraph', function(newVal) {
        if (newVal) {
          text.text(scope.myGraph);
        }
      }, true);

    }
  };
}]);

karmaBotApp.directive('krVote',['$window', function($window) {
  return {
    restrict: 'E',
    scope: {
      myVote: '=',
      myIndex: '=',
      myType: '@'
    },
    templateUrl: 'views/parts/votes.html'
  };
}]);
/******************* Controllers ****************************/
karmaBotApp.controller('LoginCtrl', ['$scope', '$rootScope', 'userService', '$timeout', '$location', function($scope, $rootScope, userService, $timeout, $location) {
  var isSend = true;
  var maxTime = 0;
  var tokenStrip;

  $scope.saludo = "Hola";
  userService.GetToken().then( function(tok) {
    tokenStrip = tok.token;
    if (tok.token === false) {
      $scope.token = 'Refresh the browser for generate a token';
    } else {
      $scope.token = '/start ' + tok.token;
      startRequest();
    }
  });
  $rootScope.body_class = 'login-body';

  function startRequest() {
    if (isSend && maxTime < 36) {
      maxTime += 1;
      userService.IsStart(tokenStrip).then( function(resp) {
        if (resp.token === false) {
          $timeout(startRequest, 5000);
        } else {
          userService.SaveUser(resp.user);
          isSend = true;
          $location.path('/');
        }
      }).catch(function(err) {
        console.log(err);
      });
    }
  }

}]);

karmaBotApp.controller('LogOutCtrl', ['$location', 'userService', function($location, userService) {
  userService.DeleteUser();

  userService.LogOut().then( function(resp) {
    $location.path('/login');
  }).catch(function(err) {
    console.log("Error on log out");
  });
}]);

karmaBotApp.controller('AppCtrl', ['$scope', '$rootScope', 'userService', 'gruposService', function($scope, $rootScope, userService, gruposService) {
  $rootScope.body_class = '';
  $scope.user = userService.getUser();
  gruposService.getGroups().then( function(groups) {
    $scope.groups = groups;
    $scope.positiveVotes = positiveVotes();
    $scope.negativeVotes = negativeVotes();
    $scope.karma = $scope.positiveVotes - $scope.negativeVotes;
    $scope.votesRecieved = votes('to');
    $scope.votesSended = votes('from');
  });

  function positiveVotes() {
    var sum = 0;
    angular.forEach($scope.groups, function(g) {
      angular.forEach(g.historyV, function(v) {
        if (v.to === $scope.user.username)
          if (v.vote === 1 )
            sum += 1;
      });
    });

    return sum;
  }

  function negativeVotes() {
    var sum = 0;
    angular.forEach($scope.groups, function(g) {
      angular.forEach(g.historyV, function(v) {
        if (v.to === $scope.user.username)
          if (v.vote === -1 )
            sum += 1;
      });
    });

    return sum;
  }

  function votes(type) {
    var votes = [];
    var max = 3;

    for (var i = 0, len = $scope.groups.length; i < len; i++) {
      for (var j = 0, len_j = $scope.groups[i].historyV.length; j < len_j; j++) {
        var g = $scope.groups[i];
        var v = $scope.groups[i].historyV[j];

        if (v[type] === $scope.user.username) {
          var vote = {
            "to": v.to,
            "from": v.from,
            "groupName": g.name,
            "score": v.vote,
            "date": v.date
          };

          votes.push(vote);
        }
      }
    }

    votes.sort(function(a, b) { return new Date(b.date) - new Date(a.date); } );
    votes = votes.slice(0, max);

    return votes;
  }


}]);

karmaBotApp.controller('NavCtrl', ['$scope', 'gruposService', 'userService', function($scope, gruposService, userService) {
  gruposService.getGroups().then(function(groups) {
    $scope.groups = groups;
  });
  $scope.user = userService.getUser();
}]);
