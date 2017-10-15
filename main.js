var currencyCalculatorApp = angular.module('CurrencyCalculator', []);

currencyCalculatorApp.controller('MainController', function MainController($scope, $http, $timeout) {

    $scope.base = [];
    var chartData = {};

    var callAPI = function(url, callback) {
        $http({
            url: url,
            method: "GET"
        }).then(function(result) {
            callback(result.data);
        }, function(error) {
            alert(error);
        });
    }

    callAPI('http://api.fixer.io/latest', function(data) {
        $scope.base.push(data.base);

        angular.forEach(data.rates, function(v,k) {
          $scope.base.push(k);
        });        
    });   

    var drawChart = function() {
        //sort json
        Object.keys(chartData).sort()
 
        setTimeout(function(){
            var series = [];
            var obj = {};
            obj["name"] = $scope.sourceCurrency + ' to ' + $scope.targetCurrency;
            var categories = [];
            var value = [];

            for(var key in chartData) {
                categories.push(key);
                value.push(chartData[key]);
            }

            obj["data"] = value.reverse();
            series.push(obj);

            $('#chart').highcharts({
                title: {
                    text: 'conversion rate history',
                    x: -20 //center
                },
                subtitle: {
                    text: new Date(categories[categories.length-1]).toDateString() + ' - ' + new Date(categories[0]).toDateString(),
                    x: -20
                },
                xAxis: {
                    categories: categories.reverse()
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    valueSuffix: ''
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: series
            });

        }, 1000);              
    }  

    function buildChartData(data) {
        chartData[data.date] = data.rates[$scope.targetCurrency];
    }         

    $scope.getHistory = function() {
        if ($scope.sourceCurrency == null || $scope.targetCurrency == null || 
            $scope.sourceCurrency == undefined || $scope.targetCurrency == undefined || 
            $scope.sourceCurrency == $scope.targetCurrency) {

            $('#chart').empty();
            return;  
        }    

        var now = Date.now();

        for (var i=0; i<10; i++) {
            var date = new Date(now)
            var dateStringArray = date.toLocaleDateString().split('/');
            if (dateStringArray[0].length == 1) {
                dateStringArray[0] = '0' + dateStringArray[0];
            }
            if (dateStringArray[1].length == 1) {
                dateStringArray[1] = '0' + dateStringArray[1];
            }            
            var dateString = dateStringArray[2] + '-' + dateStringArray[0] + '-' + dateStringArray[1];
            if (date.getDay() == 6 || date.getDay() == 0) {
                i--;
            } else {
                callAPI('http://api.fixer.io/' + dateString + '?base=' + $scope.sourceCurrency + "&symbols=" + $scope.targetCurrency, buildChartData);                
            }  
            now = now - 86400000;      
        }

        drawChart();
    }

    function calculateResult(data) {
        $scope.result = $scope.amount * data.rates[$scope.targetCurrency];
    }      

    $scope.convert = function() {
        if ($scope.amount == null || $scope.sourceCurrency == null || $scope.targetCurrency == null || 
            $scope.amount == undefined || $scope.sourceCurrency == undefined || $scope.targetCurrency == undefined) {
            return;  
        }        

        if ($scope.sourceCurrency === $scope.targetCurrency) {
            $scope.result = $scope.amount;
        } else {
            callAPI('http://api.fixer.io/latest?base=' + $scope.sourceCurrency + "&symbols=" + $scope.targetCurrency, calculateResult);
        }     
    };
});