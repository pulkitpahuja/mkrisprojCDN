function getDifferenceDays(date1,date2){
  var a = moment(date1,'DD/MM/YYYY');
  var b = moment(date2,'DD/MM/YYYY');
  var diffDays = b.diff(a, 'days');
  return diffDays
}

var selected_db =new URL(window.location.href).searchParams.get('id');

var app = angular.module('voltage_app', []);


Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

app.controller('image_controller', function($scope, $http) {

  $http.post("/get_image")
  .then(function(response) {
    $scope.image=response.data;
  });
});



var global_data;

app.controller('total_devices', function($scope, $http,$interval) {
  $http.put("/dashboard",{type:"want"})
    .then(function(response) {
    $scope.email=response.data;
    if($scope.email.length==0){
      $("#alerts_div").append(" <div class='alert alert-danger alert-dismissible fade show mt-4 text-center' role='alert'>\
            <h4 class='alert-heading'>Email for this account is not set up.</h4>\
          </div>");
          document.getElementById("confirm_btn").onclick = function() {
            if(validateEmail($('#email_edit_field').val())){
              $http.put("/dashboard",{type:"new",email:$('#email_edit_field').val()})
              .then(function(response) {
                if(response.data=="1"){
                  $("#confirm_btn").removeClass("btn-primary");
                  $("#confirm_btn").addClass("btn-success");
                  document.getElementById("confirm_btn").value="Confirmed";
                  setTimeout(function(){ 
                    $("#confirm_btn").removeClass("btn-success");
                  $("#confirm_btn").addClass("btn-primary");
                  document.getElementById("confirm_btn").value="Confirm"; 
                }, 2000);
  
                }else{
                  $("#confirm_btn").removeClass("btn-primary");
                  $("#confirm_btn").addClass("btn-warning");
                  document.getElementById("confirm_btn").value="Error";
                  setTimeout(function(){ 
                    $("#confirm_btn").removeClass("btn-warning");
                  $("#confirm_btn").addClass("btn-primary");
                  document.getElementById("confirm_btn").value="Confirm"; 
                });
              }
              
              });    
            }else{
              $("#err_txt").css({"display":"block"});
              document.getElementById("email_edit_field").addEventListener("input", function(){
                $("#err_txt").css({"display":"none"});
              });
            }
          };
          
    }else{
      $(".email_edit").append("<a href='#' style='color:white' id='edit_btn' class='btn btn-warning mt-3'>Edit  </a>")
      document.getElementById('email_edit_field').readOnly = true;

      $(function() {
        document.getElementById("edit_btn").onclick = function() {
          document.getElementById('email_edit_field').readOnly = false;
          $("#edit_btn").css({"opacity":"0","cursor":"context-menu"});
        };
      });
      $(function() {
        document.getElementById("confirm_btn").onclick = function() {
          if(validateEmail($('#email_edit_field').val())){
            document.getElementById('email_edit_field').readOnly = true;
            $("#edit_btn").css({"opacity":"32","cursor":"pointer"});
            console.log("HEH");
            $http.put("/dashboard",{type:"new",email:$('#email_edit_field').val()})
            .then(function(response) {
              if(response.data=="1"){
                $("#confirm_btn").removeClass("btn-primary");
                  $("#confirm_btn").addClass("btn-success");
                  document.getElementById("confirm_btn").value="Update Confirmed";
                  setTimeout(function(){ 
                    $("#confirm_btn").removeClass("btn-success");
                  $("#confirm_btn").addClass("btn-primary");
                  document.getElementById("confirm_btn").value="Confirm"; 
              }, 2000);

              }
            });
          }else{
            $("#err_txt").css({"display":"block"});
            document.getElementById("email_edit_field").addEventListener("input", function(){
              $("#err_txt").css({"display":"none"});
            });
          }
        };
      });

    }
  });

});


function validateEmail(email) {

  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

app.controller('active_devices', function($scope, $http,$interval) {
  $interval(function () {
    $http.post("/voltage_metering_vars",{type: "active"})
    .then(function(response) {
        $scope.actives=response.data;
    });
},1000);



});

app.controller('inactive_devices', function($scope, $http,$interval) {
  $interval(function () {
    $http.post("/voltage_metering_vars",{type: "inactive"})
    .then(function(response) {
        $scope.inactives=response.data;
    });
  },1000);

  
});

function onchange123(){
if(document.getElementById("site_search_text").value){
  document.getElementById("load_btn").disabled=false;
}  else{
  document.getElementById("load_btn").disabled=true;

}

}

function search_button_click(){
  document.getElementById("confirm_edit_btn").value="Confirm";

  var val=document.getElementById("site_search_text").value;
  document.getElementById("confirm_edit_btn").disabled=false;
  document.getElementById("edit_devices_btn").disabled=false;

  if(val){
    $.ajax({
      type: "PUT",
      url: "/voltage_metering_data",
      data:{reporting_flag: "0",site_id: val},
      success: function(result) {

        document.getElementById("username").textContent=result[0]["Username"];
        document.getElementById("location").textContent=result[0]["location"];
        document.getElementById("site_name").textContent=result[0]["site_name"];
        document.getElementById("latitude").textContent=result[0]["lat"];
        document.getElementById("longitude").textContent=result[0]["longitude"];

       } 
        
  });
  }else{

  }
  
}

function edit_devices_edit(){
  
  if(  document.getElementById("edit_devices_btn").value=="Cancel"){
   
    document.getElementById("edit_devices_btn").value="Edit";
    search_button_click();
  }else{
    document.getElementById("confirm_edit_btn").value="Confirm";
    document.getElementById("username").innerHTML="<input type='text' value='"+document.getElementById("username").textContent+"' id='username_edit'>";
    document.getElementById("location").innerHTML="<input type='text' value='"+document.getElementById("location").textContent+"' id='location_edit'>";
    document.getElementById("site_name").innerHTML="<input type='text' value='"+document.getElementById("site_name").textContent+"' id='site_name_edit'>";
    document.getElementById("latitude").innerHTML="<input type='text' value='"+document.getElementById("latitude").textContent+"' id='latitude_edit'>";
    document.getElementById("longitude").innerHTML="<input type='text' value='"+document.getElementById("longitude").textContent+"' id='longitude_edit'>";
    document.getElementById("edit_devices_btn").value="Cancel";
  }
 

}


function confirm_changes(){
  var data={username: document.getElementById("username_edit").value,
            location: document.getElementById("location_edit").value,
            site_name: document.getElementById("site_name_edit").value,
            latitude: document.getElementById("latitude_edit").value,
            longitude: document.getElementById("longitude_edit").value,
            site_id : document.getElementById("site_search_text").value};

            
  $.ajax({
    type: "PUT",
    url: "/get_image",
    data:data,
    success: function(result) {
     if(result=="1"){
      document.getElementById("edit_devices_btn").value="Edit";

      document.getElementById("username").innerHTML="";
      document.getElementById("location").innerHTML="";
      document.getElementById("site_name").innerHTML="";
      document.getElementById("latitude").innerHTML="";
      document.getElementById("longitude").innerHTML="";

      document.getElementById("username").textContent=data["username"];
      document.getElementById("location").textContent=data["location"];
      document.getElementById("site_name").textContent=data["site_name"];
      document.getElementById("latitude").textContent=data["latitude"];
      document.getElementById("longitude").textContent=data["longitude"];
     } else{
       $("#confirm_edit_btn").removeClass("btn-success");
       $("#confirm_edit_btn").addClass("btn-danger");

      document.getElementById("confirm_edit_btn").value="Error";

     }     //redirect the user to the login screen and ending the session
     } 
      
});
}


  function logout(){
    //logout function to logout the user and redirect the user to the login screen
     
               $.ajax({
                    type: "GET",
                    url: "/voltage_metering_logout",
                    cache: false,
                    success: function(result) {
                      window.location=result;       //redirect the user to the login screen and ending the session
                     } 
                      
              });
             
      }

function getvars(){
        $.ajax({
          type: "POST",
          url: "/voltage_metering_vars",
          data:{type: "others"},
          cache: false,
          success: function(result) {
            var temp=[];
            for(var i=0;i<result.length;i++){
              temp.push(result[i]["site_id"]);
            }
            console.log(result);
            autocomplete(document.getElementById("site_search_text"), temp);
           } 
            
    });
      }
      getvars();
      function autocomplete(inp, arr) {
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function(e) {
            var a, b, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) { return false;}
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
              /*check if the item starts with the same letters as the text field value:*/
              if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener("click", function(e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
              }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function(e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
              /*If the arrow DOWN key is pressed,
              increase the currentFocus variable:*/
              currentFocus++;
              /*and and make the current item more visible:*/
              addActive(x);
            } else if (e.keyCode == 38) { //up
              /*If the arrow UP key is pressed,
              decrease the currentFocus variable:*/
              currentFocus--;
              /*and and make the current item more visible:*/
              addActive(x);
            } else if (e.keyCode == 13) {
              /*If the ENTER key is pressed, prevent the form from being submitted,*/
              e.preventDefault();
              if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
              }
            }
        });
        function addActive(x) {
          /*a function to classify an item as "active":*/
          if (!x) return false;
          /*start by removing the "active" class on all items:*/
          removeActive(x);
          if (currentFocus >= x.length) currentFocus = 0;
          if (currentFocus < 0) currentFocus = (x.length - 1);
          /*add class "autocomplete-active":*/
          x[currentFocus].classList.add("autocomplete-active");
        }
        function removeActive(x) {
          /*a function to remove the "active" class from all autocomplete items:*/
          for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
          }
        }
        function closeAllLists(elmnt) {
          /*close all autocomplete lists in the document,
          except the one passed as an argument:*/
          var x = document.getElementsByClassName("autocomplete-items");
          for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
            x[i].parentNode.removeChild(x[i]);
          }
        }
      }
      /*execute a function when someone clicks in the document:*/
      document.addEventListener("click", function (e) {
          closeAllLists(e.target);
      });
      }



    
