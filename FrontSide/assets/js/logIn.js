import { clickEnter } from "./enterEvent.js";

const Id = document.querySelector("#Id");
const Pw = document.querySelector("#Pw");
const logBtn = document.querySelector("#logInBtn");
const toRegister = document.querySelector('#toRegister');
// const inf = document.querySelector("#inf");

function resetData() {
  // inf.textContent = text;
  alert("아이디와 비밀번호를 다시 확인해주세요.")
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
    alert("이메일 제대로 입력해주세요.");
    // 비밀번호가 6자리 이하라면
  } else if (Pw.value.length <= 6) {
    Pw.focus();
    alert("비밀번호를 제대로 입력해주세요.");
    //제대로 작성했다면!
  } else {
    fetch("http://3.34.125.70:83/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: Id.value,
        password: Pw.value,
      }),
    })
      .then((response) => {
        //코드 200 아닐때
        if (response.status !== 200) {
          alert("아이디혹은 비밀번호가 일치하지 안습니다.");//resetData
          throw new Error("400 아니면 500 에러남");
          //코드 200일 때
        } else {
          return response.json();
        }
      })
      .then((data) => {
        //console.log(data);
        //resetData();
        sessionStorage.setItem("access-token", data.access_token);
        localStorage.setItem("refresh-token", data.refresh_token);
        sessionStorage.setItem("user_id", data.id);
        sessionStorage.setItem("user_name", data.nickname);
        location.href = "/"; //이대로가 맞음
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

toRegister.addEventListener('click',(e)=>{
  e.preventDefault();
  location.href = "/register";
})
