//카테고리 바꾸기

const txtGroup = document.querySelector(".txt-group");
const txtTit = document.querySelector(".txt-tit");
const txtBox = document.querySelector(".txt-box");
const category = document.querySelector("#category");

//url
var getAllUrl = "http://35.212.150.195/api/note/get_all";
var refreshUrl = "http://35.212.150.195/api/user/refresh_token";
var verifyUrl = "http://35.212.150.195/api/user/verify_token";
var noteUpdateUrl = "http://35.212.150.195/api/note/update";
var noteDeleteUrl = "http://35.212.150.195/api/note/delete";
var loadListName = localStorage.getItem("category_name");
//단어 데이터 리스트 나오게 하기
//해당 카테고리에 해당하는 단어 나오게 하기 //이건 카테고리가 없음
//카테고리 이름, 영단어, 한국어, 스피킹 추가 등 수정 할 수 있도록 하기
window.addEventListener("load", (e) => {
  $(".loading").css('display', 'flex')
  e.preventDefault();
  category.disabled = true;
  if (
    !sessionStorage.getItem("access_token") &&
    sessionStorage.getItem("refresh_token") !== null
  ) {
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
        if (res.status !== 200) {
          res.json().then((json) => {
            let detail_error = json.detail;
            if (detail_error.code === "ER011") {
              alert("해당 유저는 존재하지 않습니다.");
              $(".loading").hide()
            } else if (detail_error.code === "ER997") {
              alert("재로그인이 필요합니다.");
              localStorage.clear();
              sessionStorage.clear();
              $(".loading").hide()
              location.href = "/login"
            } else if (detail_error.code === "ER998") {
              alert("재로그인이 필요합니다.");
              localStorage.clear();
              sessionStorage.clear();
              $(".loading").hide()
              location.href = "/login"
            } else if (detail_error.code === "ER999") {
              alert("비활성화된 유저입니다. 관리자에게 문의해주세요.");
            }
          });
        } else {
          res.json().then((data) => {
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
                if (res.status !== 200) {
                  res.json().then((json) => {
                    let detail_error = json.detail;
                    if (detail_error.code === "ER011") {
                      alert("해당 유저는 존재하지 않습니다.");
                    } else if (detail_error.code === "ER997") {
                      alert("재로그인이 필요합니다.");
                      localStorage.clear();
                      sessionStorage.clear();
                      $(".loading").hide()
                      location.href = "/login"
                    } else if (detail_error.code === "ER998") {
                      alert("재로그인이 필요합니다.");
                      localStorage.clear();
                      sessionStorage.clear();
                      $(".loading").hide()
                      location.href = "/login"
                    } else if (detail_error.code === "ER999") {
                      alert("비활성화된 유저입니다. 관리자에게 문의해주세요.");
                    }
                  });
                } else {
                  res.json().then((data) => {
                    console.log(data);
                  });
                }
              })
              .catch((error) => alert(error));
          });
        }
      })
      .catch((error) => {
        alert(error);
      });
  } else {
    fetch(getAllUrl, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("access_token"),
      },
      data: JSON.stringify([
        {
          Author: "유저 고유 아이디",
          English: "영어",
          Korean: "한국어",
          Speak: "발음",
          Created_At: "노트가 등록된 시간",
        },
      ]),
    })
      .then((res) => {
        if (res.status !== 200) {
          res.json().then((json) => {
            let detail_error = json.detail;
            if (detail_error.code === "ER013") {
              alert("로그인 후 이용해주시길 바랍니다.");
              localStorage.clear();
              sessionStorage.clear();
              $(".loading").hide()
              location.href = "/login"
            } else if (detail_error.code === "ER014") {
              alert("재로그인이 필요합니다.");
              localStorage.clear();
              sessionStorage.clear();
              $(".loading").hide()
              location.href = "/login"
            } else if (detail_error.code === "ER015") {
              alert("로그인 후 이용해주시길 바랍니다.");
              localStorage.clear();
              sessionStorage.clear();
              $(".loading").hide()
              location.href = "/login"
            } else if (detail_error.code === "ER016") {
              alert("비활성화된 유저입니다. 관리자에게 문의해주세요.");
            } else if (detail_error.code === "ER017") {
              alert("한국어 칸을 채워주세요.");
            } else if (detail_error.code === "ER018") {
              alert("영어 칸을 채워주세요.");
            }
          });
        } else {
          res.json().then((data) => {
            $(".loading").hide()
            console.log(data);
            category.value = localStorage.getItem("category_name");
            const categoryName = data.data.map((x, i) => {
              return data.data[i].Category;
            });
            console.log(categoryName);
            var detailIndices = [];
            var detailIdx = categoryName.indexOf(
              localStorage.getItem("category_name")
            );
            while (detailIdx != -1) {
              detailIndices.push(detailIdx);
              detailIdx = categoryName.indexOf(
                localStorage.getItem("category_name"),
                detailIdx + 1
              );
            }
            console.log(detailIndices);
            const cN = [];
            for (i = 0; i < detailIndices.length; i++) {
              cN.push(data.data[detailIndices[i]]);
            }
            console.log(cN);
            const dataAll = cN
              .map(
                (x, i) =>
                  "<div class='txt-box'><p>" +
                  cN[i].Korean +
                  "</p><p>" +
                  cN[i].English +
                  "</p><p>" +
                  cN[i].Speak +
                  "</p><a href='#'><i class='fa-regular fa-pen-to-square' onclick='editDetail(this)'></i></a></div>"
              )
              .join("");
            txtGroup.innerHTML =
              "<div class='txt-tit'><p>한국어</p><p>영어</p><p>발음</p><div></div></div>" +
              dataAll;
              $(".loading").hide()
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

//수정모드로 들어가는 기능
function editDetail(me) {
  const noteBox = me.parentNode.parentNode;
  //한국어
  const koDetail =
    me.parentNode.previousElementSibling.previousElementSibling
      .previousElementSibling;

  //영어
  const enDetail = me.parentNode.previousElementSibling.previousElementSibling;
  //발음
  const spDetail = me.parentNode.previousElementSibling;
  noteBox.innerHTML =
    "<input type='text' value=" +
    koDetail.textContent +
    "><input type='text' value=" +
    enDetail.textContent +
    "><input type='text' value=" +
    spDetail.textContent +
    "><p class='editsBtn'><i class='fa-solid fa-pen' onclick='detailUpdate(this)'></i><i class='fa-solid fa-trash' onclick='detailDelete(this)'></i></p>";
}

//단어 수정한거 업데이트
function detailUpdate(me) {
  $(".loading").css('display', 'flex')
  var noteBox = me.parentNode;
  var koDetail1 =
    me.parentNode.previousElementSibling.previousElementSibling
      .previousElementSibling;
  var enDetail1 = me.parentNode.previousElementSibling.previousElementSibling;
  var spDetail1 = me.parentNode.previousElementSibling;
  fetch(getAllUrl, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("access_token"),
    },
    data: JSON.stringify([
      {
        Author: "유저 고유 아이디",
        English: "영어",
        Korean: "한국어",
        Speak: "발음",
        Created_At: "노트가 등록된 시간",
      },
    ]),
  })
    .then((res) => {
      if (res.status !== 200) {
        res.json().then((json) => {
          let detail_error = json.detail;
          if (detail_error.code === "ER013") {
            alert("로그인 후 이용해주시길 바랍니다.");
            localStorage.clear();
            sessionStorage.clear();
            $(".loading").hide()
            location.href = "/login"
          } else if (detail_error.code === "ER014") {
            alert("재로그인이 필요합니다.");
            localStorage.clear();
            sessionStorage.clear();
            $(".loading").hide()
            location.href = "/login"
          } else if (detail_error.code === "ER015") {
            alert("로그인 후 이용해주시길 바랍니다.");
            localStorage.clear();
            sessionStorage.clear();
            $(".loading").hide()
            location.href = "/login"
          } else if (detail_error.code === "ER016") {
            alert("비활성화된 유저입니다. 관리자에게 문의해주세요.");
            localStorage.clear();
            sessionStorage.clear();
            $(".loading").hide()
            location.href = "/login"
          } else if (detail_error.code === "ER017") {
            alert("한국어 칸을 채워주세요.");
            localStorage.clear();
            sessionStorage.clear();
            $(".loading").hide()
            location.href = "/login"
          } else if (detail_error.code === "ER018") {
            alert("영어 칸을 채워주세요.");
            localStorage.clear();
            sessionStorage.clear();
            $(".loading").hide()
            location.href = "/login"
          } else if (detail_error.code === "ER019") {
            //날짜값 틀림
            alert("오류가 발생했습니다. 관리자에게 문의해주세요.");
            localStorage.clear();
            sessionStorage.clear();
            $(".loading").hide()
            location.href = "/login"
          } else if (detail_error.code === "ER020") {
            alert("데이터가 존재하지 않습니다.");
            localStorage.clear();
            sessionStorage.clear();
            $(".loading").hide()
            location.href = "/login"
          }
        });
      } else {
        res.json().then((data) => {
          console.log(data);
          const detailEnglishAll = data.data.map((x, i) => {
            return data.data[i].English;
          });
          const matchEnglish = detailEnglishAll.indexOf(enDetail1.value);
          console.log(detailEnglishAll);
          const bodyCreated_At = data.data[matchEnglish].Created_At;
          console.log(bodyCreated_At);

          fetch("http://35.212.150.195/api/note/update", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: sessionStorage.getItem("access_token"),
            },
            body: JSON.stringify({
              Korean: koDetail1.value,
              English: enDetail1.value,
              Speak: spDetail1.value,
              Created_At: bodyCreated_At
                .split("-")
                .join(",")
                .split("T")
                .join(",")
                .split(":")
                .join(",")
                .split(".000Z")
                .join(""),
              Category: localStorage.getItem("category_name"),
            }),
          })
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              alert("수정완료");
              location.reload();
            })
            .catch((error) => {
              console.log(error);
            });
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
//단어 삭제기능
function detailDelete(me) {
  var enDetail1 = me.parentNode.previousElementSibling.previousElementSibling;

  console.log(enDetail1);
  fetch(getAllUrl, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("access_token"),
    },
    data: JSON.stringify([
      {
        Author: "유저 고유 아이디",
        English: "영어",
        Korean: "한국어",
        Speak: "발음",
        Created_At: "노트가 등록된 시간",
      },
    ]),
  })
    .then((res) => {
      if (res.status !== 200) {
        res.json().then((json) => {
          let detail_error = json.detail;
          if (detail_error.code === "ER013") {
            alert("로그인 후 이용해주시길 바랍니다.");
          } else if (detail_error.code === "ER014") {
            alert("재로그인이 필요합니다.");
          } else if (detail_error.code === "ER015") {
            alert("로그인 후 이용해주시길 바랍니다.");
          } else if (detail_error.code === "ER016") {
            alert("비활성화된 유저입니다. 관리자에게 문의해주세요.");
          } else if (detail_error.code === "ER017") {
            alert("한국어 칸을 채워주세요.");
          } else if (detail_error.code === "ER018") {
            alert("영어 칸을 채워주세요.");
          }
        });
      } else {
        res.json().then((data) => {
          console.log(data);
          const detailEnglishAll = data.data.map((x, i) => {
            return data.data[i].English;
          });
          const matchEnglish = detailEnglishAll.indexOf(enDetail1.value);
          const bodyCreated_At = data.data[matchEnglish].Created_At;

          fetch(noteDeleteUrl, {
            method: "delete",
            headers: {
              "Content-Type": "application/json",
              Authorization: sessionStorage.getItem("access_token"),
            },
            body: JSON.stringify({
              Created_At: bodyCreated_At
                .split("-")
                .join(",")
                .split("T")
                .join(",")
                .split(":")
                .join(",")
                .split(".000Z")
                .join(""),
            }),
          })
            .then((res) => {
              if (res.status !== 200) {
                res.json().then((json) => {
                  let detail_error = json.detail;
                  if (detail_error.code === "ER013") {
                    alert("로그인 후 이용해주시길 바랍니다.");
                  } else if (detail_error.code === "ER014") {
                    alert("재로그인이 필요합니다.");
                  } else if (detail_error.code === "ER015") {
                    alert("로그인 후 이용해주시길 바랍니다.");
                  } else if (detail_error.code === "ER016") {
                    alert("비활성화된 유저입니다. 관리자에게 문의해주세요.");
                  }
                });
              } else {
                res.json().then((data) => {
                  console.log(data);
                  alert("삭제가 완료되었습니다.");
                  location.reload();
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

