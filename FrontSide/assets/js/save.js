import { clickEnter } from "./enterEvent.js";

//url
var detectlangUrl = "http://35.212.150.195/api/papago/detectlang";
var translateUrl = "http://35.212.150.195/api/papago/translate";
var addNoteUrl = "http://35.212.150.195/api/note/add";
var refreshUrl = "http://35.212.150.195/api/user/refresh_token";
var verifyUrl = "http://35.212.150.195/api/user/verify_token";

const enSpace = document.querySelector("#en");
const koSpace = document.querySelector("#ko");
const spSpace = document.querySelector("#pr");
const saveBtn = document.querySelector("#saveBtn");
//headersApi
var apiHeaders = {
  "Content-Type": "application/json",
  Authorization: sessionStorage.getItem("access_token"),
};

//detectlang api
function detectLangFetch(textConten, translate) {
  fetch(detectlangUrl, {
    method: "post",
    headers: apiHeaders,
    body: JSON.stringify({
      text: textConten.value,
    }),
  })
    .then((response) => {
      if(response.status !== 200){
        let detail_error =  json.detail
        response.json().then(json=>{
          if(detail_error.code === "ER001"){
            alert("번역할 텍스트를 찾을 수 없습니다.")
          }else if(detail_error.code === "ER002"){
            alert("지원하지 않는 언어입니다.")
          }else if(detail_error.code === "ER013"){
            alert("로그인 후 이용해주시길 바랍니다.")
          }else if(detail_error.code === "ER014"){
            alert("재로그인이 필요합니다.")
          }else if(detail_error.code === "ER015"){
            alert("재로그인이 필요합니다.")
          }else if(detail_error.code === "ER016"){
            alert("비활성화된 유저입니다. 관리자에게 문의해주세요.")
          }
        })
      }else{
        response.json().then(data=>{
          translate;
        })
      }
      // console.log(response);
      // if (response.status === 400) {
      //   throw new Error("빈칸을 채워주세요.");
      // } else if (response.status === 401) {
      //   throw new Error("로그인한 후 이용해주세요.");
      // } else if (response.status === 422 || response.status === 500) {
      //   throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
      // } else if (response.status === 200) {
      //   return response.json();
      // }
    })
    // .then((data) => {
    //   translate;
    //   console.log(data);
    // })
    .catch((error) => {
      alert(error);
    });
}

// translate api
const getDataTranslate = (whichOne, changeValue) => {
  fetch(translateUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: sessionStorage.getItem("access_token"),
    },
    body: JSON.stringify({
      text: whichOne.value,
    }),
  })
  .then((response)=>{
    if(response.status !== 200){
      response.json().then(json=>{
        let detail_error =  json.detail;
          if(detail_error.code === "ER001"){
            alert("번역할 텍스트를 찾을 수 없습니다.")
          }else if(detail_error.code === "ER002"){
            alert("지원하지 않는 언어입니다.")
          }else if(detail_error.code === "ER013"){
            alert("로그인 후 이용해주시길 바랍니다.")
          }else if(detail_error.code === "ER014"){
            console.log("재로그인이 필요합니다.")
          }else if(detail_error.code === "ER015"){
            console.log("재로그인이 필요합니다.")
          }else if(detail_error.code === "ER016"){
            alert("비활성화된 유저입니다. 관리자에게 문의해주세요.")
          }
      })
    }else{
      response.json().then(funcData=>{
        (changeValue.value = funcData.text)
      })
    }
  })
    // .then((response) => {
    //   console.log(response);
    //   if (response.status === 400) {
    //     throw new Error("빈칸을 채워주세요.");
    //   } else if (response.status === 401) {
    //     throw new Error("로그인 후 이용해주세요.");
    //   } else if (response.status === 422 || response.status === 500) {
    //     throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
    //   } else if (response.status === 200) {
    //     return response.json();
    //   }
    // })
    // .then((funcData) => (changeValue.value = funcData.text))
    .catch((error) => {
      alert(error);
    });
};

//노트 저장할때
const noteData = () => {
  fetch(addNoteUrl, {
    method: "post",
    headers: apiHeaders,
    body: JSON.stringify({
      Korean: koSpace.value,
      English: enSpace.value,
      Speak: spSpace.value,
      Category: "스토리북A",
    }),
  })
    .then((response) => {
      if(response.status !== 200){
        response.json().then(json=>{
          let detail_error = json.detail
          if(detail_error.code === "ER013"){
            alert("로그인 후 이용해주시길 바랍니다.")
          }else if(detail_error.code ==="ER014"){
            alert("재로그인이 필요합니다.")
          }else if(detail_error.code ==="ER015"){
            alert("재로그인이 필요합니다.")
          }else if(detail_error.code ==="ER016"){
            alert("비활성화된 유저입니다. 관리자에게 문의해주세요.")
          }else if(detail_error.code ==="ER017"){
            alert("한국어 칸을 채워주세요.")
          }else if(detail_error.code ==="ER018"){
            alert("영어 칸을 채워주세요.")
          }
        })
      }else{
        response.json().then(data=>{
          console.log(data)
        })
      }
      // console.log(response);
      // if (response.status === 400) {
      //   throw new Error("한국어 칸을 채워주세요.");
      // } else if (response.status === 401) {
      //   throw new Error("로그인 후 이용해주세요.");
      // } else if (response.status === 422 || response.status === 500) {
      //   throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
      // } else if (response.status === 201) {
      //   return response.json();
      // }
    })
    // .then((data) => {
    //   console.log(data);
    // })
    .catch((error) => {
      alert(error);
    });
};

//엔터 누르면 saveBtn 클릭!

clickEnter(enSpace, saveBtn);
clickEnter(koSpace, saveBtn);
clickEnter(spSpace, saveBtn);

window.addEventListener("load", () => {
 
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
                  console.log(response.status);
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
          // console.log(res);
          // if (res.status === 422 || res.status === 500) {
          //   throw new Error("오류가 발생했습니다. 관리자에게 문의해주세요.");
          // } else if (res.status === 200) {
          //   return res.json();
          // }
        })
        // .then((data) => {
         
        // })
        .catch((error) => {
          alert(error);
        });
    } else{
      
  }
});
      //저장기능
      saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const enRegex = /^[a-z|A-Z]+$/;
        const koRegex = /^[ㄱ-ㅎ|가-힣|ㅏ-ㅣ|,]+$/;
        if (enSpace.value.length <= 0 || koSpace.value.length <= 0) {
          //형식에 맞게 입력하게 하기
          if (!enRegex.test(enSpace.value) && !koRegex.test(koSpace.value)) {
            alert("형식에 맞게 입력해주세요.");
          } else {
            let translate = confirm(
              "번역 기능을 사용해 빈칸을 채우시겠습니까?"
            );
            if (translate) {
              //영어칸이 공백일 때
              if (enSpace.value.length <= 0) {
                detectLangFetch(koSpace, getDataTranslate(koSpace, enSpace));
                enSpace.focus();
                //한국어칸이 공백일 때
              } else if (koSpace.value.length <= 0) {
                detectLangFetch(enSpace, getDataTranslate(enSpace, koSpace));
                koSpace.focus();
              }
            } else {
              alert("빈칸을 채워주세요.");
            }
          }
        } else {
          alert("저장성공");
          noteData();

          enSpace.value = "";
          koSpace.value = "";
          spSpace.value = "";
        }
      });