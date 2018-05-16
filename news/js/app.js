var app = angular.module('news', []);

//controller
app.controller('landingPageController',['$scope','$http',function($scope,$http){
	//constants
	var api_key = '746ff27830c54cf7b62c48b4c75a3d7e';
	var api_url = 'https://newsapi.org/v2/top-headlines?country=in&sortBy=publishedAt&pageSize=8&apiKey='+api_key;

	//scope var
	$scope.is_loading = {
		status : true,
		type : 'initial'
	};
	$scope.error = {
		status : false,
		msg : ''
	};
	$scope.sidebar = {
		status:false
	};
	$scope.news_array = [];
	$scope.my_fav_array = [];
	$scope.categories = ['all','business','entertainment','general','health','sports']
	$scope.active_categories = 'all';
	$scope.page = 1;


	//get news from newsapi.org
	$scope.getNews = function(){

		if($scope.active_categories!='all')
			var final_url = api_url+'&category='+$scope.active_categories;
		else
			var final_url = api_url;

		final_url = final_url+'&page='+$scope.page;
		//console.log(api_url)
		$http({
			method : "GET",
	        url : final_url
		}).then(function(response){
			if(response.data.status=='ok')
			{
				$scope.news_array = response.data.articles;
				console.log($scope.news_array);
				$scope.is_loading = {status : false };	
			}
		});
	}

	//filter
	$scope.filterClick = function(category)
	{
		/*
		var i = $scope.active_categories.indexOf(category);

		(i==-1) ? $scope.active_categories.push(category) : $scope.active_categories.splice(i,1);

		console.log($scope.active_categories);
		*/
		$scope.active_categories = category;
		$scope.is_loading = {
			status : true,
			type : 'filter-click'
		};

		$scope.getNews();
	}

	$scope.pageChange = function(page)
	{
		$scope.page = page;
		$scope.getNews();
	}

	$scope.sideBarClick = function(){
		$scope.sidebar.status = !$scope.sidebar.status;
	}

	$scope.handleDrop = function(index, bin) {
    //alert('Item ' + item + ' has been dropped into ' + bin);
    if($scope.my_fav_array.indexOf($scope.news_array[index])==-1)
	    $scope.my_fav_array.push($scope.news_array[index])
	}

  $scope.removeFromFav = function(index)
  {
    $scope.my_fav_array.splice(index,1);
  }

	$scope.getNews();
}]);



//filters
//limit a string
app.filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
              //Also remove . and , so its gives a cleaner result.
              if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
                lastspace = lastspace - 1;
              }
              value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});

//directives
app.directive('draggable', function() {
  return function(scope, element) {
    // this gives us the native JS object
    var el = element[0];
    
    el.draggable = true;
    
    el.addEventListener(
      'dragstart',
      function(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('Text', this.id);
        this.classList.add('drag');
        return false;
      },
      false
    );
    
    el.addEventListener(
      'dragend',
      function(e) {
        this.classList.remove('drag');
        return false;
      },
      false
    );
  }
});

app.directive('droppable', function() {
  return {
    scope: {
      drop: '&',
      bin: '='
    },
    link: function(scope, element) {
      // again we need the native object
      var el = element[0];
      
      el.addEventListener(
        'dragover',
        function(e) {
          e.dataTransfer.dropEffect = 'move';
          // allows us to drop
          if (e.preventDefault) e.preventDefault();
          this.classList.add('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'dragenter',
        function(e) {
          this.classList.add('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'dragleave',
        function(e) {
          this.classList.remove('over');
          return false;
        },
        false
      );
      
      el.addEventListener(
        'drop',
        function(e) {
          // Stops some browsers from redirecting.
          if (e.stopPropagation) e.stopPropagation();
          
          this.classList.remove('over');
          
          var binId = this.id;
          var item = document.getElementById(e.dataTransfer.getData('Text')).cloneNode(true);
          item.classList.remove('drag');
          //this.appendChild(item);
          // call the passed drop function
          scope.$apply(function(scope) {
            var fn = scope.drop();
            if ('undefined' !== typeof fn) {   
            	var index = document.getElementById(e.dataTransfer.getData('Text')).getAttribute('myindex');         
              fn(index, binId);
            }
          });
          
          return false;
        },
        false
      );
    }
  }
});