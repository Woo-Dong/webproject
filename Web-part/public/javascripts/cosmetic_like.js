$(function() {
    $('.product-like-btn').click(function(e) {
      var $el = $(e.currentTarget);
      console.log($el);
      $.ajax({

        url: '/cosmetics/' + $el.data('id') + '/like',
        method: 'POST',
        dataType: 'json',
        success: function(data) {
          $('.product-like-btn').hide();
          $el.addClass('adding');
          console.log("success");
          alert('즐겨찾기에 추가되었습니다', 'success');
        },
        error: function(data, status) {
          if (data.status == 401) {
            alert('Login required!', 'warning');
            location = '/signin';
            console.log("fail");
          }
          console.log(data, status);
        }
      })
    })
});
var bool = true;
if(user.productLike){
  if(user.productLike.constructor == Array){
    for(var prd in user.productLike){
      if (cosmetic.name == prd){
        bool = false;
      }
    }
  }
}