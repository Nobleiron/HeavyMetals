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
            request.headers["X-API-KEY"] = "123";
            if(reg.test(request.url)){
              request.headers["session_id"] = guestSession || new Date().getTime();
              request.data = request.data || {};
              request.data.session_id = guestSession;
            }

            if(userObj){
            request.headers["auth_token"] = localStorageService.get("userObj").auth_token
            }else if(reg.test(request.url)){
              request.headers["session_id"] = guestSession;
              request.data = request.data || {};
              request.data.session_id = guestSession;
            }


          return request || $q.when(request);
        };
        return {request: _requestHeaders};
      }];

    $httpProvider.interceptors.push(_requestHeadersFn);
  }]);
