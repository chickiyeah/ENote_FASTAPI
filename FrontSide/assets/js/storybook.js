import { clickEnter } from "./enterEvent.js";

const newCategory = document.querySelector("#newCategory");
const newCategoryAdd = document.querySelector("#newCategoryAdd");
const storyBookBox = document.querySelector(".storybook-box");
const storyHide = document.querySelector(".story-hide");
const menu = document.querySelector(".menu");
// const edit = document.querySelector(".edit");
// const remove = document.querySelectorAll(".remove");
// const storyHideList = document.querySelectorAll(".story-hide > li");
// const bgTItle = document.querySelectorAll(".bgTItle");
// const titleInput = document.querySelectorAll(".titleInput");

//url
var getAllUrl = "http://35.212.150.195/api/note/get_all";
var noteUpdateUrl = "http://35.212.150.195/api/note/update";
var deleteUrl = "http://35.212.150.195/api/note/delete";
var addNoteUrl = "http://35.212.150.195/api/note/add";
clickEnter(newCategory, newCategoryAdd);

window.addEventListener("load", (e) => {
  e.preventDefault();
  var refreshUrl = "http://35.212.150.195/api/user/refresh_token";
  var verifyUrl = "http://35.212.150.195/api/user/verify_token";
  if (!sessionStorage.getItem("access_token") && sessionStorage.getItem("refresh_token") !== null) {
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
    //카테고리 리스트 나오도록 하기
    fetch(getAllUrl, {
      method: "GET",
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
            var allCategory = data.data.map((x, i) => data.data[i].Category);
            var categoryList = [...new Set(allCategory)];
            var allCategoryList = categoryList
              .map((x, i) => {
                return (
                  '<div class="storybook-box"><div class="bg" style="margin-bottom:26px;"><p class="title"><a href="/storybook/detail" onclick="sendTitle(this)">' +
                  categoryList[i] +
                  '</a></p><input type="text" class="titleInput" style="display:none;" /><button class="inputeditBtn" style="display:none;">수정하기</button><a href="#" class="menu"><i class="fa-solid fa-ellipsis-vertical" style="color: #000000"></i><ul class="story-hide"><li onclick="add()">추가</li><li class="edit" onclick="changeInput(this)">수정</li><li class="remove" onclick="removeCategory(this)">삭제</li></ul></a></div></div>'
                );
              })
              .join("");
            storyBookBox.innerHtml += allCategoryList;
            //추가기능
            newCategoryAdd.addEventListener("click", (e) => {
              e.preventDefault();
              addNewCate(newCategory, categoryList);
            });
          })
        }
      })
      .then((data) => {

      })
      .catch((error) => console.log(error));
  }
});


//수정기능
function changeInput(a,e) {
  e.preventDefault()
  //수정 버튼 누르면 input이 보이고 제목은 안보인다.
  //input에 원하는 내용 입력하고(공백안됌) 등록 누르면 수정이 된다.
  console.log(a);
  //수정 input
  var targetInput =
    a.parentNode.parentNode.previousElementSibling.previousElementSibling;
  //카테고리 제목
  var targetTitle =
    a.parentNode.parentNode.previousElementSibling.previousElementSibling
      .previousElementSibling;
  //수정하기 버튼
  var editBtn = a.parentNode.parentNode.previousElementSibling;
  //i메뉴
  var itagMenu = a.parentNode.parentNode;
  //누르면 발생하는 일
  targetInput.style.display = "block";
  editBtn.style.display = "block";
  targetInput.value = targetTitle.textContent;
  targetInput.focus();
  targetTitle.style.opacity = "0";
  itagMenu.style.display = "none";

  const originTitle = targetTitle.textContent;

  //수정완료기능 버튼 누르면
  editBtn.addEventListener("click", () => {
    console.log(targetInput.value);
    if (targetInput.value.length <= 0) {
      alert("빈칸을 채워주세요");
      targetInput.focus();
    } else {
      alert("수정 완료");
      targetInput.style.display = "none";
      editBtn.style.display = "none";
      targetTitle.style.opacity = "1";
      itagMenu.style.display = "block";
      //수정된 제목 api에 보내야함
      //데이터 다 불러오고 그 중 해당 카테고리인 단어들 거르기
      //거른 단어들 수정하기
      fetch(getAllUrl, {
        method: "GET",
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
            Created_At: "시간",
          },
        ]),
      })
        .then((res) => {
          if(res.status !== 200){
            res.json().then(json=>{
              let detail_error = json.detail;
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
                  const filtering = data.data.map((x, i) => {
                    return data.data[i].Category;
                  });
                  //원래 카테고리 순서
                  var indices = [];
                  var idx = filtering.indexOf(originTitle);
                  while (idx != -1) {
                    indices.push(idx);
                    idx = filtering.indexOf(originTitle, idx + 1);
                  }
                  //단어 category 내용 다 바꾸기
                  var b = [];
                  for (i = 0; i < indices.length; i++) {
                    b.push(data.data[indices[i]]);
                  }
                  b.map((x, i) => {
                    return fetch(noteUpdateUrl, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: sessionStorage.getItem("access_token"),
                      },
                      body: JSON.stringify({
                        Korean: "Korean",
                        English: "English",
                        Speak: "Speak",
                        Created_At: (b[i].Created_At = b[i].Created_At.split("-")
                          .join(",")
                          .split("T")
                          .join(",")
                          .split(":")
                          .join(",")
                          .split(".000Z")
                          .join("")),
                        Category: targetInput.value,
                      }),
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
                            }else if(detail_error.code ==="ER019"){
                              //날짜값 틀림
                              alert("오류가 발생했습니다. 관리자에게 문의해주세요.")
                            }else if(detail_error.code ==="ER020"){
                              alert("데이터가 존재하지 않습니다.")
                            }
                          })
                        }else{
                          res.json().then(data=>{
                          })
                        }
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  });
                })
              }
            })
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    targetTitle.textContent = targetInput.value;
  });
}

//삭제기능
function removeCategory(a) {
  var targetRemove =
    a.parentNode.parentNode.previousElementSibling.previousElementSibling
      .previousElementSibling.textContent;
  fetch(getAllUrl, {
    method: "GET",
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
        Created_At: "시간",
      },
    ]),
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
          const categoryName = data.data.map((x, i) => {
            return data.data[i].Category;
          });
          console.log(categoryName);
          var removeIndices = [];
          var removeIdx = categoryName.indexOf(targetRemove);
          while (removeIdx != -1) {
            removeIndices.push(removeIdx);
            removeIdx = categoryName.indexOf(targetRemove, removeIdx + 1);
          }
          console.log(removeIndices);
          const c = [];
          for (i = 0; i < removeIndices.length; i++) {
            c.push(data.data[removeIndices[i]]);
          }
          const checkremove = confirm(
            targetRemove + " 카테고리를 삭제하시겠습니다?"
          );
          if (checkremove) {
            c.map((X, i) => {
              return fetch(deleteUrl, {
                method: "delete",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: sessionStorage.getItem("access_token"),
                },
                body: JSON.stringify({
                  Created_At: (c[i].Created_At = c[i].Created_At.split("-")
                    .join(",")
                    .split("T")
                    .join(",")
                    .split(":")
                    .join(",")
                    .split(".000Z")
                    .join("")),
                }),
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
                      }
                    })
                  }else{
                    res.json().then(data=>{
                      console.log(data);
                    })
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
            });
            location.reload();
          } else {
          }
        })
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

//추가기능 해야할거
function addNewCate(newCategory, categoryList) {
  if (newCategory.value.length <= 0) {
    alert("빈칸을 채워주세요.");
    newCategory.focus();
  } else {
    alert("성공적으로 추가되었습니다.");
    categoryList.push(newCategory.value);
    storyBookBox.innerHTML = categoryList
      .map((x, i) => {
        return (
          '<div class="bg" style="margin-bottom:26px;"><p class="title"><a href="/storybook/detail" onclick="sendTitle(this)">' +
          categoryList[i] +
          '</a></p><input type="text" class="titleInput" style="display:none;" /><button class="inputeditBtn" style="display:none;">수정하기</button><a href="#" class="menu"><i class="fa-solid fa-ellipsis-vertical" style="color: #000000"></i><ul class="story-hide"><li onclick="add()">추가</li><li class="edit" onclick="changeInput(this)">수정</li><li class="remove" onclick="removeCategory(this)">삭제</li></ul></a></div>'
        );
      })
      .join("");
    fetch(addNoteUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: sessionStorage.getItem("access_token"),
      },
      body: JSON.stringify({
        Korean: "환영합니다.",
        English: "welcome",
        Speak: "",
        Category: newCategory.value,
      }),
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
          })
        }
      })
      .catch((error) => {
        alert(error);
      });
    newCategory.value = "";
  }
}

function sendTitle(categoryName) {
  localStorage.setItem("category_name", categoryName.textContent);
}
