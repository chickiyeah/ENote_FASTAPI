import { clickEnter } from "./enterEvent.js";

var loginUrl = "http://35.212.150.195/api/user/login";

const Id = document.querySelector("#Id");
const Pw = document.querySelector("#Pw");
const logBtn = document.querySelector("#logInBtn");
const inf = document.querySelector("#inf");

function resetData(text) {
  inf.textContent = text;
  Id.value = "";
  Pw.value = "";
}
//엔터누르면 로그인시도하기
clickEnter(Pw, logBtn);
logBtn.addEventListener("click", () => {
  var reg_email =
    /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
  //공백과 형식이 안 맞는다면
  if (Id.value.length <= 0 || !reg_email.test(Id.value)) {
    Id.focus();
    resetData("이메일 제대로 입력해주세요.");
    alert("이메일 제대로 입력해주세요.")
    // 비밀번호가 6자리 이하라면
  } else if (Pw.value.length <= 6) {
    Pw.focus();
    resetData("비밀번호를 제대로 입력해주세요.");
    alert("비밀번호를 제대로 입력해주세요.")
    //제대로 작성했다면!
  } else {
    fetch("http://35.212.150.195/api/user/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: Id.value,
        password: Pw.value,
      }),
    })
      // .then((response) => {
      //   //코드 200 아닐때
      //   // if (response.status === 400) {
      //   //   // resetData("아이디와 비밀번호 다시 입력해주세요.");
      //   //   response.json().then(json => console.log(json));
      //   //   alert("아이디와 비밀번호 다시 입력해주세요.")
      //   //   throw new Error("아이디와 비밀번호를 제대로 입력해주세요.");
      //   // } else if (response.status === 422 || response.status === 500) {
      //   //   throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
      //   // } else if (response.status === 200) {
      //   //  return response.json();
      //   // }
      // })
      .then((response) => {
        //ERROR HANDLER
        if (response.status !== 200) {
          response.json().then(json => {
            //하나만 만들어줄게요
            //감사합니다.
            let detail_error = json.detail
            if (detail_error.code == "ER012") {
              alert("이메일 인증이 필요합니다.")
            }else if(detail_error.code == "ER003"){ 
              alert("이메일을 입력해주세요.")
            }else if(detail_error.code === "ER004"){
              alert("비밀번호를 입력해주세요.")
            }else if(detail_error.code === "ER008"){
              alert("이메일을 다시 확인해주세요.")
            }else if(detail_error.code === "ER009"){
              alert("비밀번호가 일치하지 않습니다.")
            }else if(detail_error.code === "ER999"){
              alert("이메일을 다시 확인해주세요.")
            }
            console.log(json)
          })
        }else{
          response.json().then(data => {
            console.log(data)
            //로그인이 성공하면
            sessionStorage.setItem("access_token", data.access_token);
            sessionStorage.setItem("user_nickname", data.nickname);
            sessionStorage.setItem("user_email", data.email);
            sessionStorage.setItem("refresh_token", data.refresh_token);
            sessionStorage.setItem("user_id", data.id);
            location.href = "/";
          })
        }
      })
      .catch((error) => {
        alert(error);
      });
  }
});
