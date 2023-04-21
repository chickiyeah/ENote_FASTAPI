
let load = ()=>{
    const atoken = localStorage.getItem("refresh-token")
    const nickname = sessionStorage.getItem("user_name")
    const profile = document.querySelector(".profile");
    /**
                <p id="logProfile"><a href="#">SU</a></p>
                <ul class="profile-hide"> 
                    <li><a href="/mypage">내계정</a></li>
                    <li><a href="/mypage/unregister">탈퇴하기</a></li>
                    <li id="logOutBtn"><a href="#">로그아웃</a></li>              
                </ul>
     */
    console.log(atoken)
    if (atoken == null) {
        console.log(atoken == null)
        profile.insertAdjacentHTML('beforeend',`<p id="logProfile"><a href="/login"><i class="fa-solid fa-right-to-bracket"></i></a></p>`)
        return
    }else{
        //node = document.createElement("")
        profile.insertAdjacentHTML('beforeend',`<p id="logProfile"><a href="#">${nickname}</a></p>
        <ul class="profile-hide"> 
            <li><a href="/mypage">내계정</a></li>
            <li><a href="/mypage/unregister">탈퇴하기</a></li>
            <li id="logOutBtn"><a href="#">로그아웃</a></li>              
        </ul>`)

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
                // console.log(0);
                $(this).next().slideToggle("fast");
              });
          });

        const outBtn = document.querySelector("#logOutBtn");

        outBtn.addEventListener("click", (e) => {
          e.preventDefault();
          fetch("http://3.34.125.70:83/api/user/logout", {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Authorization: sessionStorage.getItem("access-token"),
            },
            body: JSON.stringify({
              access_token: sessionStorage.getItem("access-token"),
            }),
          })
            .then((response) => {
              if (response.status !== 200) {
                throw new Error("400 아니면 500 에러남");
              } else {
                return response.json();
              }
            })
            .then((data) => {
              console.log(data);
              localStorage.clear()
              sessionStorage.clear()
              location.href = "/";
            })
            .catch((error) => {
              console.log(error);
            });
        });
    }
}
window.onload(load())