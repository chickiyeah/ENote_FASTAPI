$(function () {
  // 프로필 토글
  $(".profile-hide").hide();
  $(".profile>p").click(function (e) {
    console.log(0);
    e.preventDefault();
    $(this).next().slideToggle("fast");
  });
  // 스토리북 토글
  $(".story-hide").hide();
  $(".menu>i")
    .off("click")
    .on("click", function (e) {
      //off 메서드를 혼합하여 사용함으로써 해당 이벤트 중복 오류를 막을 수 있었습니다.
      e.preventDefault();
      console.log(0);
      $(this).next().slideToggle("fast");
    });
});