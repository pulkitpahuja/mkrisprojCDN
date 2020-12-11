var variable_choose={};

var app = angular.module('voltage_app', []);

Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

app.controller('active_devices', function($scope, $http,$interval) {
  $http.put("/dashboard")
    .then(function(response) {
    $scope.email=response.data;
    if($scope.email.length==0){
      $("#alerts_div").append(" <div class='alert alert-danger alert-dismissible fade show mt-4 text-center' role='alert'>\
            <h4 class='alert-heading'>Email for this account is not set up.</h4>\
            <p class='mb-0'>Click<a href='#' id='edit_device'> here </a> to setup your email to get alerts in the future.</p>\
          </div>");

          $(function() {
            document.getElementById("edit_device").onclick = function() {
              changepage("/edit_devices");
            };
          });
         
    }
  });
  
  $interval(function () {
    $http.post("/voltage_metering_vars",{type: "active"})
    .then(function(response) {
        $scope.actives=response.data;
    });
},1000);




});

app.controller('image_controller', function($scope, $http) {

  $http.post("/get_image")
  .then(function(response) {
    $scope.image=response.data;
  });
});



app.controller('inactive_devices', function($scope, $http,$interval) {
  $interval(function () {
    $http.post("/voltage_metering_vars",{type: "inactive"})
    .then(function(response) {
        $scope.inactives=response.data;
    });
  },1000);

  
});

function getaccdata(){
  //logout function to logout the user and redirect the user to the login screen
   
  return new Promise(function(resolve,reject){
      
    var temp;
               $.ajax({
                    type: "PUT",         //Data is only sent from the server in Post Method rather than GET
                    async: false,         // To allow the storage of data in a local variable
                    url: "/voltage_metering_data",
                    success: function(result) {
                      temp= result;
                     } 
                      
              });
             resolve(temp)
    }) 
           
    }

app.controller('myCtrl', function($scope, $http,$timeout) {
      $http.put("/voltage_metering_data",{reporting_flag:"1",type:"voltage"})
      .then(function(response) {
        $scope.data=response.data;  
        $timeout(function() {
   
          var variables=[];
          
        $('#devices_table input[type=checkbox]').change(function () {
          variables=[];
          for (var i=0;i<$scope.data.length;i++){
            if ($scope.data[i]["site_id"]==this.id){
              variables=JSON.parse($scope.data[i]["vars"]);
            }
          }
          if(document.getElementById(this.id).checked){
            for (var elem in variables){
              $("#table_var_tbody").append("<tr>\
              <th scope='row'><input type='checkbox' id='checkbox."+this.id+"."+variables[elem]+"'>\
              </th>\
              <td>"+this.id+"</td><td>"+variables[elem]+"</td></tr>");
            }  
          }else{
            var rows=$("#table_var_tbody>tr");
            
              for (var i=0;i<rows.length;i++){
                if(rows[i].children[1].innerHTML==this.id){
                  rows[i].remove();
                }
              }

            delete variable_choose[this.id];
          }

          $('#table_var_tbody tr input[type=checkbox]').off("change").on("change",function () {
            
            if ($(this).is(":checked")){
              console.log(this.id);
              try {
                variable_choose[this.id.split(".")[1].toString()].push(this.id.split(".")[2].toString())

              } catch (error) {
                variable_choose[this.id.split(".")[1].toString()]=[];
                variable_choose[this.id.split(".")[1].toString()].push(this.id.split(".")[2].toString())
              }
            }else{
              var index = variable_choose[this.id.split(".")[1].toString()].indexOf(this.id.split(".")[2].toString());
              variable_choose[this.id.split(".")[1].toString()].splice(index, 1);
            }
              
            });
          
          });
        }, 0);

      });
     
    });


function arrayToTable(csv) {
  var data = csv;
  var lines = data.split("\n"),
      output = [],
      i;
  for (i = 0; i < lines.length; i++)
      output.push("<tr ><td style='border: 1px solid black;' >"
                  + lines[i].slice(0,-1).split(",").join("</td><td style='border: 1px solid black;' >")
                  + "</td></tr>");
  output = "<table style='border: 1px solid black;'>" + output.join("") + "</table>";
  return output;
}

function downloadpdf(){
  var interval = document.getElementById("time_interval");
  interval = interval.options[interval.selectedIndex].value;

  var function_calc = document.getElementById("function_calc");
  function_calc = function_calc.options[function_calc.selectedIndex].value;

  var start_date = document.getElementById("start_date").value;
  var end_date = document.getElementById("end_date").value;



  var data={start_date:start_date,end_date:end_date,funct:function_calc,"interval":parseInt(interval),"vars":JSON.stringify(variable_choose),"type_down":"pdf"};
  
  $.ajax({
    type: "POST",
    async: false,
    data: data,
    url: "/voltage_metering_reporting",                                                                  

    success: function(result) {

        var base64str = result;
        var binary = atob(base64str.replace(/\s/g, ''));
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }

        var blob = new Blob( [view], { type: "application/pdf" });
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link.download="output_"+moment().format('MMMM Do YYYY, h:mm:ss a');+".pdf";
        link.click();

     } 
      
});   
}

function downloadcsv(){
  var interval = document.getElementById("time_interval");
  interval = interval.options[interval.selectedIndex].value;

  var function_calc = document.getElementById("function_calc");
  function_calc = function_calc.options[function_calc.selectedIndex].value;

  var start_date = document.getElementById("start_date").value;
  var end_date = document.getElementById("end_date").value;



  var data={start_date:start_date,end_date:end_date,funct:function_calc,"interval":parseInt(interval),"vars":JSON.stringify(variable_choose),"type_down":"csv"};

  getdownloaddata(data,false);
}

function showtable(){
  var interval = document.getElementById("time_interval");
  interval = interval.options[interval.selectedIndex].value;

  var function_calc = document.getElementById("function_calc");
  function_calc = function_calc.options[function_calc.selectedIndex].value;

  var start_date = document.getElementById("start_date").value;
  var end_date = document.getElementById("end_date").value;

  var data={start_date:start_date,end_date:end_date,funct:function_calc,"interval":parseInt(interval),"vars":JSON.stringify(variable_choose),"type_down":"csv"};

  getdownloaddata(data,true);
}



function getdownloaddata(data,table){
           
         $.ajax({
          type: "POST",
          url: "/voltage_metering_reporting",
          async:false,
          data:data,
          success: function(result) {
            if(table){
              var x=window.open();
              x.document.open();
              x.document.write(arrayToTable(result));
              x.document.close();
            }else{
              var blob=new Blob([result]);
              var link=document.createElement('a');
              link.href=window.URL.createObjectURL(blob);
              link.download="test.csv";
              link.click();
            }
            

            //redirect the user to the login screen and ending the session
           } 
            
    });
           
    }

