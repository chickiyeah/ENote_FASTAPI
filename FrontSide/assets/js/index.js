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
