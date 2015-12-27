'use strict';
/**
 * @ngdoc directive
 * @name rfx.directive:rAutogrow
 * @element textarea
 * @function
 *
 * @description
 * Resize textarea automatically to the size of its text content.
 *
 * **Note:** ie<9 needs pollyfill for window.getComputedStyle
 *
 * @example
 <example module="rfx">
 <file name="index.html">
 <textarea ng-model="text"rx-autogrow class="input-block-level"></textarea>
 <pre>{{text}}</pre>
 </file>
 </example>
 */
angular.module('HeavyMetals')
  .controller('HM_HeaderCtrl', ['$scope','$state','filterFilter','HM_RestSV','HM_HeaderCnst','localStorageService',function ($scope,$state,filterFilter, RestSV,HeaderCnst, localStorageService) {

    $scope.getProducts = getProducts;

    $scope.selectSearchedItem = selectSearchedItem;

    _initialize();

    function selectSearchedItem(product){
      //var query = '';
      if(typeof $scope.selectedProduct == "object"){
        $scope.params.query = $scope.selectedProduct.Product_Name;
      }
      if(typeof $scope.selectedProduct == "string"){
        $scope.params.query = $scope.selectedProduct;
      }
      product && ($scope.params.category_id = product.Category_Id);
      $scope.params.page = 1;
      $state.go('hm.search.results', $scope.params);
      //$state.go('hm.search', { query : query},{ reload: true });
    }

    function getProducts(search){
      return RestSV.get( HeaderCnst.search.url() ,{
        search_text : search,
      }).then(function(response){
        var filtered = filterFilter(response.data.result.ProductList, search);
        var results = _(filtered)
          .groupBy('Category_Name')
          .map(function (g) {
            g[0].firstInGroup = true;  // the first item in each group
            return g;
          })
          .flatten()
          .value();
        return results;
      });
    }

    function _initialize(){
      $scope.selectedProduct = $scope.params.query || '';
      $scope.flags = {
        rented : true
      };
      $scope.userObj = localStorageService.get('userObj');
    }

    $scope.$on("PortalAccess:Granted", function(){
      $scope.userObj = localStorageService.get('userObj');
    });

    $scope.toggleHeader = function() {
      $scope.showHeader = !$scope.showHeader
    };

    $scope.$watch('params.query', function(){
      $scope.selectedProduct = $scope.params.query || '';
    })


  }]);
