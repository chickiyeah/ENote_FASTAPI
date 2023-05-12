var refreshUrl = "http://35.212.150.195/api/user/refresh_token";
var verifyUrl = "http://35.212.150.195/api/user/verify_token";

window.addEventListener('load',()=>{
  $(".loading").css('display', 'flex')
  if (!sessionStorage.getItem("access_token")) {
    //refresh_token api
    fetch(refreshUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: sessionStorage.getItem("refresh_token"),
      }),
    })
      .then((res) => {
        if(res.status !== 200){
          res.json().then(json=>{
            let detail_error = json.detail
            if(detail_error.code === "ER011"){
              alert("해당 유저는 존재하지 않습니다.")
            }else if(detail_error.code === "ER997"){
              alert("재로그인이 필요합니다.")
            }else if(detail_error.code === "ER998"){
              alert("재로그인이 필요합니다.")
            }else if(detail_error.code === "ER999"){
              alert("비활성화된 유저입니다. 관리자에게 문의해주세요.")
            }
          })
        }else{
          res.json().then((data)=>{
            sessionStorage.setItem("access_token", data.access_token);
            sessionStorage.setItem("user_id", data.id);
            sessionStorage.setItem("refresh_token", data.refresh_token);
            //verify token api
            fetch(verifyUrl, {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                access_token: sessionStorage.getItem("access_token"),
              }),
            })
              .then((res) => {
                if(res.status !== 200){
                  res.json().then(json=>{
                    let detail_error = json.detail;
                    if(detail_error.code === "ER011"){
                      alert("해당 유저는 존재하지 않습니다.")
                    }else if(detail_error.code === "ER997"){
                      alert("재로그인이 필요합니다.")
                    }else if(detail_error.code === "ER998"){
                      alert("재로그인이 필요합니다.")
                    }else if(detail_error.code === "ER999"){
                      alert("비활성화된 유저입니다. 관리자에게 문의해주세요.")
                    }
                  })
                }else{
                  res.json().then(data=>{
                    location.reload();
                  })
                }
              })
              .catch((error) => alert(error));
          })
        }
      })
      .catch((error) => {
        alert(error);
      });
  } else {
    (function () {
      calendarMaker($("#calendarForm"), new Date());
    })();
    $(".loading").hide()
  }
})


var nowDate = new Date();
function calendarMaker(target, date) {
  if (date == null || date == undefined) {
    date = new Date();
  }
  nowDate = date;
  if ($(target).length > 0) {
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    $(target).empty().append(assembly(year, month));
  } else {
    console.error("custom_calendar Target is empty!!!");
    return;
  }

  var thisMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
  var thisLastDay = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0);

  var tag = "<tr>";
  var cnt = 0;
  //빈 공백 만들어주기
  for (i = 0; i < thisMonth.getDay(); i++) {
    tag += "<td><span><span></td>";
    cnt++;
  }

  //날짜 채우기
  for (i = 1; i <= thisLastDay.getDate(); i++) {
    if (cnt % 7 == 0) {
      tag += "<tr>";
    }

    tag += "<td>" + i + "<span class='date'></span></td>";
    cnt++;
    if (cnt % 7 == 0) {
      tag += "</tr>";
    }
  }
  $(target).find("#custom_set_date").append(tag);
  calMoveEvtFn();

  function assembly(year, month) {
    var calendar_html_code =
      "<table class='custom_calendar_table'>" +
      "<colgroup>" +
      "<col style='width:81px'/>" +
      "<col style='width:81px'/>" +
      "<col style='width:81px'/>" +
      "<col style='width:81px'/>" +
      "<col style='width:81px'/>" +
      "<col style='width:81px'/>" +
      "<col style='width:81px'/>" +
      "</colgroup>" +
      "<thead class='cal_date'>" +
      "<th><button type='button' class='prev'><</button></th>" +
      "<th colspan='5'><p><span id=yearContent>" +
      year +
      "</span>년 <span id='monContent'>" +
      month +
      "</span>월</p></th>" +
      "<th><button type='button' class='next'>></button></th>" +
      "</thead>" +
      "<thead  class='cal_week'>" +
      "<th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th>" +
      "</thead>" +
      "<tbody id='custom_set_date'>" +
      "</tbody>" +
      "</table>";
    return calendar_html_code;
  }

  function calMoveEvtFn() {
    //전달 클릭
    $(".custom_calendar_table").on("click", ".prev", function () {
      nowDate = new Date(
        nowDate.getFullYear(),
        nowDate.getMonth() - 1,
        nowDate.getDate()
      );
      calendarMaker($(target), nowDate);
    });
    //다음날 클릭
    $(".custom_calendar_table").on("click", ".next", function () {
      nowDate = new Date(
        nowDate.getFullYear(),
        nowDate.getMonth() + 1,
        nowDate.getDate()
      );
      calendarMaker($(target), nowDate);
    });
    //일자 선택 클릭
    $(".custom_calendar_table").on("click", "td", function () {
      $(".loading").css('display', 'flex')
      $(".custom_calendar_table .select_day").removeClass("select_day");
      $(this).removeClass("select_day").addClass("select_day");
      $(".custom_calendar_table td:not([select_day]) .date").hide()
      $(".custom_calendar_table .select_day .date").show()

      const dateCategoryYear = $("#yearContent").text();
      const dateCategoryMonth = $("#monContent").text().padStart(2, "0");
      const dateCategoryDay = this.textContent.padStart(2, "0");
      const yearMonthDay = String(
        dateCategoryYear + dateCategoryMonth + dateCategoryDay
      );
      fetch("http://35.212.150.195/api/note/get_all", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionStorage.getItem("access_token"),
        },
      })
        .then((res) => {
          if(res.status !== 200){
            res.json().then(json=>{
              let detail_error = json.detail;
              if(detail_error.code === "ER013"){
                alert("로그인 후 이용해주시길 바랍니다.")
              }else if(detail_error.code ==="ER014"){
                alert("재로그인이 필요합니다.")
              }else if(detail_error.code ==="ER015"){
                alert("로그인 후 이용해주시길 바랍니다.")
              }else if(detail_error.code ==="ER016"){
                alert("비활성화된 유저입니다. 관리자에게 문의해주세요.")
              }else if(detail_error.code ==="ER017"){
                alert("한국어 칸을 채워주세요.")
              }else if(detail_error.code ==="ER018"){
                alert("영어 칸을 채워주세요.")
              }
            })
          }else{
            res.json().then(data=>{
              console.log(data);
              const dateCalendar = data.data.map((x, i) => {
                return data.data[i].Created_At.split("-").join("").slice(0, 8);
              });
              var madeLength = dateCalendar.filter((x) => x === yearMonthDay);
              console.log(madeLength.length);
              
              
              if (madeLength.length <= 0) {
                $(".loading").hide()
              } else {
                $(this).children().html(madeLength.length);
                $(".loading").hide()
              }
            })
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
}
// (function () {
//   calendarMaker($("#calendarForm"), new Date());
// })();

// var nowDate = new Date();
// function calendarMaker(target, date) {
//   if (date == null || date == undefined) {
//     date = new Date();
//   }
//   nowDate = date;
//   if ($(target).length > 0) {
//     var year = nowDate.getFullYear();
//     var month = nowDate.getMonth() + 1;
//     $(target).empty().append(assembly(year, month));
//   } else {
//     console.error("custom_calendar Target is empty!!!");
//     return;
//   }

//   var thisMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);
//   var thisLastDay = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0);

//   var tag = "<tr>";
//   var cnt = 0;
//   //빈 공백 만들어주기
//   for (i = 0; i < thisMonth.getDay(); i++) {
//     tag += "<td></td>";
//     cnt++;
//   }

//   //날짜 채우기
//   for (i = 1; i <= thisLastDay.getDate(); i++) {
//     if (cnt % 7 == 0) {
//       tag += "<tr>";
//     }

//     tag += "<td>" + i + "</td>";
//     cnt++;
//     if (cnt % 7 == 0) {
//       tag += "</tr>";
//     }
//   }
//   $(target).find("#custom_set_date").append(tag);
//   calMoveEvtFn();

//   function assembly(year, month) {
//     var calendar_html_code =
//       "<table class='custom_calendar_table'>" +
//       "<colgroup>" +
//       "<col style='width:81px'/>" +
//       "<col style='width:81px'/>" +
//       "<col style='width:81px'/>" +
//       "<col style='width:81px'/>" +
//       "<col style='width:81px'/>" +
//       "<col style='width:81px'/>" +
//       "<col style='width:81px'/>" +
//       "</colgroup>" +
//       "<thead class='cal_date'>" +
//       "<th><button type='button' class='prev'><</button></th>" +
//       "<th colspan='5'><p><span>" +
//       year +
//       "</span>년 <span>" +
//       month +
//       "</span>월</p></th>" +
//       "<th><button type='button' class='next'>></button></th>" +
//       "</thead>" +
//       "<thead  class='cal_week'>" +
//       "<th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th>" +
//       "</thead>" +
//       "<tbody id='custom_set_date'>" +
//       "</tbody>" +
//       "</table>";
//     return calendar_html_code;
//   }

//   function calMoveEvtFn() {
//     //전달 클릭
//     $(".custom_calendar_table").on("click", ".prev", function () {
//       nowDate = new Date(
//         nowDate.getFullYear(),
//         nowDate.getMonth() - 1,
//         nowDate.getDate()
//       );
//       calendarMaker($(target), nowDate);
//     });
//     //다음날 클릭
//     $(".custom_calendar_table").on("click", ".next", function () {
//       nowDate = new Date(
//         nowDate.getFullYear(),
//         nowDate.getMonth() + 1,
//         nowDate.getDate()
//       );
//       calendarMaker($(target), nowDate);
//     });
//     //일자 선택 클릭
//     $(".custom_calendar_table").on("click", "td", function () {
//       $(".custom_calendar_table .select_day").removeClass("select_day");
//       $(this).removeClass("select_day").addClass("select_day");
//     });
//   }
// }
