$(function() {
  $('.product-like-btn').click(function(e) {
    var $el = $(e.currentTarget);
    

    $.ajax({

      url: '/cosmetics/' + $el.data('id') + '/like',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        console.log("success");
        $el.toggleClass('active');
        if($el.hasClass('active')){
          alert('즐겨찾기에 추가되었습니다!', 'success');
        }
        else{
          alert('즐겨찾기에서 제거되었습니다!', 'success');
        }
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
