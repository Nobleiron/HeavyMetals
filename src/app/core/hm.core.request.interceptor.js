angular.module('HM_RequestHeadersINT', [])
  .config(['$httpProvider', function ($httpProvider) {
    ///$httpProvider.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
    var _requestHeadersFn = [
      '$q',
      'localStorageService',
      function ($q, localStorageService) {
        var _requestHeaders = function (request) {
           var userObj = localStorageService.get("userObj");
            var guestSession = localStorageService.get('session');
          var reg = /index\.php/;
          request.headers["session_id"] = "TEMP_Session_id";
            request.headers["X-API-KEY"] = "123";
            if(guestSession && reg.test(request.url)){
              request.params = request.params || {};
              request.params.session_id = guestSession;
              request.data = request.data || {};
              request.data.session_id = guestSession;
            }

            if(userObj){
            request.headers["auth_token"] = localStorageService.get("userObj").auth_token
            }


          return request || $q.when(request);
        };
        return {request: _requestHeaders};
      }];

    $httpProvider.interceptors.push(_requestHeadersFn);
  }]);
