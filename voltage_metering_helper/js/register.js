$(document).ready(function(){
   
$("#user").submit(function(e) {

    e.preventDefault(); // avoid to execute the actual submit of the form.

    var form = $(this);
    
    $.ajax({
           type: "POST",
           url: "/register",
           data: form.serialize(), // serializes the form's elements.
           success: function(data)
           {
              
           }
         });

    
});
  });
  
