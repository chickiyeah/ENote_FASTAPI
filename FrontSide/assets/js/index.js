// gnb 아코디언
// let val = $(".burger-gnb .gnb");
// val.hide();
// $(".burger").click(function (e) {
//   e.preventDefault();
//   console.log(val);
//   if (val.next("li").is(":visible")) {
//     val.next().stop().slideUp(250);
//     val.removeClass("active");
//   } else {
//     val.siblings(".gnb .gnbNav").stop().slideUp();
//     val.siblings(".gnb").removeClass("active");
//     val.next().stop().slideDown(250);
//     val.addClass("active");
//   }
// });

//햄버거메뉴
$(document).ready(function () {
  let val = $(".burger-gnb .gnb");
  val.hide();
  const button = () => {
    const burger = document.querySelector(".burger"); // burger class 가져오기
    burger.addEventListener("click", () => {
      console.log(val.next("ul"));
      burger.classList.toggle("toggle"); //toggle class가 있으면 제거, 없으면 추가
      val.slideToggle(300);
    });
  };
  button();
});

$(function () {
  $(".remove").click(function (e) {
    console.log(0);
    e.preventDefault();
    $(".tittxt").val("");
  });
});

// 스토리북 수정
function update() {}

//추가 팝업
function add() {
  console.log(1);
  var con1 = document.getElementById("addpop");
  if ((con1.style.display = "none")) {
    con1.style.display = "block";
  } else {
    con1.style.display = "block";
  }
}

//팝업 닫기
function out() {
  console.log(2);
  var con2 = document.getElementById("addpop");
  if ((con2.style.display = "block")) {
    con2.style.display = "none";
  } else {
    con2.style.display = "none";
  }
}
