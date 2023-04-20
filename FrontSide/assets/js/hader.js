window.addEventListener('load',()=>{
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
        profile.insertAdjacentHTML('beforeend',`<p id="logProfile"><a><svg class="svg-inline--fa fa-right-to-bracket" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="right-to-bracket" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"></path></svg></i></a></p>
`)
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
})