import { clickEnter } from "./enterEvent.js";

const nickname = document.querySelector("#nickname");
const Id = document.querySelector("#Id");
const Pw = document.querySelector("#Pw");
const EditBtn = document.querySelector("#EditBtn");

var refreshUrl = "http://35.212.150.195/api/user/refresh_token";
var verifyUrl = "http://35.212.150.195/api/user/verify_token";
clickEnter(Pw, EditBtn);
// function forRegister() {
//   var reg_email =
//     /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
//   if (
//     nickname.value.length <= 0 ||
//     Id.value.length <= 0 ||
//     Pw.value.length <= 0
//   ) {
//     console.log("제대로 작성해주세요");
//     //공백이 아니라면 이메일 형식 확인하기
//   } else {
//     if (!reg_email.test(Id.value)) {
//       console.log("이메일 형식을 지켜주세요.");
//       Id.focus();
//     } else {
//       //비밀번호는 6자리 이상만 입력 가능한 기능
//       if (Pw.value.length <= 6) {
//         console.log("비밀번호 설정은 6자리 이상으로 해주세요.");
//         Pw.focus();
//       } else {
//         //로그인api로 맞는지 확인하고 맞으면 비밀번호 초기화 api? 닉네임이랑 이메일 업데이트 어떻게 하지 찾아보기
//       }
//     }
//   }
// }

window.addEventListener("load", () => {
  nickname.value = sessionStorage.getItem("user_nickname");
  Id.value = sessionStorage.getItem("user_email");
  Id.value = sessionStorage.getItem("user_email");
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
                if (res.status === 400) {
                  throw new Error("재로그인이 필요합니다.");
                } else if (res.status === 422 || res.status === 500) {
                  throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
                } else {
                  return res.json();
                }
              })
              .then((data) => {
                location.reload();
              })
              .catch((error) => alert(error));
          })
        }
      })
      .catch((error) => {
        alert(error);
      });
  } else {
    EditBtn.addEventListener("click", () => {
      var reg_email =
        /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
      if (confirm("정말 수정하시겠습니까?")) {
        if (
          nickname.value.length <= 0 ||
          Id.value.length <= 0 ||
          Pw.value.length <= 0
        ) {
          alert("빈칸을 채워주세요.");
          //공백이 아니라면 이메일 형식 확인하기
        } else {
          if (!reg_email.test(Id.value)) {
            alert("이메일 형식을 지켜주세요.");
            Id.focus();
          } else {
            //비밀번호는 6자리 이상만 입력 가능한 기능
            if (Pw.value.length <= 6) {
              alert("비밀번호 설정은 6자리 이상으로 해주세요.");
              Pw.focus();
            } else {
              //로그인api로 맞는지 확인
              fetch("http://35.212.150.195/api/user/update", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: sessionStorage.getItem("access_token"),
                },
                body: JSON.stringify({
                  email: Id.value,
                  nickname: nickname.value,
                  password: Pw.value,
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
                      alert(data);
                  sessionStorage.setItem("user_email", Id.value);
                  sessionStorage.setItem("user_nickname", nickname.value);
                    })
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          }
        }
      } else {
      }
    });
  }
});
