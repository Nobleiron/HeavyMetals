'use strict';
angular.module("HM_SearchMD")
  .controller("HM_SearchResultCtrl", ['$scope','$state','$stateParams','HM_RestSV','HM_SearchCnst', '$location', '$anchorScroll', '$window',
    function($scope,$state, $stateParams, RestSV, SearchCnst, $location, $anchorScroll, $window){


      $scope.addToOrRemoveFromWishList = addToOrRemoveFromWishList;

      $scope.lazyLoadSearchResult = lazyLoadSearchResult;

      $scope.clearSearchTag = clearSearchTag;

      !angular.equals({}, $scope.flags.selectedCategory) ? _initialize() : $scope.$on('Categories:Loaded', _initialize);

      function _initialize(event,fresh){
        $scope.flags.gridView = $stateParams.view_type == "grid";
        $scope.searchTags = [];
        jQuery.extend($scope.params,$stateParams);
        $scope.params.attributes && _setCategoryAttributesFromParams($scope.params.attributes);
        $scope.flags.stopPaging = false;
        $scope.flags.page = 1;
        $scope.flags.categoriesFetched = true;
        $scope.params.category_id && ($scope.flags.selectedCategory =  _.find($scope.categories,function(x){
          return x.Id == $scope.params.category_id;
        }));

        $scope.params.query = $scope.params.query || '';
        _buildSearchTags();
        if($scope.params.query){
          _getSearchResult(fresh);
        }else{
          _getProductListFromSelectedCategory(fresh);
        }
      }


      function _setCategoryAttributesFromParams(attributes){
        if(typeof attributes == "string"){
          var key = attributes.split('~');
          $scope.selectedAttributes[key[0]] = key[1].split(',');
        }
        if(typeof attributes == "object"){
          attributes.forEach(function(attr){
            var key = attr.split('~');
            $scope.selectedAttributes[key[0]] = key[1].split(',');
          })
        }
      }


      function _buildSearchTags(){
        for(var param in $scope.params){
          if(param == "query" && $scope.params.query){
            $scope.searchTags.push({name : "Search:" + $scope.params.query, tagType : 'query'});
          }
        }
      }

      function clearSearchTag(tagType){
         $scope.params[tagType] = undefined;
        $scope.searchTags = _.filter($scope.searchTags, function(tag){
          return tag.tagType != tagType;
        });
        $scope.flags.page = 1;
        $state.go('hm.search.results', $scope.params);
      }



      function addToOrRemoveFromWishList(product){
        $scope.$broadcast('Add:Wishlist:Process:Start', product.Product_Id);
        if(product.Is_in_catelog){
          RestSV
            .delete( SearchCnst.addToOrRemoveFromWishList.url(),{ product_id : product.Product_Id })
            .success(function(response){
              product.Is_in_catelog = false;
              $scope.catelog = false;
            })
            .finally(function(){
              $scope.$broadcast('Add:Wishlist:Process:End',product.Product_Id)
            });
        }else{
          RestSV
            .post( SearchCnst.addToOrRemoveFromWishList.url(),{ product_id : product.Product_Id })
            .success(function(response){
              product.Is_in_catelog = true;
              $scope.catelog = true;
            })
            .finally(function(){
              $scope.$broadcast('Add:Wishlist:Process:End',product.Product_Id)
            });
        }

      }


      function lazyLoadSearchResult(){
        if($scope.flags.categoriesFetched && !$scope.flags.stopPaging){
          $scope.params.query ? _getSearchResult() : _getProductListFromSelectedCategory();
        }
      }

      function _getProductListFromSelectedCategory(fresh){
        if(fresh){
          $scope.results = [];
          $scope.flags.page = 1;
        }
        if(!$scope.flags.stopPaging && !$scope.flags.resultFetching) {
          $scope.flags.resultFetching = true;
          $scope.flags.searchResultLoading = true;
          var browseProduct = RestSV.post(SearchCnst.productByCategory.url(), {
            page: $scope.flags.page,
            category_id: $scope.params.category_id,
            attributes : _getCategoryAttributeParams()
          });

          browseProduct.success(function (data) {
            if (data.result == "") {
              $scope.flags.stopPaging = true;
            } else {
              $scope.results = $scope.results.concat(data.result.ProductList);
              $scope.flags.page += 1;
            }
          });
          browseProduct.finally(function () {
            $scope.flags.resultFetching = false;
            if ($scope.flags.page && !$scope.results.length) {
              $scope.userQuery = true;
            }
            $scope.flags.searchResultLoading = false;
          })
        }
      }


      function _getCategoryAttributeParams(){
        var obj = [];
        if(typeof $scope.params.attributes == "string"){
          var key = $scope.params.attributes.split('~');
          var att = {};
          att[key[0]] = key[1].split(',');
          obj.push(att);
        }
        if(typeof $scope.params.attributes == "object"){
          $scope.params.attributes.forEach(function(attribute){
            var key = attribute.split('~');
            var att = {};
            att[key[0]] = key[1].split(',');
            obj.push(att);
          });
        }
        return obj.length ?  obj : undefined;
      }

      function normalizeSearchQuery(str){
        return str.replace('\'','');
      }

      function _getSearchResult(fresh){
        if(fresh){
          $scope.results = [];
          $scope.flags.page = 1;
          $scope.flags.stopPaging = false;
        }
        if(!$scope.flags.stopPaging && !$scope.flags.resultFetching){
          $scope.flags.resultFetching = true;
          $scope.flags.searchResultLoading = true;
          RestSV
            .post( SearchCnst.search.url() ,{
              search_text : normalizeSearchQuery($scope.params.query),
              page : $scope.flags.page,
              category_id : $scope.params.category_id
            })
            .success(function(data){
              if(data.result == ""){
                $scope.flags.stopPaging = true;
              }else{
                var result = data.result.SearchResult || data.result.ProductList;
                $scope.results = $scope.results.concat(result);
                $scope.flags.page += 1 ;
              }
            })
            .finally(function(){
              $scope.flags.resultFetching = false;
              if($scope.flags.page && !$scope.results.length){
                $scope.userQuery = true;
              }
              $scope.flags.searchResultLoading = false;
            })
        }
      }
      // scroll to top button
      $scope.gotoTop = function() {
        $location.hash('bottom');
        $anchorScroll();
      }



      // scroll to top button

    }]);
