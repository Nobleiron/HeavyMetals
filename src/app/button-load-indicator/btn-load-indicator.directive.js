'use strict';
angular.module("HM_BtnLoadIndicatorMD")
  .directive('btnLoadIndicator', ['$compile', function($compile){
    return {
      scope : {
        'btnUid' :'=btnUid'
      },
      link : function(scope,element,attrs){

        var loader = $compile("<i class='fa fa-spinner fa-spin' ng-show='loading' style='font-size: 18px;'></i>")(scope),
          eventName = attrs.btnLoadIndicator;
        element.after(loader);

        scope.$on(eventName+':Start', function(e, uid){
          if(scope.btnUid == uid){
            scope.loading = true;
            element.parent('button').attr("disabled","disabled");
            element.hide();
          }
        });

        scope.$on(eventName+':End', function(e, uid){
          if(scope.btnUid == uid) {
            scope.loading = false;
            element.parent('button').removeAttr("disabled");
            element.show();
          }
        });




      }
    };
  }]);