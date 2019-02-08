$(function() {
  $('.question-like-btn').click(function(e) {
    var $el = $(e.currentTarget);
    if ($el.hasClass('loading')) return;
    $el.addClass('loading');
    $.ajax({
      url: '',
      method: 'POST',
      dataType: 'json',
      success: function(data) {
        $('.question .num-likes').text(data.numLikes);
        // data.numLikdes를 텍스트 형태로 .question .num-likes 에 보내라
      },
      error: function(data, status) {
        if (data.status == 401) {
          alert('Login required!');
          location = '/signin';
        }
        console.log(data, status);
      },
      complete: function(data) {
        $el.removeClass('loading');
        //ajax에서 onClick = class 바꾸는 기능 구현!
        // 여기에 색깔 지우는거 넣고
      }
    });
  });
}); 


// app.js : currentUser 가져와서 이거 스키마의 productLike에 추가!

// 1) product 배열 에 cosmetics id 가 있냐?
  // 있으면 걍 넘어가구 없으면 추가
// 2) dislike 의 경우 : 있으면 delete